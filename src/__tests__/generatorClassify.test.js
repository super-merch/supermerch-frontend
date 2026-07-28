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
