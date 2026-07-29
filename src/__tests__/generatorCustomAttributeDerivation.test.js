import { describe, expect, it } from "vitest";
import { splitWorkwearCompliance, applyCustomAttributeDerivation, WORKWEAR_LEAF_IDS } from "../../scripts/category-finder/lib/customAttributeDerivation.mjs";

describe("splitWorkwearCompliance", () => {
  it("extracts Hi-Vis as visibility and leaves other real compliance values untouched", () => {
    expect(splitWorkwearCompliance(["Hi-Vis", "NSW Rail Compliant", "UPF Rated"])).toEqual({
      visibility: "Hi-Vis",
      otherCompliance: ["NSW Rail Compliant", "UPF Rated"],
    });
  });

  it("returns visibility:null when Hi-Vis is not present, keeping the other values as Compliance candidates", () => {
    expect(splitWorkwearCompliance(["UPF Rated"])).toEqual({ visibility: null, otherCompliance: ["UPF Rated"] });
  });

  it("is case-insensitive for the Hi-Vis match", () => {
    expect(splitWorkwearCompliance(["hi-vis"])).toEqual({ visibility: "Hi-Vis", otherCompliance: [] });
  });

  it("returns both null/empty for no compliance data at all", () => {
    expect(splitWorkwearCompliance([])).toEqual({ visibility: null, otherCompliance: [] });
    expect(splitWorkwearCompliance(undefined)).toEqual({ visibility: null, otherCompliance: [] });
  });
});

describe("applyCustomAttributeDerivation", () => {
  it("Beanies (PK-02): replaces raw Material with derived Fabric, deleting the raw attribute entirely", () => {
    const perProductValues = new Map([["Material", new Set(["Acrylic"])]]);
    applyCustomAttributeDerivation("PK-02", perProductValues);
    expect(perProductValues.has("Material")).toBe(false);
    expect(perProductValues.get("Fabric")).toEqual(new Set(["Acrylic"]));
  });

  it("Beanies (PK-02): a packaging-only Material value (Cardboard) is deleted with no Fabric derived", () => {
    const perProductValues = new Map([["Material", new Set(["Cardboard"])]]);
    applyCustomAttributeDerivation("PK-02", perProductValues);
    expect(perProductValues.has("Material")).toBe(false);
    expect(perProductValues.has("Fabric")).toBe(false);
  });

  it("Coasters (PM-07): replaces raw Material with derived Coaster Material", () => {
    const perProductValues = new Map([["Material", new Set(["Cork"])]]);
    applyCustomAttributeDerivation("PM-07", perProductValues);
    expect(perProductValues.has("Material")).toBe(false);
    expect(perProductValues.get("Coaster Material")).toEqual(new Set(["Cork"]));
  });

  it("Metal Pens (PY-06): replaces raw Material with derived Primary Body Material", () => {
    const perProductValues = new Map([["Material", new Set(["Aluminium", "Bamboo"])]]);
    applyCustomAttributeDerivation("PY-06", perProductValues);
    expect(perProductValues.has("Material")).toBe(false);
    expect(perProductValues.get("Primary Body Material")).toEqual(new Set(["Metal with Bamboo Accent"]));
  });

  it("Metal Pens (PY-06): a product with no genuine metal tag gets its Material deleted with no Primary Body Material derived (never guessed)", () => {
    const perProductValues = new Map([["Material", new Set(["Leather"])]]);
    applyCustomAttributeDerivation("PY-06", perProductValues);
    expect(perProductValues.has("Material")).toBe(false);
    expect(perProductValues.has("Primary Body Material")).toBe(false);
  });

  it("Workwear (any PX-* leaf): splits raw Compliance into Visibility + a Hi-Vis-free Compliance", () => {
    const perProductValues = new Map([["Compliance", new Set(["Hi-Vis", "UPF Rated"])]]);
    applyCustomAttributeDerivation("PX-04", perProductValues);
    expect(perProductValues.get("Visibility")).toEqual(new Set(["Hi-Vis"]));
    expect(perProductValues.get("Compliance")).toEqual(new Set(["UPF Rated"]));
  });

  it("Workwear: a product with ONLY Hi-Vis ends up with Visibility set and no Compliance key at all (not an empty Set)", () => {
    const perProductValues = new Map([["Compliance", new Set(["Hi-Vis"])]]);
    applyCustomAttributeDerivation("PX-13", perProductValues);
    expect(perProductValues.get("Visibility")).toEqual(new Set(["Hi-Vis"]));
    expect(perProductValues.has("Compliance")).toBe(false);
  });

  it("Workwear: applies uniformly across the full PX-* leaf set, not just the owner's named examples", () => {
    for (const leafId of WORKWEAR_LEAF_IDS) {
      const perProductValues = new Map([["Compliance", new Set(["Hi-Vis"])]]);
      applyCustomAttributeDerivation(leafId, perProductValues);
      expect(perProductValues.get("Visibility"), `${leafId} should derive Visibility`).toEqual(new Set(["Hi-Vis"]));
    }
    expect(WORKWEAR_LEAF_IDS.size).toBe(14);
  });

  it("Workwear: the PX parent/group aggregate page itself gets the identical split as its own 14 child leaves", () => {
    const perProductValues = new Map([["Compliance", new Set(["Hi-Vis", "UPF Rated"])]]);
    applyCustomAttributeDerivation("PX", perProductValues);
    expect(perProductValues.get("Visibility")).toEqual(new Set(["Hi-Vis"]));
    expect(perProductValues.get("Compliance")).toEqual(new Set(["UPF Rated"]));
  });

  it("a leaf with no matching deriver is left completely untouched", () => {
    const perProductValues = new Map([["Material", new Set(["Steel"])], ["Gender Fit", new Set(["Unisex"])]]);
    applyCustomAttributeDerivation("PE-02", perProductValues);
    expect(perProductValues.get("Material")).toEqual(new Set(["Steel"]));
    expect(perProductValues.get("Gender Fit")).toEqual(new Set(["Unisex"]));
  });
});
