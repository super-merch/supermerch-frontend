// Pure core of the manifest generator, with no filesystem/network access, so
// it can be unit-tested against in-memory fixtures (a deliberately incomplete
// snapshot, a malformed attribute schema, etc.) without touching real files.
// generate-manifest.mjs (the CLI) is a thin wrapper: read files, call this,
// write files.

import { validateSnapshot } from "./schema.mjs";
import { classifyLeaf } from "./classify.mjs";
import { reconcileLeaves, reconcileParents } from "./reconcile.mjs";

function buildManifestEntry(leaf, result) {
  return {
    categoryId: leaf.leafId,
    categoryName: leaf.leafName,
    parentCategoryId: leaf.parentId,
    parentCategoryName: leaf.parentName,
    itemNamePlural: leaf.leafName.toLowerCase(),
    finderEyebrow: "Find it faster",
    finderTitle: `Find the right ${leaf.leafName.toLowerCase()} in under 30 seconds`,
    finderDescription: "Choose what matters most and we'll narrow the range.",
    menuLinked: ["promotional", "clothing", "headwear"].includes(String(leaf.navGroup || "").toLowerCase()),
    finderMode: result.finderMode,
    proposedFamily: result.proposedFamily,
    filterMappingsValidated: result.filterMappingsValidated,
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
  validateSnapshot(snapshot); // throws SchemaError on any invalid/missing field

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
      exclusionReason: "Parent-page aggregate audit not yet wired into fetch-catalogue-snapshot.mjs -- classified as excluded until real data is available (PR2).",
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
