import { describe, expect, it } from "vitest";
import { classifyLeaf, buildAttributeOptions, buildColourOptions } from "../../scripts/category-finder/lib/classify.mjs";

const FAMILIES = {
  clothing_gender_fit: { requiredAttribute: "Gender Fit", optionalAttribute: "Sleeves", applicableGroups: ["PU", "PN"] },
};

function attr(name, values, opts = {}) {
  const totalTagged = values.reduce((s, v) => s + v.count, 0);
  const sorted = [...values].sort((a, b) => b.count - a.count);
  return {
    name,
    distinctValues: values.length,
    totalTagged,
    topShare: opts.topShare ?? Math.round((sorted[0].count / totalTagged) * 1000) / 10,
    values: sorted,
  };
}

const usableGenderFit = attr("Gender Fit", [
  { value: "Mens", count: 40 },
  { value: "Ladies", count: 30 },
  { value: "Unisex", count: 20 },
  { value: "Kids", count: 10 },
]);

describe("buildAttributeOptions", () => {
  it("builds one option per positive-count value, sorted by count desc, using the raw value as the URL value", () => {
    const options = buildAttributeOptions(usableGenderFit);
    expect(options).toEqual([
      { label: "Mens", value: "Mens" },
      { label: "Ladies", value: "Ladies" },
      { label: "Unisex", value: "Unisex" },
      { label: "Kids", value: "Kids" },
    ]);
  });

  it("drops zero-count values", () => {
    const options = buildAttributeOptions(attr("X", [{ value: "A", count: 5 }, { value: "B", count: 0 }]));
    expect(options.map((o) => o.value)).toEqual(["A"]);
  });

  it("drops values that look like internal/supplier fields defensively", () => {
    const options = buildAttributeOptions(attr("X", [{ value: "Supplier Code", count: 5 }, { value: "Real Value", count: 3 }]));
    expect(options.map((o) => o.value)).toEqual(["Real Value"]);
  });
});

describe("buildColourOptions", () => {
  it("returns null when colour population is below threshold", () => {
    expect(buildColourOptions({ colourPopulatedPct: 10, colourValues: [{ value: "Black", count: 5 }, { value: "White", count: 3 }] })).toBeNull();
  });

  it("returns null when fewer than 2 distinct colour values exist even if population is high", () => {
    expect(buildColourOptions({ colourPopulatedPct: 90, colourValues: [{ value: "Black", count: 50 }] })).toBeNull();
  });

  it("returns real options sorted by count when usable", () => {
    const options = buildColourOptions({ colourPopulatedPct: 80, colourValues: [{ value: "White", count: 10 }, { value: "Black", count: 40 }] });
    expect(options).toEqual([{ label: "Black", value: "Black" }, { label: "White", value: "White" }]);
  });
});

describe("classifyLeaf: exclusion", () => {
  it("excludes a zero-product leaf with a reason and no live-verification claim", () => {
    const result = classifyLeaf({ leafId: "MISC-01", leafName: "Misc Headwear", productCount: 0, exclusionReason: "productMatchRules empty" }, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.finderMode).toBe("excluded");
    expect(result.questions).toHaveLength(0);
    expect(result.filterMappingsValidated).toBe(false);
    expect(result.notes[0]).toMatch(/productMatchRules empty/);
  });
});

describe("classifyLeaf: family inheritance and applicableGroups enforcement", () => {
  const leaf = { leafId: "PU-01", parentId: "PU", productCount: 200, attributes: [usableGenderFit], colourPopulatedPct: 0 };

  it("inherits when the leaf's family is mapped AND its group is in applicableGroups", () => {
    const result = classifyLeaf(leaf, { families: FAMILIES, leafFamilyMap: { "PU-01": "clothing_gender_fit" }, leafOverrides: {} });
    expect(result.finderMode).toBe("inherited");
    expect(result.proposedFamily).toBe("clothing_gender_fit");
    const genderQ = result.questions.find((q) => q.attributeName === "Gender Fit");
    expect(genderQ.options.length).toBeGreaterThan(1);
  });

  it("does NOT inherit when the leaf's group is not in applicableGroups, even if mapped -- this is the enforcement the family templates require", () => {
    const outsideGroupLeaf = { ...leaf, leafId: "PK-01", parentId: "PK" };
    const result = classifyLeaf(outsideGroupLeaf, { families: FAMILIES, leafFamilyMap: { "PK-01": "clothing_gender_fit" }, leafOverrides: {} });
    expect(result.finderMode).not.toBe("inherited");
    expect(result.notes.some((n) => /applicableGroups/.test(n))).toBe(true);
  });

  it("falls back to generic when family is mapped and applicable but the required attribute itself fails usability", () => {
    const nearSingleValue = attr("Gender Fit", [{ value: "Unisex", count: 95 }, { value: "Mens", count: 5 }]);
    const result = classifyLeaf({ ...leaf, attributes: [nearSingleValue] }, { families: FAMILIES, leafFamilyMap: { "PU-01": "clothing_gender_fit" }, leafOverrides: {} });
    expect(result.finderMode).toBe("generic");
  });
});

describe("classifyLeaf: generic fallback", () => {
  it("selects up to 2 usable attributes when no family applies", () => {
    const material = attr("Material", [{ value: "Steel", count: 40 }, { value: "Plastic", count: 30 }, { value: "Wood", count: 10 }]);
    const leaf = { leafId: "X-01", parentId: "X", productCount: 100, attributes: [usableGenderFit, material], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.finderMode).toBe("generic");
    const attributeQuestions = result.questions.filter((q) => q.type === "attribute");
    expect(attributeQuestions.length).toBeLessThanOrEqual(2);
  });

  it("still returns quantity+budget only (no attributes, no colour) rather than excluding when nothing else qualifies", () => {
    const leaf = { leafId: "X-02", parentId: "X", productCount: 50, attributes: [], colourPopulatedPct: 5 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.finderMode).toBe("generic");
    expect(result.questions.map((q) => q.id)).toEqual(["moq", "budget"]);
  });
});

describe("classifyLeaf: question ordering and shape invariants", () => {
  it("quantity is always first, budget always second, colour always last when present", () => {
    const material = attr("Material", [{ value: "Steel", count: 40 }, { value: "Plastic", count: 30 }]);
    const leaf = {
      leafId: "X-03",
      parentId: "X",
      productCount: 100,
      attributes: [material],
      colourPopulatedPct: 80,
      colourValues: [{ value: "Black", count: 40 }, { value: "White", count: 30 }],
    };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    const ids = result.questions.map((q) => q.id);
    expect(ids[0]).toBe("moq");
    expect(ids[1]).toBe("budget");
    expect(ids[ids.length - 1]).toBe("colour");
  });
});

describe("classifyLeaf: filterMappingsValidated semantics", () => {
  it("is always false for generator-classified (non-override) entries -- no live verification has run", () => {
    const leaf = { leafId: "X-04", parentId: "X", productCount: 100, attributes: [], colourPopulatedPct: 0 };
    const result = classifyLeaf(leaf, { families: {}, leafFamilyMap: {}, leafOverrides: {} });
    expect(result.filterMappingsValidated).toBe(false);
  });

  it("is only true for a hand-authored override that explicitly declares itself validated", () => {
    const override = { questions: [{ id: "moq" }], filterMappingsValidated: true };
    const result = classifyLeaf({ leafId: "PE-02", productCount: 100 }, { families: {}, leafFamilyMap: {}, leafOverrides: { "PE-02": override } });
    expect(result.finderMode).toBe("curated");
    expect(result.filterMappingsValidated).toBe(true);
  });

  it("defaults to false even for an override if it doesn't explicitly set filterMappingsValidated: true", () => {
    const override = { questions: [{ id: "moq" }] };
    const result = classifyLeaf({ leafId: "PE-02", productCount: 100 }, { families: {}, leafFamilyMap: {}, leafOverrides: { "PE-02": override } });
    expect(result.filterMappingsValidated).toBe(false);
  });
});
