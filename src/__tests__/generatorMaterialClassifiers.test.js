import { describe, expect, it } from "vitest";
import { classifyBeanieFabric, classifyCoasterMaterial, classifyMetalPenMaterial, buildMaterialFamilyOptions } from "../../scripts/category-finder/lib/materialClassifiers.mjs";

describe("classifyBeanieFabric", () => {
  it("classifies known real fabric keywords", () => {
    expect(classifyBeanieFabric(["Acrylic"])).toBe("Acrylic");
    expect(classifyBeanieFabric(["Cotton 100%"])).toBe("Cotton");
    expect(classifyBeanieFabric(["Polyester 100%"])).toBe("Polyester");
    expect(classifyBeanieFabric(["Wool"])).toBe("Wool");
    expect(classifyBeanieFabric(["Recycled Polyester"])).toBe("Recycled Polyester");
  });

  it("never classifies packaging/hang-tag materials as a fabric (the real Beanies bug: Cardboard, Paper appearing as Material)", () => {
    expect(classifyBeanieFabric(["Cardboard"])).toBeNull();
    expect(classifyBeanieFabric(["Paper"])).toBeNull();
  });

  it("returns null when a product has no Material value at all", () => {
    expect(classifyBeanieFabric([])).toBeNull();
    expect(classifyBeanieFabric(undefined)).toBeNull();
  });

  it("returns Blend when >=2 distinct real fabrics are tagged on one product", () => {
    expect(classifyBeanieFabric(["Cotton 100%", "Polyester 100%"])).toBe("Blend");
  });

  it("ignores packaging noise even when mixed with a real fabric", () => {
    expect(classifyBeanieFabric(["Acrylic", "Cardboard"])).toBe("Acrylic");
  });

  it("classifies an unrecognized real (non-packaging) material as Other", () => {
    expect(classifyBeanieFabric(["Nylon"])).toBe("Other");
  });
});

describe("classifyCoasterMaterial", () => {
  it("classifies real observed Coaster Material values into the owner's 8-value taxonomy", () => {
    expect(classifyCoasterMaterial(["Cork"])).toBe("Cork");
    expect(classifyCoasterMaterial(["Bamboo"])).toBe("Bamboo/Wood");
    expect(classifyCoasterMaterial(["Wood"])).toBe("Bamboo/Wood");
    expect(classifyCoasterMaterial(["Silicone"])).toBe("Silicone/Rubber");
    expect(classifyCoasterMaterial(["Neoprene"])).toBe("Silicone/Rubber");
    expect(classifyCoasterMaterial(["Acrylic"])).toBe("Plastic/Acrylic");
    expect(classifyCoasterMaterial(["PVC"])).toBe("Plastic/Acrylic");
    expect(classifyCoasterMaterial(["Polypropylene"])).toBe("Plastic/Acrylic");
    expect(classifyCoasterMaterial(["Stainless Steel"])).toBe("Metal");
    expect(classifyCoasterMaterial(["Cardboard"])).toBe("Paper/Cardboard");
    expect(classifyCoasterMaterial(["Paper"])).toBe("Paper/Cardboard");
  });

  it("falls back to Other for a real Material value that matches none of the 8 approved families (e.g. Ceramic, Glass -- observed in real data but not in the owner's list)", () => {
    expect(classifyCoasterMaterial(["Ceramic"])).toBe("Other");
    expect(classifyCoasterMaterial(["Glass"])).toBe("Other");
    expect(classifyCoasterMaterial(["Jute"])).toBe("Other");
  });

  it("returns null when no Material value is tagged at all", () => {
    expect(classifyCoasterMaterial([])).toBeNull();
  });

  it("never invents Stone -- it was not observed in real Coaster Material data, so no keyword should silently produce it from an unrelated value", () => {
    expect(classifyCoasterMaterial(["Synthetic"])).not.toBe("Stone");
  });
});

describe("classifyMetalPenMaterial", () => {
  it("classifies a standalone genuine metal value", () => {
    expect(classifyMetalPenMaterial(["Aluminium"])).toEqual({ classification: "Aluminium", isGenuineMetal: true });
    expect(classifyMetalPenMaterial(["Stainless Steel"])).toEqual({ classification: "Stainless Steel", isGenuineMetal: true });
    expect(classifyMetalPenMaterial(["Metal (non-specific)"])).toEqual({ classification: "Other Metal", isGenuineMetal: true });
  });

  it("classifies a genuine metal + bamboo accent combination -- the real co-occurrence case (e.g. \"Aluminium Pen with Bamboo Grip\")", () => {
    expect(classifyMetalPenMaterial(["Aluminium", "Bamboo"])).toEqual({ classification: "Metal with Bamboo Accent", isGenuineMetal: true });
  });

  it("classifies a genuine metal + other non-metal accent (cork, leather, cardboard, PVC) as Metal with Recycled/Other Accent", () => {
    expect(classifyMetalPenMaterial(["Metal (non-specific)", "Cork"])).toEqual({ classification: "Metal with Recycled/Other Accent", isGenuineMetal: true });
    expect(classifyMetalPenMaterial(["Aluminium", "Leather"])).toEqual({ classification: "Metal with Recycled/Other Accent", isGenuineMetal: true });
    expect(classifyMetalPenMaterial(["Stainless Steel", "Cardboard"])).toEqual({ classification: "Metal with Recycled/Other Accent", isGenuineMetal: true });
  });

  it("flags a product with a non-metal Material value and NO genuine metal tag as isGenuineMetal:false -- the products the owner asked to be identified for review", () => {
    expect(classifyMetalPenMaterial(["Bamboo"])).toEqual({ classification: null, isGenuineMetal: false });
    expect(classifyMetalPenMaterial(["Cork", "Leather"])).toEqual({ classification: null, isGenuineMetal: false });
    expect(classifyMetalPenMaterial(["Plastic (non-specific)"])).toEqual({ classification: null, isGenuineMetal: false });
  });

  it("returns isGenuineMetal:null (not false) when there is no Material data at all -- 'unknown' must never be reported as 'confirmed non-metal'", () => {
    expect(classifyMetalPenMaterial([])).toEqual({ classification: null, isGenuineMetal: null });
    expect(classifyMetalPenMaterial(undefined)).toEqual({ classification: null, isGenuineMetal: null });
  });

  it("bamboo accent takes priority over other-accent when a product has both (documented, deterministic priority, not arbitrary)", () => {
    expect(classifyMetalPenMaterial(["Aluminium", "Bamboo", "Cork"])).toEqual({ classification: "Metal with Bamboo Accent", isGenuineMetal: true });
  });
});

// Live-verification-caught bug fix: a derived bucket LABEL (e.g. "Bamboo/Wood")
// is not itself a real backend field -- the filter must send the REAL raw
// synonyms. buildMaterialFamilyOptions groups a leaf's real raw Material
// value stats the same way buildColourFamilyOptions groups colour, so the
// shipped option's `value` is a comma-joined list of real, backend-filterable
// raw strings.
describe("buildMaterialFamilyOptions", () => {
  it("groups multiple raw synonyms into one bucket, with `value` as the comma-joined REAL raw values (not the bucket label)", () => {
    const materialValues = [
      { value: "Bamboo", productCount: 12 },
      { value: "Wood", productCount: 8 },
      { value: "Cork", productCount: 20 },
    ];
    const options = buildMaterialFamilyOptions(materialValues, classifyCoasterMaterial);
    const bambooWood = options.find((o) => o.label === "Bamboo/Wood");
    expect(bambooWood).toBeDefined();
    expect(bambooWood.value).toBe("Bamboo,Wood"); // real raw synonyms, comma-joined -- NOT "Bamboo/Wood"
    const cork = options.find((o) => o.label === "Cork");
    expect(cork.value).toBe("Cork");
  });

  it("sorts buckets by total product count descending", () => {
    const materialValues = [
      { value: "Cork", productCount: 5 },
      { value: "Bamboo", productCount: 30 },
    ];
    const options = buildMaterialFamilyOptions(materialValues, classifyCoasterMaterial);
    expect(options.map((o) => o.label)).toEqual(["Bamboo/Wood", "Cork"]);
  });

  it("drops a raw value the classifier maps to null (e.g. Beanies' packaging-only Cardboard/Paper) -- never grouped under any bucket", () => {
    const materialValues = [
      { value: "Acrylic", productCount: 10 },
      { value: "Cardboard", productCount: 40 }, // a packaging artifact, not a real fabric
    ];
    const options = buildMaterialFamilyOptions(materialValues, classifyBeanieFabric);
    expect(options).toEqual([{ label: "Acrylic", value: "Acrylic" }]);
  });

  it("returns an empty array when every real raw value maps to null", () => {
    const materialValues = [{ value: "Cardboard", productCount: 10 }];
    expect(buildMaterialFamilyOptions(materialValues, classifyBeanieFabric)).toEqual([]);
  });

  it("dedupes case/whitespace variants of the same raw value before classifying (shares valueDedup.mjs with every other attribute)", () => {
    const materialValues = [
      { value: "cork", productCount: 3 },
      { value: "Cork", productCount: 17 },
    ];
    const options = buildMaterialFamilyOptions(materialValues, classifyCoasterMaterial);
    expect(options).toEqual([{ label: "Cork", value: "Cork" }]); // one bucket, one raw value, not two duplicate "Cork,cork" entries
  });
});
