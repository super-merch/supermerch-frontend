import { describe, expect, it } from "vitest";
import { generateManifestCore } from "../../scripts/category-finder/lib/generateManifestCore.mjs";
import { SchemaError } from "../../scripts/category-finder/lib/schema.mjs";
import { ReconciliationError } from "../../scripts/category-finder/lib/reconcile.mjs";

const authoritative = {
  leaves: [
    { id: "PE-02", name: "Drink Bottles", parentId: "PE", parentName: "Drinkware" },
    { id: "PU-01", name: "T-Shirts", parentId: "PU", parentName: "Shirts" },
    { id: "MISC-01", name: "Misc Headwear", parentId: "MISC-01", parentName: "Misc Headwear" },
  ],
  parents: [{ id: "PE", name: "Drinkware" }],
};

function completeSnapshot() {
  return {
    fetchedAt: "2026-01-01T00:00:00.000Z",
    leaves: [
      { leafId: "PE-02", leafName: "Drink Bottles", parentId: "PE", parentName: "Drinkware", productCount: 500, attributes: [], colourPopulatedPct: 0 },
      {
        leafId: "PU-01",
        leafName: "T-Shirts",
        parentId: "PU",
        parentName: "Shirts",
        productCount: 300,
        attributes: [
          { name: "Gender Fit", distinctValues: 3, totalTagged: 200, topShare: 50, values: [{ value: "Mens", count: 100 }, { value: "Ladies", count: 80 }, { value: "Kids", count: 20 }] },
        ],
        colourPopulatedPct: 0,
      },
      { leafId: "MISC-01", leafName: "Misc Headwear", parentId: "MISC-01", parentName: "Misc Headwear", productCount: 0 },
    ],
  };
}

const deps = {
  families: { clothing_gender_fit: { requiredAttribute: "Gender Fit", optionalAttribute: "Sleeves", applicableGroups: ["PU"] } },
  leafFamilyMap: { "PU-01": "clothing_gender_fit" },
  leafOverrides: {
    "PE-02": {
      filterMappingsValidated: true,
      questions: [{ id: "moq", label: "Order quantity", type: "query", queryParam: "moq", options: [{ label: "1–24", value: "24" }] }],
    },
  },
};

describe("generateManifestCore: happy path", () => {
  it("classifies every authoritative leaf and reconciles exactly", () => {
    const { leafManifest, reconciliation } = generateManifestCore(completeSnapshot(), authoritative, deps);
    expect(Object.keys(leafManifest).sort()).toEqual(["MISC-01", "PE-02", "PU-01"]);
    expect(leafManifest["PE-02"].finderMode).toBe("curated");
    expect(leafManifest["PE-02"].filterMappingsValidated).toBe(true);
    expect(leafManifest["PU-01"].finderMode).toBe("inherited");
    expect(leafManifest["MISC-01"].finderMode).toBe("excluded");
    expect(reconciliation.curated + reconciliation.inherited + reconciliation.generic + reconciliation.excluded).toBe(3);
  });
});

describe("generateManifestCore: determinism", () => {
  it("produces byte-identical output across two separate runs on the same input", () => {
    const run1 = generateManifestCore(completeSnapshot(), authoritative, deps);
    const run2 = generateManifestCore(completeSnapshot(), authoritative, deps);
    expect(JSON.stringify(run1.leafManifest)).toBe(JSON.stringify(run2.leafManifest));
    expect(JSON.stringify(run1.reconciliation)).toBe(JSON.stringify(run2.reconciliation));
  });
});

describe("generateManifestCore: failure modes", () => {
  it("fails when the snapshot is missing an authoritative leaf (incomplete snapshot)", () => {
    const incomplete = completeSnapshot();
    incomplete.leaves = incomplete.leaves.filter((l) => l.leafId !== "MISC-01"); // drop one of the 3 authoritative leaves
    expect(() => generateManifestCore(incomplete, authoritative, deps)).toThrow(ReconciliationError);
  });

  it("fails when a leaf's attribute schema is malformed (e.g. inconsistent per-value counts)", () => {
    const malformed = completeSnapshot();
    malformed.leaves[1].attributes[0].totalTagged = 999999; // no longer matches sum of per-value counts
    expect(() => generateManifestCore(malformed, authoritative, deps)).toThrow(SchemaError);
  });

  it("fails when the snapshot has a non-zero-product leaf with attributes missing entirely", () => {
    const malformed = completeSnapshot();
    delete malformed.leaves[0].attributes;
    expect(() => generateManifestCore(malformed, authoritative, deps)).toThrow(SchemaError);
  });
});
