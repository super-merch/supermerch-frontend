import { describe, expect, it } from "vitest";
import { generateManifestCore } from "../../scripts/category-finder/lib/generateManifestCore.mjs";
import { SchemaError } from "../../scripts/category-finder/lib/schema.mjs";
import { ReconciliationError } from "../../scripts/category-finder/lib/reconcile.mjs";

function round1(n, d) {
  return d > 0 ? Math.round((n / d) * 1000) / 10 : 0;
}

const authoritative = {
  leaves: [
    { id: "PE-02", name: "Drink Bottles", parentId: "PE", parentName: "Drinkware" },
    { id: "PU-01", name: "T-Shirts", parentId: "PU", parentName: "Shirts" },
    { id: "MISC-01", name: "Misc Headwear", parentId: "MISC-01", parentName: "Misc Headwear" },
  ],
  parents: [{ id: "PE", name: "Drinkware" }],
};

function genderFitAttr() {
  return {
    name: "Gender Fit",
    sampleSize: 250,
    taggedProductCount: 200,
    valueOccurrenceCount: 200,
    populatedPct: round1(200, 250),
    distinctValues: 3,
    topValueProductCount: 100,
    topShare: round1(100, 200),
    values: [
      { value: "Mens", productCount: 100 },
      { value: "Ladies", productCount: 80 },
      { value: "Kids", productCount: 20 },
    ],
  };
}

function completeSnapshot() {
  return {
    fetchedAt: "2026-01-01T00:00:00.000Z",
    leaves: [
      {
        leafId: "PE-02",
        leafName: "Drink Bottles",
        parentId: "PE",
        parentName: "Drinkware",
        productCount: 500,
        auditMode: "sampled_estimate",
        sampleSize: 100,
        attributes: [],
        colourPopulatedPct: 0,
      },
      {
        leafId: "PU-01",
        leafName: "T-Shirts",
        parentId: "PU",
        parentName: "Shirts",
        productCount: 300,
        auditMode: "sampled_estimate",
        sampleSize: 250,
        attributes: [genderFitAttr()],
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
      runtimeEnabled: true,
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
    expect(leafManifest["PE-02"].runtimeEnabled).toBe(true);
    expect(leafManifest["PU-01"].finderMode).toBe("inherited");
    expect(leafManifest["PU-01"].filterMappingsValidated).toBe(false);
    expect(leafManifest["PU-01"].runtimeEnabled).toBe(false);
    expect(leafManifest["MISC-01"].finderMode).toBe("excluded");
    expect(reconciliation.curated + reconciliation.inherited + reconciliation.generic + reconciliation.excluded).toBe(3);
  });
});

describe("generateManifestCore: parent/group pages", () => {
  it("stub-excludes a parent when the snapshot has no parent audit data at all (pre-parent-audit snapshot)", () => {
    const { parentManifest } = generateManifestCore(completeSnapshot(), authoritative, deps);
    expect(parentManifest["PE"].finderMode).toBe("excluded");
    expect(parentManifest["PE"].exclusionReason).toMatch(/re-run fetch-catalogue-snapshot/);
  });

  it("classifies a parent for real once the snapshot carries its own audit data, the same as any leaf", () => {
    const snapshot = completeSnapshot();
    snapshot.parents = [
      {
        leafId: "PE",
        leafName: "Drinkware",
        parentId: "PE",
        parentName: "Drinkware",
        productCount: 1500,
        auditMode: "sampled_estimate",
        sampleSize: 250,
        attributes: [genderFitAttr()],
        colourPopulatedPct: 0,
      },
    ];
    const { parentManifest } = generateManifestCore(snapshot, authoritative, deps);
    expect(parentManifest["PE"].finderMode).toBe("generic");
    expect(parentManifest["PE"].questions.some((q) => q.attributeName === "Gender Fit")).toBe(true);
    expect(parentManifest["PE"].filterMappingsValidated).toBe(false); // still requires the separate live-verification pass, same as leaves
  });

  it("excludes a parent with zero products the same way a leaf would, when parent audit data exists", () => {
    const snapshot = completeSnapshot();
    snapshot.parents = [{ leafId: "PE", leafName: "Drinkware", parentId: "PE", parentName: "Drinkware", productCount: 0 }];
    const { parentManifest } = generateManifestCore(snapshot, authoritative, deps);
    expect(parentManifest["PE"].finderMode).toBe("excluded");
    expect(parentManifest["PE"].exclusionReason).not.toMatch(/re-run fetch-catalogue-snapshot/); // a REAL exclusion reason, not the missing-data fallback
  });

  // Caught via live browser testing: /Clothing?category=PX still showed the
  // old unsplit "Compliance" dropdown after the per-product derivation fix,
  // because generateManifestCore classified every parent with an EMPTY
  // leafFamilyMap, so the PX parent's own Visibility stat (a single-value,
  // topShare=100 attribute) failed the generic isAttributeUsable check and
  // was never even a candidate -- only PARENT_FAMILY_MAP's family-based
  // presence-mode treatment (mirroring what every PX-* child leaf already
  // gets) makes it surface as a real question here.
  it("gives the PX parent page the same presence-mode Visibility treatment its own PX-* child leaves get (PARENT_FAMILY_MAP)", () => {
    const snapshot = completeSnapshot();
    snapshot.parents = [
      {
        leafId: "PX",
        leafName: "Workwear",
        parentId: "PX",
        parentName: "Workwear",
        productCount: 1039,
        auditMode: "sampled_estimate",
        sampleSize: 99,
        attributes: [
          genderFitAttr(),
          {
            name: "Visibility",
            sampleSize: 99,
            taggedProductCount: 42,
            valueOccurrenceCount: 42,
            populatedPct: round1(42, 99),
            distinctValues: 1,
            topValueProductCount: 42,
            topShare: 100,
            values: [{ value: "Hi-Vis", productCount: 42 }],
          },
        ],
        colourPopulatedPct: 0,
      },
    ];
    const pxAuthoritative = { ...authoritative, parents: [...authoritative.parents, { id: "PX", name: "Workwear" }] };
    const pxDeps = {
      ...deps,
      families: {
        ...deps.families,
        workwear_visibility: { requiredAttribute: "Gender Fit", optionalAttribute: "Visibility", optionalAttributeMode: "presence", applicableGroups: ["PX"] },
      },
    };
    const { parentManifest } = generateManifestCore(snapshot, pxAuthoritative, pxDeps);
    expect(parentManifest["PX"].proposedFamily).toBe("workwear_visibility"); // proves it went through family-based treatment, not a lucky generic pass
    const visibilityQuestion = parentManifest["PX"].questions.find((q) => q.label === "Visibility");
    expect(visibilityQuestion).toBeDefined();
    // attributeName must be the REAL backend field (Compliance), not the derived display label -- see classify.mjs's DERIVED_ATTRIBUTE_BACKEND_NAME.
    expect(visibilityQuestion.attributeName).toBe("Compliance");
    expect(visibilityQuestion.options).toEqual([{ label: "Hi-Vis", value: "Hi-Vis" }]);
    expect(visibilityQuestion.singleValueAllowed).toBe(true);
  });

  it("still applies the ordinary generic (non-family) path for a parent PARENT_FAMILY_MAP does not mention", () => {
    const snapshot = completeSnapshot();
    snapshot.parents = [
      { leafId: "PE", leafName: "Drinkware", parentId: "PE", parentName: "Drinkware", productCount: 500, auditMode: "sampled_estimate", sampleSize: 100, attributes: [genderFitAttr()], colourPopulatedPct: 0 },
    ];
    const { parentManifest } = generateManifestCore(snapshot, authoritative, deps);
    expect(parentManifest["PE"].proposedFamily).toBeNull(); // PE is not in PARENT_FAMILY_MAP, so it must fall through to the generic candidate path, same as before this fix
    expect(parentManifest["PE"].finderMode).toBe("generic");
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
    malformed.leaves[1].attributes[0].valueOccurrenceCount = 999999; // no longer matches sum of per-value productCounts
    expect(() => generateManifestCore(malformed, authoritative, deps)).toThrow(SchemaError);
  });

  it("fails when the snapshot has a non-zero-product leaf with attributes missing entirely", () => {
    const malformed = completeSnapshot();
    delete malformed.leaves[0].attributes;
    expect(() => generateManifestCore(malformed, authoritative, deps)).toThrow(SchemaError);
  });

  it("fails -- rather than silently overwriting -- when every authoritative ID is present but one snapshot leafId is duplicated", () => {
    // This is the exact failure mode object-keying by leafId can never catch
    // after the fact: the snapshot technically "covers" all 3 authoritative
    // leaves by ID-set membership, but PU-01's real record is duplicated in
    // place of MISC-01's, so MISC-01 would silently vanish from a naively
    // keyed manifest instead of generation failing loudly.
    const duplicated = completeSnapshot();
    duplicated.leaves[2] = { ...duplicated.leaves[1] }; // MISC-01 slot overwritten with a second PU-01 record
    expect(() => generateManifestCore(duplicated, authoritative, deps)).toThrow(SchemaError);
    expect(() => generateManifestCore(duplicated, authoritative, deps)).toThrow(/Duplicate leafId "PU-01"/);
  });
});

describe("generateManifestCore: authoritative-inventory self-consistency", () => {
  it("fails before touching the snapshot at all when the authoritative inventory itself has a duplicate leaf ID", () => {
    const badAuthoritative = {
      leaves: [...authoritative.leaves, { id: "PE-02", name: "Drink Bottles (dup)", parentId: "PE", parentName: "Drinkware" }],
      parents: authoritative.parents,
    };
    expect(() => generateManifestCore(completeSnapshot(), badAuthoritative, deps)).toThrow(ReconciliationError);
    expect(() => generateManifestCore(completeSnapshot(), badAuthoritative, deps)).toThrow(/Duplicate leaf ID "PE-02"/);
  });

  it("fails when a leaf ID and a parent ID collide", () => {
    const badAuthoritative = {
      leaves: authoritative.leaves,
      parents: [...authoritative.parents, { id: "PE-02", name: "Drink Bottles as a parent page too" }],
    };
    expect(() => generateManifestCore(completeSnapshot(), badAuthoritative, deps)).toThrow(/BOTH a leaf and a parent/);
  });
});
