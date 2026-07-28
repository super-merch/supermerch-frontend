// Pure core of the manifest generator, with no filesystem/network access, so
// it can be unit-tested against in-memory fixtures (a deliberately incomplete
// snapshot, a malformed attribute schema, etc.) without touching real files.
// generate-manifest.mjs (the CLI) is a thin wrapper: read files, call this,
// write files.

import { validateSnapshot } from "./schema.mjs";
import { classifyLeaf } from "./classify.mjs";
import { reconcileLeaves, reconcileParents, validateAuthoritativeInventory } from "./reconcile.mjs";

function buildManifestEntry(leaf, result) {
  return {
    categoryId: leaf.leafId,
    categoryName: leaf.leafName,
    parentCategoryId: leaf.parentId,
    parentCategoryName: leaf.parentName,
    // A hand-authored override (e.g. PE-02) may supply its own exact copy --
    // fall back to the generic leafName-derived copy only when it doesn't.
    itemNamePlural: result.itemNamePlural ?? leaf.leafName.toLowerCase(),
    finderEyebrow: result.finderEyebrow ?? "Find it faster",
    finderTitle: result.finderTitle ?? `Find the right ${leaf.leafName.toLowerCase()} in under 30 seconds`,
    finderDescription: result.finderDescription ?? "Choose what matters most and we'll narrow the range.",
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

  const parentManifest = {};
  for (const parent of authoritative.parents) {
    parentManifest[parent.id] = {
      categoryId: parent.id,
      categoryName: parent.name,
      finderMode: "excluded",
      proposedFamily: null,
      filterMappingsValidated: false,
      runtimeEnabled: false,
      exclusionReason: "Parent/group aggregate pages are out of scope for this rollout -- fetch-catalogue-snapshot.mjs only audits leaf categories. A parent-page Finder would need its own aggregate-audit approach and is a separate, not-yet-scoped piece of work.",
      dataQualityNotes: [],
      questions: [],
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
