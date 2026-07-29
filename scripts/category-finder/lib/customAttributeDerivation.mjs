// Per-leaf synthetic attribute derivation, extracted from
// fetch-catalogue-snapshot.mjs so it's directly unit-testable against
// fixtures (a Map, not a live product) rather than only exercisable via a
// real network fetch.
//
// Takes the full per-product {attributeName -> Set(values)} map (BEFORE
// it's folded into the aggregate stats) and mutates it in place. Two
// families of derivers:
//   - the 3 Material reclassifications (Beanies Fabric, Coaster Material,
//     Metal Pens primary body material) -- see materialClassifiers.mjs for
//     exactly why these three, and not the other 6 owner-requested
//     attributes, can work without a backend change.
//   - the Workwear Visibility/Compliance split (all 14 PX-* leaves).
// Each deriver REPLACES the raw source attribute it reads (deleting it from
// the map) with its clean derived value(s), so a customer is never shown
// both the messy raw attribute and the clean derived one as two redundant
// "what's it made of"/"is it compliant" questions side by side.

import { classifyBeanieFabric, classifyCoasterMaterial, classifyMetalPenMaterial } from "./materialClassifiers.mjs";

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

/**
 * @param {string} leafId
 * @param {Map<string, Set<string>>} perProductValues - mutated in place
 */
export function applyCustomAttributeDerivation(leafId, perProductValues) {
  if (leafId === "PK-02") {
    const fabric = classifyBeanieFabric([...(perProductValues.get("Material") || [])]);
    perProductValues.delete("Material");
    if (fabric) perProductValues.set("Fabric", new Set([fabric]));
  } else if (leafId === "PM-07") {
    const material = classifyCoasterMaterial([...(perProductValues.get("Material") || [])]);
    perProductValues.delete("Material");
    if (material) perProductValues.set("Coaster Material", new Set([material]));
  } else if (leafId === "PY-06") {
    const { classification } = classifyMetalPenMaterial([...(perProductValues.get("Material") || [])]);
    perProductValues.delete("Material");
    if (classification) perProductValues.set("Primary Body Material", new Set([classification]));
  } else if (WORKWEAR_LEAF_IDS.has(leafId)) {
    const { visibility, otherCompliance } = splitWorkwearCompliance([...(perProductValues.get("Compliance") || [])]);
    perProductValues.delete("Compliance");
    if (visibility) perProductValues.set("Visibility", new Set([visibility]));
    if (otherCompliance.length > 0) perProductValues.set("Compliance", new Set(otherCompliance));
  }
}
