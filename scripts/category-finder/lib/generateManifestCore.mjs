// Pure core of the manifest generator, with no filesystem/network access, so
// it can be unit-tested against in-memory fixtures (a deliberately incomplete
// snapshot, a malformed attribute schema, etc.) without touching real files.
// generate-manifest.mjs (the CLI) is a thin wrapper: read files, call this,
// write files.

import { validateSnapshot } from "./schema.mjs";
import { classifyLeaf } from "./classify.mjs";
import { reconcileLeaves, reconcileParents, validateAuthoritativeInventory } from "./reconcile.mjs";

// Shared copy-field derivation for BOTH leaf and parent entries --
// getCategoryFinderConfig() (the runtime adapter both manifests are read
// through) needs finderEyebrow/finderTitle/finderDescription/itemNamePlural
// on every entry it might resolve, leaf or parent alike. A hand-authored
// override (e.g. PE-02) may supply its own exact copy -- fall back to the
// generic name-derived copy only when it doesn't.
function buildCopyFields(name, result) {
  return {
    itemNamePlural: result.itemNamePlural ?? name.toLowerCase(),
    finderEyebrow: result.finderEyebrow ?? "Find it faster",
    finderTitle: result.finderTitle ?? `Find the right ${name.toLowerCase()} in under 30 seconds`,
    finderDescription: result.finderDescription ?? "Choose what matters most and we'll narrow the range.",
  };
}

function buildManifestEntry(leaf, result) {
  return {
    categoryId: leaf.leafId,
    categoryName: leaf.leafName,
    parentCategoryId: leaf.parentId,
    parentCategoryName: leaf.parentName,
    ...buildCopyFields(leaf.leafName, result),
    menuLinked: ["promotional", "clothing", "headwear"].includes(String(leaf.navGroup || "").toLowerCase()),
    finderMode: result.finderMode,
    proposedFamily: result.proposedFamily,
    filterMappingsValidated: result.filterMappingsValidated,
    runtimeEnabled: result.runtimeEnabled,
    exclusionReason: result.finderMode === "excluded" ? result.notes[0] : null,
    dataQualityNotes: result.notes,
    questions: result.questions,
  };
}

/**
 * @param {object} snapshot - { fetchedAt, leaves: [...] }
 * @param {object} authoritative - { leaves: [{id,name,parentId,parentName}], parents: [{id,name}] }
 * @param {object} deps - { families, leafFamilyMap, leafOverrides }
 * @returns {{ leafManifest, parentManifest, reconciliation }}
 * @throws {SchemaError | ReconciliationError | HierarchyError}
 */
export function generateManifestCore(snapshot, authoritative, { families, leafFamilyMap, leafOverrides }) {
  validateAuthoritativeInventory(authoritative); // duplicate leaf/parent IDs, leaf-vs-parent collisions
  validateSnapshot(snapshot); // throws SchemaError on any invalid/missing field, including duplicate leafIds

  const leafManifest = {};
  for (const leaf of snapshot.leaves) {
    const result = classifyLeaf(leaf, { families, leafFamilyMap, leafOverrides });
    leafManifest[leaf.leafId] = buildManifestEntry(leaf, result);
  }

  const leafCounts = reconcileLeaves(leafManifest, authoritative); // throws ReconciliationError

  // Parent/group aggregate pages (e.g. "PX" Workwear, covering all of its
  // PX-* children): confirmed live that both /api/client-products and
  // /api/params-products (the endpoint real Finder pages call) already
  // return the correct aggregate when queried by the parent's own category
  // ID directly, so fetch-catalogue-snapshot.mjs audits parents through the
  // exact same fetchLeafStats used for leaves (see snapshot.parents). Once
  // that data exists, parents get a REAL classification here, the same
  // classifyLeaf every leaf gets -- not a blanket stub exclusion. A snapshot
  // fetched before this existed (snapshot.parents missing) falls back to the
  // previous stub behavior rather than crashing.
  const parentStatsById = new Map((snapshot.parents || []).map((p) => [p.leafId, p]));
  const parentManifest = {};
  for (const parent of authoritative.parents) {
    const stats = parentStatsById.get(parent.id);
    if (!stats) {
      parentManifest[parent.id] = {
        categoryId: parent.id,
        categoryName: parent.name,
        ...buildCopyFields(parent.name, {}),
        finderMode: "excluded",
        proposedFamily: null,
        filterMappingsValidated: false,
        runtimeEnabled: false,
        exclusionReason: "No live audit data for this parent/group page yet -- re-run fetch-catalogue-snapshot.mjs (which now audits parents too) before generating.",
        dataQualityNotes: [],
        questions: [],
      };
      continue;
    }
    const result = classifyLeaf(stats, { families, leafFamilyMap: {}, leafOverrides: {} });
    parentManifest[parent.id] = {
      categoryId: parent.id,
      categoryName: parent.name,
      ...buildCopyFields(parent.name, result),
      finderMode: result.finderMode,
      proposedFamily: result.proposedFamily,
      filterMappingsValidated: result.filterMappingsValidated,
      runtimeEnabled: result.runtimeEnabled,
      exclusionReason: result.finderMode === "excluded" ? result.notes[0] : null,
      dataQualityNotes: result.notes,
      questions: result.questions,
    };
  }
  reconcileParents(parentManifest, authoritative);

  const reconciliation = {
    totalLeafEntries: leafCounts.total,
    curated: leafCounts.curated,
    inherited: leafCounts.inherited,
    generic: leafCounts.generic,
    excluded: leafCounts.excluded,
    totalParentEntries: authoritative.parents.length,
  };

  return { leafManifest, parentManifest, reconciliation };
}
