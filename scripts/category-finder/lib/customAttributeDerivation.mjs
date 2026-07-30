// Per-leaf synthetic attribute derivation, extracted from
// fetch-catalogue-snapshot.mjs so it's directly unit-testable against
// fixtures (a Map, not a live product) rather than only exercisable via a
// real network fetch.
//
// Takes the full per-product {attributeName -> Set(values)} map (BEFORE
// it's folded into the aggregate stats) and mutates it in place. Only
// derivations that genuinely need PER-PRODUCT context (multiple raw values
// on the SAME product considered together) belong here:
//   - Metal Pens primary body material -- co-occurrence-aware (a metal
//     keyword AND a bamboo keyword on the same product means "bamboo
//     accent", not two separate materials).
//   - the Workwear Visibility/Compliance split (all 14 PX-* leaves).
// Each deriver REPLACES the raw source attribute it reads (deleting it from
// the map) with its clean derived value(s), so a customer is never shown
// both the messy raw attribute and the clean derived one as two redundant
// questions side by side.
//
// Beanies Fabric and Coasters Material are NOT here -- see the comment
// inside applyCustomAttributeDerivation for why they moved to
// classify.mjs/materialClassifiers.mjs instead.

import { classifyMetalPenMaterial } from "./materialClassifiers.mjs";

function normalizeForCompare(v) {
  return String(v).trim().toLowerCase();
}

// Splits the raw "Compliance" attribute into a dedicated, honestly-labeled
// "Visibility" question (Hi-Vis only -- see families.js's workwear_visibility
// family for why a customer-facing "Non-Hi-Vis" option cannot be offered:
// the backend's attribute filter is confirmed positive-match-only, no
// negation) and a separate "Compliance" question for the OTHER real
// certification values (rail compliance, UPF rating) with Hi-Vis excluded --
// shipping the raw, unsplit "Compliance" attribute would mix "is this
// garment Hi-Vis" with "is this garment rail-compliant" in one dropdown,
// which is not the same question a customer is actually asking.
export function splitWorkwearCompliance(complianceValues) {
  const values = complianceValues || [];
  const hasHiVis = values.some((v) => normalizeForCompare(v) === "hi-vis");
  const otherCompliance = values.filter((v) => normalizeForCompare(v) !== "hi-vis");
  return { visibility: hasHiVis ? "Hi-Vis" : null, otherCompliance };
}

// The 14 Workwear (PX group) leaves -- mechanically the full authoritative
// PX-* set, not just the 10 the owner named by example, so any PX leaf with
// real Compliance data gets the same honest Visibility/Compliance split.
export const WORKWEAR_LEAF_IDS = new Set(["PX-01", "PX-02", "PX-03", "PX-04", "PX-05", "PX-06", "PX-07", "PX-08", "PX-09", "PX-10", "PX-11", "PX-12", "PX-13", "PX-14"]);
// The "PX" parent/group aggregate page itself (covering all 14 leaves above)
// must get the identical split -- otherwise the parent page would show the
// old, unsplit "Compliance" dropdown while every one of its own child leaf
// pages shows the clean Visibility/Compliance split, an inconsistency a
// customer could notice browsing from the parent page down into a leaf.
const WORKWEAR_PARENT_ID = "PX";

/**
 * @param {string} leafId
 * @param {Map<string, Set<string>>} perProductValues - mutated in place
 */
export function applyCustomAttributeDerivation(leafId, perProductValues) {
  // Beanies (PK-02) and Coasters (PM-07) are DELIBERATELY not handled here
  // any more -- their Fabric/Coaster Material classification is a simple
  // per-VALUE grouping (each raw Material synonym maps to exactly one bucket
  // independent of what else is on the product), so it's built at
  // generate-manifest time instead, directly from the leaf's real raw
  // Material stat (see classify.mjs's MATERIAL_FAMILY_LEAF_CONFIG +
  // materialClassifiers.mjs's buildMaterialFamilyOptions). Doing it here,
  // per-product, discarded which raw synonym produced the classification,
  // which meant the shipped filter value was the derived bucket LABEL
  // ("Bamboo/Wood") instead of a real backend-filterable raw value --
  // confirmed live to always return zero results. Metal Pens' classification
  // genuinely needs per-product co-occurrence (a metal keyword AND a bamboo
  // keyword on the SAME product), which can't be reconstructed after the
  // fact from per-value stats alone, so it stays here.
  if (leafId === "PY-06") {
    const { classification } = classifyMetalPenMaterial([...(perProductValues.get("Material") || [])]);
    perProductValues.delete("Material");
    if (classification) perProductValues.set("Primary Body Material", new Set([classification]));
  } else if (WORKWEAR_LEAF_IDS.has(leafId) || leafId === WORKWEAR_PARENT_ID) {
    const { visibility, otherCompliance } = splitWorkwearCompliance([...(perProductValues.get("Compliance") || [])]);
    perProductValues.delete("Compliance");
    if (visibility) perProductValues.set("Visibility", new Set([visibility]));
    if (otherCompliance.length > 0) perProductValues.set("Compliance", new Set(otherCompliance));
  }
}
