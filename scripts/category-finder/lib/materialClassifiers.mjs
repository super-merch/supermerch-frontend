// Per-leaf Material-attribute reclassification for the 3 owner decisions
// that can genuinely work with the EXISTING backend today: Beanies Fabric,
// Coaster Material, and Metal Pens primary body material. All three reuse
// the real "Material" value(s) already present in
// product.categorisation.promodata_attributes -- unlike Cap Type/Notebook
// Size/Umbrella Size/Bag Size/Lanyard Width/Candle Size (which need data
// that lives only in product.details or the product name/description, and
// the backend's attribute_name/attribute_value filter has been confirmed
// (live) to only ever match promodata_attributes -- see
// scripts/category-finder/BACKEND_BLOCKED_ATTRIBUTES.md), these three need
// no backend change: the raw Material tag is already filterable, it just
// currently ships unclean (packaging/accent materials mixed in with real
// primary-material values).
//
// Each classifier takes the full Set/array of raw Material values TAGGED ON
// ONE PRODUCT (co-occurrence matters for Metal Pens specifically -- a
// product tagged both "Aluminium" and "Bamboo" is a metal pen with a bamboo
// accent, not two separate materials) and returns the single controlled
// value that product should be classified under, or null if none applies.

import { dedupeValueStats } from "./valueDedup.mjs";

function normalize(value) {
  return String(value).trim().toLowerCase();
}

/**
 * Groups a leaf's REAL, raw "Material" value stats into a short, controlled
 * family list, using the same per-value keyword classification as
 * classifyBeanieFabric/classifyCoasterMaterial -- mirrors
 * colourNormalization.mjs's buildColourFamilyOptions exactly, for the same
 * reason: a derived classification LABEL (e.g. "Bamboo/Wood") is not a real
 * backend field, but a comma-joined list of the REAL raw synonyms that
 * classify into that bucket IS filterable (the backend already ORs
 * comma-separated values under one attribute_name -- see
 * getAllV2Products.js's groupedValues/$or construction).
 *
 * ONLY valid for classifiers that decide a bucket from ONE raw value in
 * isolation (Beanies Fabric, Coasters Material) -- NOT for
 * classifyMetalPenMaterial's compound buckets, which require co-occurrence
 * of two raw tags on the SAME product and cannot be reconstructed from a
 * per-value grouping (see BACKEND_BLOCKED_ATTRIBUTES.md for why).
 *
 * @param {Array<{value: string, productCount: number}>} materialValues - a
 *   leaf's real, raw "Material" attribute stat's values (NOT pre-classified)
 * @param {(values: string[]) => string|null} classifierFn - classifyBeanieFabric
 *   or classifyCoasterMaterial, called with a single-element array per raw value
 * @returns {Array<{label: string, value: string}>} sorted by product count
 *   descending; `value` is a comma-joined list of the real raw synonyms that
 *   fall into that bucket, ready to pass straight through as attribute_value
 */
export function buildMaterialFamilyOptions(materialValues, classifierFn) {
  const deduped = dedupeValueStats((materialValues || []).filter((v) => v.productCount > 0));
  const bucketRawValues = new Map(); // bucket label -> [{value, productCount}]
  for (const entry of deduped) {
    const bucket = classifierFn([entry.value]);
    if (!bucket) continue; // e.g. Beanies' packaging-only values (Cardboard/Paper) -- never grouped under any bucket
    if (!bucketRawValues.has(bucket)) bucketRawValues.set(bucket, []);
    bucketRawValues.get(bucket).push(entry);
  }
  const options = [...bucketRawValues.entries()].map(([label, entries]) => ({
    label,
    value: entries.map((e) => e.value).join(","),
    productCount: entries.reduce((sum, e) => sum + e.productCount, 0),
  }));
  return options.sort((a, b) => b.productCount - a.productCount).map(({ label, value }) => ({ label, value }));
}

// --- Beanies Fabric (PK-02) ---------------------------------------------
// Real distinct Material values observed for PK-02: Acrylic, Cardboard,
// Cotton 100%, Paper, Polyester 100%. Cardboard/Paper are packaging/hang-tag
// artifacts, never a beanie's actual knit fabric -- excluded entirely, never
// shipped as a "fabric" choice. Wool/Recycled Polyester are in the owner's
// approved list but were NOT observed in this leaf's real data at audit
// time; kept in the dictionary since they're genuine beanie fabrics that
// may appear in a future audit, but see the coverage report requirement --
// never claim an option is populated without checking the real numbers.
const BEANIE_FABRIC_KEYWORDS = [
  ["Acrylic", ["acrylic"]],
  ["Wool", ["wool"]],
  ["Cotton", ["cotton"]],
  ["Recycled Polyester", ["recycled polyester", "rpet"]],
  ["Polyester", ["polyester"]],
];
const BEANIE_NON_FABRIC_VALUES = new Set(["cardboard", "paper"]);

/**
 * @param {string[]} materialValues - raw Material values tagged on one product
 * @returns {string|null} - one of BEANIE_FABRIC_KEYWORDS' labels, "Blend" if
 *   >=2 distinct real fabrics are tagged, "Other" if a real (non-packaging)
 *   Material value is present but matches no known fabric keyword, or null
 *   if nothing usable is tagged at all (never guess from lining/trim/decoration
 *   -- there is no such data here to guess from in the first place, only
 *   whatever Material values the product itself carries).
 */
export function classifyBeanieFabric(materialValues) {
  const real = (materialValues || []).map(normalize).filter((v) => v && !BEANIE_NON_FABRIC_VALUES.has(v));
  if (real.length === 0) return null;
  const matched = new Set();
  for (const v of real) {
    const hit = BEANIE_FABRIC_KEYWORDS.find(([, kws]) => kws.some((kw) => v.includes(kw)));
    matched.add(hit ? hit[0] : "Other");
  }
  if (matched.size > 1) return "Blend";
  return [...matched][0];
}

// --- Coaster Material (PM-07) -------------------------------------------
// Real distinct Material values observed for PM-07 (25): Acrylic, Bamboo,
// Cardboard, Ceramic, Cork, Cotton 100%, Cotton Rich Blend, Glass, Jute,
// Leather, Neoprene, PVC, Paper, Polyester 100%, Polyester Rich Blend,
// Polyester Sublimated, Polyethylene, Polypropylene, Silicone, Stainless
// Steel, Synthetic, Vinyl, Wheat Straw, Wood, rPET.
// "Stone" (one of the owner's 8 approved values) was NOT observed at all in
// this leaf's real data -- never shipped as an option with zero backing
// products; report this gap rather than inventing coverage.
// Ceramic/Glass/Jute/Cotton/Polyester/rPET/Leather have no honest home in
// the owner's 8-value list and fall to "Other" rather than being forced
// into a family they don't really belong to.
const COASTER_MATERIAL_KEYWORDS = [
  ["Cork", ["cork"]],
  ["Bamboo/Wood", ["bamboo", "wood", "wheat straw"]],
  ["Stone", ["stone", "slate", "marble", "granite"]],
  ["Silicone/Rubber", ["silicone", "neoprene", "rubber"]],
  ["Plastic/Acrylic", ["acrylic", "pvc", "polyethylene", "polypropylene", "synthetic", "vinyl"]],
  ["Metal", ["stainless steel", "aluminium", "metal"]],
  ["Paper/Cardboard", ["cardboard", "paper"]],
];

/**
 * @param {string[]} materialValues - raw Material values tagged on one product
 * @returns {string|null} - one of COASTER_MATERIAL_KEYWORDS' labels, "Other"
 *   if a Material value is present but matches none of them, or null if no
 *   Material value is tagged on this product at all.
 */
export function classifyCoasterMaterial(materialValues) {
  const real = (materialValues || []).map(normalize).filter(Boolean);
  if (real.length === 0) return null;
  for (const v of real) {
    const hit = COASTER_MATERIAL_KEYWORDS.find(([, kws]) => kws.some((kw) => v.includes(kw)));
    if (hit) return hit[0];
  }
  return "Other";
}

// --- Metal Pens primary body material (PY-06) ---------------------------
// Real distinct Material values observed for PY-06 (15): Aluminium, Bamboo,
// Cardboard, Cork, Leather, Metal (non-specific), PVC, Paper, Plastic
// (non-specific), Polyester 100%, Silicone, Stainless Steel, Wheat Straw,
// Wood, rPET. The reported problem (bamboo/silicone/leather/cork/plastic/
// cardboard appearing in a "Metal Pens" Material list) is real: these
// values describe an ACCENT or a gift-box's packaging, not the pen's own
// barrel -- confirmed by inspecting real per-product co-occurrence: every
// sampled product carrying one of these non-metal values ALSO carried a
// genuine metal value on the SAME product (e.g. "Aluminium Pen with Bamboo
// Grip" -> Material: Aluminium + Material: Bamboo). This classifier is
// therefore co-occurrence-aware, not a simple per-value filter: it looks at
// every Material value tagged on ONE product together.
const METAL_KEYWORDS = [
  ["Aluminium", ["aluminium", "aluminum"]],
  ["Stainless Steel", ["stainless steel"]],
];
const OTHER_METAL_KEYWORDS = ["metal"]; // "Metal (non-specific)" and similar
const BAMBOO_KEYWORDS = ["bamboo"];
// Everything else non-metal counts as "Recycled/Other Accent" -- cork,
// leather, cardboard, paper, PVC, plastic, silicone, wheat straw, wood,
// rPET, polyester, etc. Not enumerated individually since the accent
// material's own identity isn't the point (the owner's approved value is
// the umbrella "Metal with Recycled/Other Accent", not a per-material
// breakdown), and a fixed allowlist would silently miss a genuinely new
// accent material a future supplier introduces.

/**
 * @param {string[]} materialValues - raw Material values tagged on one product
 * @returns {{ classification: string|null, isGenuineMetal: boolean }}
 *   classification is one of "Aluminium" | "Stainless Steel" | "Other Metal"
 *   | "Metal with Bamboo Accent" | "Metal with Recycled/Other Accent" | null.
 *   isGenuineMetal is false when the product has Material value(s) but NONE
 *   of them is a real metal keyword -- these are the products the owner
 *   asked to be identified and reported as possibly miscategorised into
 *   "Metal Pens", not silently classified as if they were metal.
 */
export function classifyMetalPenMaterial(materialValues) {
  const real = (materialValues || []).map(normalize).filter(Boolean);
  if (real.length === 0) return { classification: null, isGenuineMetal: null }; // no Material data at all -- can't judge either way

  let primaryMetal = null;
  for (const [label, kws] of METAL_KEYWORDS) {
    if (real.some((v) => kws.some((kw) => v.includes(kw)))) {
      primaryMetal = label;
      break;
    }
  }
  if (!primaryMetal && real.some((v) => OTHER_METAL_KEYWORDS.some((kw) => v.includes(kw)))) {
    primaryMetal = "Other Metal";
  }

  if (!primaryMetal) {
    return { classification: null, isGenuineMetal: false };
  }

  const hasBamboo = real.some((v) => BAMBOO_KEYWORDS.some((kw) => v.includes(kw)));
  const metalKeywordSet = [...METAL_KEYWORDS.flatMap(([, kws]) => kws), ...OTHER_METAL_KEYWORDS];
  const hasOtherAccent = real.some((v) => !metalKeywordSet.some((kw) => v.includes(kw)) && !BAMBOO_KEYWORDS.some((kw) => v.includes(kw)));

  if (hasBamboo) return { classification: "Metal with Bamboo Accent", isGenuineMetal: true };
  if (hasOtherAccent) return { classification: "Metal with Recycled/Other Accent", isGenuineMetal: true };
  return { classification: primaryMetal, isGenuineMetal: true };
}
