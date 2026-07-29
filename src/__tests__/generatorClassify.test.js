import { describe, expect, it } from "vitest";
import { classifyLeaf, buildAttributeOptions, buildColourOptions } from "../../scripts/category-finder/lib/classify.mjs";

const FAMILIES = {
  clothing_gender_fit: { requiredAttribute: "Gender Fit", optionalAttribute: "Sleeves", applicableGroups: ["PU", "PN"] },
};

function round1(n, d) {
  return d > 0 ? Math.round((n / d) * 1000) / 10 : 0;
}

// Builds a schema-valid attribute stat fixture for the straightforward case
// where every sampled product has at most one value for this attribute (no
// multi-value overlap) -- taggedProductCount is then just the sum of
// per-value productCounts. Tests needing multi-value overlap construct their
// attribute stat directly instead of using this helper.
function attr(name, values, { sampleSize = 100 } = {}) {
  const sorted = [...values].sort((a, b) => b.productCount - a.productCount);
  const simpleTagged = sorted.reduce((s, v) => s + v.productCount, 0);
  return {
    name,
    sampleSize,
    taggedProductCount: simpleTagged,
    valueOccurrenceCount: simpleTagged,
    populatedPct: round1(simpleTagged, sampleSize),
    distinctValues: values.length,
    topValueProductCount: sorted[0].productCount,
    topShare: round1(sorted[0].productCount, simpleTagged),
    values: sorted,
  };
}

const usableGenderFit = attr("Gender Fit", [
  { value: "Mens", productCount: 40 },
  { value: "Ladies", productCount: 30 },
  { value: "Unisex", productCount: 20 },
  { value: "Kids", productCount: 10 },
]);

describe("buildAttributeOptions", () => {
  it("builds one option per positive-productCount value, sorted by productCount desc, using the raw value as the URL value", () => {
    const options = buildAttributeOptions(usableGenderFit);
    expect(options).toEqual([
      { label: "Mens", value: "Mens" },
      { label: "Ladies", value: "Ladies" },
      { label: "Unisex", value: "Unisex" },
      { label: "Kids", value: "Kids" },
    ]);
  });

  it("drops zero-productCount values", () => {
    const options = buildAttributeOptions(attr("X", [{ value: "A", productCount: 5 }, { value: "B", productCount: 0 }]));
    expect(options.map((o) => o.value)).toEqual(["A"]);
  });

  it("drops values that look like internal/supplier fields defensively", () => {
    const options = buildAttributeOptions(attr("X", [{ value: "Supplier Code", productCount: 5 }, { value: "Real Value", productCount: 3 }]));
    expect(options.map((o) => o.value)).toEqual(["Real Value"]);
  });

  it("merges case/whitespace duplicate raw values into one option instead of shipping a duplicate visible label", () => {
    const options = buildAttributeOptions(attr("Material", [{ value: "Steel", productCount: 40 }, { value: "steel", productCount: 10 }, { value: "Plastic", productCount: 5 }]));
    expect(options).toHaveLength(2);
    const steel = options.find((o) => o.value === "Steel");
    expect(steel).toBeDefined();
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length); // no duplicate visible labels
  });
});

describe("buildColourOptions", () => {
  it("returns null when colour population is below threshold", () => {
    expect(buildColourOptions({ colourPopulatedPct: 10, colourValues: [{ value: "Black", productCount: 5 }, { value: "White", productCount: 3 }] })).toBeNull();
  });

  it("returns null when fewer than 2 distinct colour values exist even if population is high", () => {
    expect(buildColourOptions({ colourPopulatedPct: 90, colourValues: [{ value: "Black", productCount: 50 }] })).toBeNull();
  });

  it("returns real options sorted by productCount when usable", () => {
    const options = buildColourOptions({ colourPopulatedPct: 80, colourValues: [{ value: "White", productCount: 10 }, { value: "Black", productCount: 40 }] });
    expect(options).toEqual([{ label: "Black", value: "Black" }, { label: "White", value: "White" }]);
  });

  it("groups a large raw colour list into a short controlled family list instead of shipping every raw shade", () => {
    const manyShades = [
      { value: "Navy", productCount: 50 },
      { value: "Royal Blue", productCount: 40 },
      { value: "Sky Blue", productCount: 30 },
      { value: "Black", productCount: 60 },
      { value: "Charcoal", productCount: 20 },
      { value: "Ecru", productCount: 5 },
      { value: "Burgundy", productCount: 4 },
    ];
    const options = buildColourOptions({ colourPopulatedPct: 80, colourValues: manyShades });
    expect(options.length).toBeLessThan(manyShades.length);
    expect(options.map((o) => o.label)).toEqual(["Blue", "Black", "Grey / Silver", "Natural / Beige", "Red"]);
  });

  it("collapses case/whitespace colour duplicates before building options (no duplicate visible labels)", () => {
    const options = buildColourOptions({ colourPopulatedPct: 80, colourValues: [{ value: "Natural", productCount: 10 }, { value: "natural", productCount: 4 }, { value: "Black", productCount: 5 }] });
    const labels = options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("classifyLeaf: exclusion", () => {
  it("excludes a zero-product leaf with a reason, and both gates false", () => {
    const result = classifyLeaf({ leafId: "MISC-01", leafName: "Misc Headwear", productCount: 0, exclusionReason: "productMatchRules empty" }, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.finderMode).toBe("excluded");
    expect(result.questions).toHaveLength(0);
    expect(result.filterMappingsValidated).toBe(false);
    expect(result.runtimeEnabled).toBe(false);
    expect(result.notes[0]).toMatch(/productMatchRules empty/);
  });

  it("excludes a fetchFailed leaf with its failure reason, distinct from a zero-product exclusion", () => {
    const result = classifyLeaf(
      { leafId: "PU", leafName: "Shirts", productCount: 2200, fetchFailed: true, fetchFailureReason: "All 5 stratified page fetches failed." },
      { families: {}, leafFamilyMap: {}, leafOverrides: {} }
    );
    expect(result.finderMode).toBe("excluded");
    expect(result.questions).toHaveLength(0);
    expect(result.filterMappingsValidated).toBe(false);
    expect(result.runtimeEnabled).toBe(false);
    expect(result.notes[0]).toMatch(/stratified page fetches failed/);
  });
});

describe("classifyLeaf: coverage judged against the sample, not the full category (the core bug fix)", () => {
  it("classifies as usable a large category where the ATTRIBUTE sample is well-covered, even though sample << productCount", () => {
    // 738-product category, 100 sampled, 92 of the 100 tagged -- must be
    // judged as 92% covered (usable), never as 92/738 = 12.5% (unusable).
    const wellCoveredAttr = {
      name: "Capacity",
      sampleSize: 100,
      taggedProductCount: 92,
      valueOccurrenceCount: 92,
      populatedPct: 92,
      distinctValues: 3,
      topValueProductCount: 40,
      topShare: round1(40, 92),
      values: [{ value: "500ml", productCount: 40 }, { value: "750ml", productCount: 32 }, { value: "1L", productCount: 20 }],
    };
    const leaf = { leafId: "PE-02", parentId: "PE", productCount: 738, auditMode: "sampled_estimate", attributes: [wellCoveredAttr], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.finderMode).toBe("generic");
    expect(result.questions.some((q) => q.attributeName === "Capacity")).toBe(true);
  });
});

describe("classifyLeaf: family inheritance and applicableGroups enforcement", () => {
  const leaf = { leafId: "PU-01", parentId: "PU", productCount: 200, attributes: [usableGenderFit], colourPopulatedPct: 0 };

  it("inherits when the leaf's family is mapped AND its group is in applicableGroups", () => {
    const result = classifyLeaf(leaf, { families: FAMILIES, leafFamilyMap: { "PU-01": "clothing_gender_fit" }, leafOverrides: {} });
    expect(result.finderMode).toBe("inherited");
    expect(result.proposedFamily).toBe("clothing_gender_fit");
  });

  it("does NOT inherit when the leaf's group is not in applicableGroups, even if mapped", () => {
    const outsideGroupLeaf = { ...leaf, leafId: "PK-01", parentId: "PK" };
    const result = classifyLeaf(outsideGroupLeaf, { families: FAMILIES, leafFamilyMap: { "PK-01": "clothing_gender_fit" }, leafOverrides: {} });
    expect(result.finderMode).not.toBe("inherited");
    expect(result.notes.some((n) => /applicableGroups/.test(n))).toBe(true);
  });
});

describe("classifyLeaf: question ordering and shape invariants", () => {
  it("quantity is always first, budget always second, colour always last when present", () => {
    const material = attr("Material", [{ value: "Steel", productCount: 40 }, { value: "Plastic", productCount: 30 }]);
    const leaf = {
      leafId: "X-03",
      parentId: "X",
      productCount: 100,
      attributes: [material],
      colourPopulatedPct: 80,
      colourValues: [{ value: "Black", productCount: 40 }, { value: "White", productCount: 30 }],
    };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const ids = result.questions.map((q) => q.id);
    expect(ids[0]).toBe("moq");
    expect(ids[1]).toBe("budget");
    expect(ids[ids.length - 1]).toBe("colour");
  });
});

describe("classifyLeaf: presence-mode family attribute (e.g. Workwear Visibility)", () => {
  const PRESENCE_FAMILIES = {
    workwear_visibility: { requiredAttribute: "Gender Fit", optionalAttribute: "Visibility", optionalAttributeMode: "presence", applicableGroups: ["PX"] },
  };

  // Visibility is a single-value ("Hi-Vis") presence attribute by design --
  // fetch-catalogue-snapshot.mjs's splitWorkwearCompliance already separated
  // it from the OTHER real Compliance values (rail compliance, UPF rating)
  // before this stage ever sees it, so unlike the raw multi-value Compliance
  // attribute this replaced, a Visibility stat never carries more than 1
  // distinct value.
  function visibilityAttr(productCount, sampleSize) {
    return {
      name: "Visibility",
      sampleSize,
      taggedProductCount: productCount,
      valueOccurrenceCount: productCount,
      populatedPct: round1(productCount, sampleSize),
      distinctValues: 1,
      topValueProductCount: productCount,
      topShare: 100,
      values: [{ value: "Hi-Vis", productCount }],
    };
  }

  it("selects a presence attribute even though Hi-Vis is the ONLY value it ever carries (the real, already-split case)", () => {
    const visibility = visibilityAttr(55, 94);
    const leaf = { leafId: "PX-04", parentId: "PX", productCount: 114, attributes: [usableGenderFit, visibility], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: PRESENCE_FAMILIES, leafFamilyMap: { "PX-04": "workwear_visibility" }, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Visibility");
    expect(q).toBeDefined();
    expect(q.options).toEqual([{ label: "Hi-Vis", value: "Hi-Vis" }]);
    expect(q.singleValueAllowed).toBe(true);
  });

  // Live-verification-caught bug: "Visibility" is a derived stat name that
  // exists only for clean classification (see customAttributeDerivation.mjs)
  // -- product.categorisation.promodata_attributes never stores a
  // "Visibility" field, only the original "Compliance" one. Confirmed live:
  // attribute_name=Visibility returned item_count 0 against production for
  // every PX-* leaf and the PX parent, silently stripping the question from
  // every one of them on the last verification pass. The question's LABEL
  // may be the clean derived name, but attributeName -- the field Cards.jsx
  // sends as the literal `attribute_name` request param -- must be the real
  // backend field, "Compliance".
  it("builds the Visibility question's attributeName as the REAL backend field (Compliance), not the derived display name", () => {
    const visibility = visibilityAttr(55, 94);
    const leaf = { leafId: "PX-04", parentId: "PX", productCount: 114, attributes: [usableGenderFit, visibility], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: PRESENCE_FAMILIES, leafFamilyMap: { "PX-04": "workwear_visibility" }, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Visibility");
    expect(q.attributeName).toBe("Compliance");
    expect(q.options).toEqual([{ label: "Hi-Vis", value: "Hi-Vis" }]); // the VALUE is unaffected -- only the field name changes
  });

  it("still rejects near-zero or near-total coverage even in presence mode", () => {
    const sparseVisibility = visibilityAttr(1, 25); // 4%, below MIN_PRESENCE_COVERAGE
    const leaf = { leafId: "PX-10", parentId: "PX", productCount: 25, attributes: [usableGenderFit, sparseVisibility], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: PRESENCE_FAMILIES, leafFamilyMap: { "PX-10": "workwear_visibility" }, leafOverrides: {} });
    expect(result.questions.find((x) => x.attributeName === "Visibility")).toBeUndefined();
  });

  it("does not mark singleValueAllowed for a regular (non-presence) categorical attribute with just 1 option", () => {
    // A generic single-value attribute is excluded entirely by isAttributeUsable's
    // MIN_DISTINCT_VALUES rule -- confirms presence mode is genuinely opt-in per family,
    // not a global relaxation of the single-value rule.
    const leaf = { leafId: "X-09", parentId: "X", productCount: 100, attributes: [attr("Material", [{ value: "Steel", productCount: 90 }])], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.questions.some((q) => q.attributeName === "Material")).toBe(false);
  });
});

// Live-verification-caught bug, same root cause as Visibility above: Metal
// Pens' "Primary Body Material" and Coasters' "Coaster Material" are BOTH
// derived stat names from customAttributeDerivation.mjs, reclassifying the
// real "Material" attribute -- but product.categorisation.promodata_attributes
// never stores those derived names, only the original "Material". Confirmed
// live: attribute_name=Primary Body Material and attribute_name=Coaster
// Material both returned item_count 0 against production, silently
// stripping the question from Metal Pens and Coasters on the previous
// verification pass -- the exact same bug as Visibility, just missed for
// these two derived names in the first fix.
describe("classifyLeaf: generic-fallback derived attribute names also resolve to their real backend field", () => {
  it("Metal Pens: 'Primary Body Material' question's attributeName resolves to the real backend field 'Material'", () => {
    const material = attr("Primary Body Material", [
      { value: "Aluminium", productCount: 40 },
      { value: "Stainless Steel", productCount: 30 },
      { value: "Other Metal", productCount: 20 },
    ]);
    const leaf = { leafId: "PY-06", parentId: "PY", productCount: 100, attributes: [material], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Primary Body Material");
    expect(q).toBeDefined();
    expect(q.attributeName).toBe("Material");
  });

  it("Coasters: 'Coaster Material' question's attributeName resolves to the real backend field 'Material'", () => {
    const material = attr("Coaster Material", [
      { value: "Cork", productCount: 40 },
      { value: "Bamboo/Wood", productCount: 30 },
      { value: "Silicone/Rubber", productCount: 20 },
    ]);
    const leaf = { leafId: "PM-07", parentId: "PM", productCount: 100, attributes: [material], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Coaster Material");
    expect(q).toBeDefined();
    expect(q.attributeName).toBe("Material");
  });

  it("Beanies: 'Fabric' question's attributeName resolves to the real backend field 'Material' (future-proofed even though it doesn't ship today for coverage reasons)", () => {
    const fabric = attr("Fabric", [
      { value: "Acrylic", productCount: 40 },
      { value: "Wool", productCount: 30 },
      { value: "Cotton", productCount: 20 },
    ]);
    const leaf = { leafId: "PK-02", parentId: "PK", productCount: 100, attributes: [fabric], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Fabric");
    expect(q).toBeDefined();
    expect(q.attributeName).toBe("Material");
  });

  it("a leaf's own genuinely real, non-derived 'Material' attribute is completely unaffected -- attributeName stays 'Material'", () => {
    const material = attr("Material", [
      { value: "Steel", productCount: 40 },
      { value: "Plastic", productCount: 30 },
    ]);
    const leaf = { leafId: "X-20", parentId: "X", productCount: 100, attributes: [material], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Material");
    expect(q.attributeName).toBe("Material");
  });
});

describe("classifyLeaf: two-gate runtime enablement (filterMappingsValidated + runtimeEnabled)", () => {
  it("both gates are false for every generator-classified (non-override) entry, regardless of how good the data looks", () => {
    const leaf = { leafId: "X-04", parentId: "X", productCount: 100, attributes: [usableGenderFit], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.filterMappingsValidated).toBe(false);
    expect(result.runtimeEnabled).toBe(false);
  });

  it("an override can declare both gates true (e.g. PE-02)", () => {
    const override = { questions: [{ id: "moq" }], filterMappingsValidated: true, runtimeEnabled: true };
    const result = classifyLeaf({ leafId: "PE-02", productCount: 100 }, { families: {}, leafFamilyMap: {}, leafOverrides: { "PE-02": override } });
    expect(result.filterMappingsValidated).toBe(true);
    expect(result.runtimeEnabled).toBe(true);
  });

  it("an override declaring filterMappingsValidated but NOT runtimeEnabled stays gated off", () => {
    const override = { questions: [{ id: "moq" }], filterMappingsValidated: true };
    const result = classifyLeaf({ leafId: "PE-02", productCount: 100 }, { families: {}, leafFamilyMap: {}, leafOverrides: { "PE-02": override } });
    expect(result.filterMappingsValidated).toBe(true);
    expect(result.runtimeEnabled).toBe(false);
  });

  it("defaults both gates false for an override that declares neither explicitly", () => {
    const override = { questions: [{ id: "moq" }] };
    const result = classifyLeaf({ leafId: "PE-02", productCount: 100 }, { families: {}, leafFamilyMap: {}, leafOverrides: { "PE-02": override } });
    expect(result.filterMappingsValidated).toBe(false);
    expect(result.runtimeEnabled).toBe(false);
  });

  it("notes that a non-exact auditMode blocks live-validation claims", () => {
    const leaf = { leafId: "X-05", parentId: "X", productCount: 100, auditMode: "sampled_estimate", attributes: [], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.notes.some((n) => /Audit mode/.test(n))).toBe(true);
  });
});

// Live-verification-caught bug fix: Coasters (PM-07) and Beanies (PK-02) must
// build their Material/Fabric question from the real RAW Material stat,
// grouped into clean buckets with REAL raw synonyms as each option's filter
// value -- never the derived bucket LABEL, which always returned zero
// results live. See classify.mjs's MATERIAL_FAMILY_LEAF_CONFIG.
describe("classifyLeaf: material-family grouping (Beanies Fabric / Coasters Material)", () => {
  // Mirrors the real observed PM-07 distribution documented in
  // materialClassifiers.mjs: 25 raw distinct values -- deliberately more than
  // MAX_DISTINCT_VALUES (12), proving the generic isAttributeUsable check is
  // correctly bypassed for this leaf (grouping is what makes it usable).
  const realisticCoasterMaterial = attr(
    "Material",
    [
      { value: "Cork", productCount: 18 },
      { value: "Bamboo", productCount: 12 },
      { value: "Wood", productCount: 8 },
      { value: "Wheat Straw", productCount: 3 },
      { value: "Silicone", productCount: 6 },
      { value: "Neoprene", productCount: 2 },
      { value: "Acrylic", productCount: 5 },
      { value: "PVC", productCount: 4 },
      { value: "Polypropylene", productCount: 3 },
      { value: "Synthetic", productCount: 2 },
      { value: "Vinyl", productCount: 1 },
      { value: "Stainless Steel", productCount: 4 },
      { value: "Aluminium", productCount: 2 },
      { value: "Metal", productCount: 1 },
      { value: "Cardboard", productCount: 3 },
      { value: "Paper", productCount: 2 },
      { value: "Ceramic", productCount: 3 },
      { value: "Glass", productCount: 2 },
      { value: "Jute", productCount: 1 },
      { value: "Cotton 100%", productCount: 1 },
      { value: "Cotton Rich Blend", productCount: 1 },
      { value: "Polyester 100%", productCount: 1 },
      { value: "Polyester Rich Blend", productCount: 1 },
      { value: "Leather", productCount: 1 },
      { value: "rPET", productCount: 1 },
    ],
    { sampleSize: 94 }
  );

  it("Coasters (PM-07): builds a real grouped Coaster Material question from the raw Material stat despite it having 25 distinct raw values (above MAX_DISTINCT_VALUES)", () => {
    expect(realisticCoasterMaterial.distinctValues).toBeGreaterThan(12); // sanity: this really would fail the generic isAttributeUsable check
    const leaf = { leafId: "PM-07", parentId: "PM", productCount: 400, attributes: [realisticCoasterMaterial], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Coaster Material");
    expect(q).toBeDefined();
    expect(q.attributeName).toBe("Material"); // the real backend field, not the derived label
    const cork = q.options.find((o) => o.label === "Cork");
    expect(cork.value).toBe("Cork");
    const bambooWood = q.options.find((o) => o.label === "Bamboo/Wood");
    expect(bambooWood.value.split(",").sort()).toEqual(["Bamboo", "Wheat Straw", "Wood"].sort()); // real raw synonyms, not the bucket label
  });

  it("Coasters (PM-07): never offers the raw ungrouped Material attribute as a fallback alongside/instead of the grouped question", () => {
    const leaf = { leafId: "PM-07", parentId: "PM", productCount: 400, attributes: [realisticCoasterMaterial], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.questions.filter((q) => q.attributeName === "Material")).toHaveLength(1); // exactly the grouped one, never a second raw one
  });

  it("Beanies (PK-02): correctly excluded when raw Material coverage is below the population threshold (the real, honest 6% case)", () => {
    const sparseMaterial = attr("Material", [{ value: "Acrylic", productCount: 6 }], { sampleSize: 100 });
    const leaf = { leafId: "PK-02", parentId: "PK", productCount: 300, attributes: [sparseMaterial], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.questions.some((q) => q.label === "Fabric")).toBe(false);
    expect(result.notes.some((n) => /Fabric family-grouping considered but raw Material coverage/.test(n))).toBe(true);
  });

  it("Beanies (PK-02): ships a real Fabric question when raw Material coverage genuinely clears the threshold", () => {
    const healthyMaterial = attr(
      "Material",
      [
        { value: "Acrylic", productCount: 25 },
        { value: "Cotton 100%", productCount: 15 },
        { value: "Wool", productCount: 5 },
        { value: "Cardboard", productCount: 8 }, // packaging noise -- must not appear as a Fabric option
      ],
      { sampleSize: 100 }
    );
    const leaf = { leafId: "PK-02", parentId: "PK", productCount: 300, attributes: [healthyMaterial], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const q = result.questions.find((x) => x.label === "Fabric");
    expect(q).toBeDefined();
    expect(q.attributeName).toBe("Material");
    expect(q.options.some((o) => o.label === "Cardboard")).toBe(false);
  });

  it("a leaf outside MATERIAL_FAMILY_LEAF_CONFIG with the same raw Material shape is treated as a normal generic attribute (no special grouping applied)", () => {
    const leaf = { leafId: "PM-99", parentId: "PM", productCount: 400, attributes: [realisticCoasterMaterial], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.questions.some((q) => q.label === "Coaster Material")).toBe(false); // no grouping label ever appears for an unmapped leaf
  });
});
