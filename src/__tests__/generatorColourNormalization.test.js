import { describe, expect, it } from "vitest";
import {
  normalizeColourKey,
  isNoiseColourValue,
  classifyColourFamilies,
  dedupeColourValues,
  buildColourFamilyOptions,
} from "../../scripts/category-finder/lib/colourNormalization.mjs";

describe("normalizeColourKey", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeColourKey("  Natural  ")).toBe("natural");
    expect(normalizeColourKey("Dark   Blue")).toBe("dark blue");
  });
});

describe("isNoiseColourValue", () => {
  it("flags known production/print metadata as noise, not a colour", () => {
    expect(isNoiseColourValue("PMS")).toBe(true);
    expect(isNoiseColourValue("CMYK")).toBe(true);
    expect(isNoiseColourValue("Custom")).toBe(true);
    expect(isNoiseColourValue("Round Neck")).toBe(true);
    expect(isNoiseColourValue("Range of Colours")).toBe(true);
    expect(isNoiseColourValue(">PMS matching not available")).toBe(true);
  });

  it("does not flag a real colour as noise", () => {
    expect(isNoiseColourValue("Black")).toBe(false);
    expect(isNoiseColourValue("Navy Blue")).toBe(false);
  });
});

describe("classifyColourFamilies", () => {
  it("maps common named shades to their broad family", () => {
    expect(classifyColourFamilies("Navy")).toEqual(["Blue"]);
    expect(classifyColourFamilies("Royal Blue")).toEqual(["Blue"]);
    expect(classifyColourFamilies("Charcoal")).toEqual(["Grey / Silver"]);
    expect(classifyColourFamilies("Ecru")).toEqual(["Natural / Beige"]);
    expect(classifyColourFamilies("Burgundy")).toEqual(["Red"]);
  });

  it("matches a keyword regardless of a trailing Pantone/descriptor code", () => {
    expect(classifyColourFamilies("Orange (021C)")).toEqual(["Orange"]);
    expect(classifyColourFamilies("Royal Blue (2728C)")).toEqual(["Blue"]);
    expect(classifyColourFamilies("Yellow (Lemon)")).toEqual(["Yellow"]);
  });

  it("splits a two-tone value on '/' or '.' and returns every matched family", () => {
    expect(classifyColourFamilies("Black/White")).toEqual(["Black", "White"]);
    expect(classifyColourFamilies("navy.gold")).toEqual(["Blue", "Gold"]);
  });

  it("does not let a hyphenated compound word split into unrelated families", () => {
    // "off-white" and "dark-green" are single colour words with a stylistic
    // hyphen, not two separate tones -- must not be treated as "/" separated.
    expect(classifyColourFamilies("off-white")).toEqual(["Natural / Beige"]);
    expect(classifyColourFamilies("dark-green")).toEqual(["Green"]);
  });

  it("resolves a genuinely ambiguous compound word to the documented family, not the first substring match encountered by accident", () => {
    // "ink blue" contains neither "black" nor any other family's keyword
    // ahead of "blue" in priority order, so it must resolve to Blue, not
    // fall through to an unrelated family via a stray keyword collision.
    expect(classifyColourFamilies("ink blue")).toEqual(["Blue"]);
  });

  it("returns an empty array for noise values and for unrecognized shade names", () => {
    expect(classifyColourFamilies("PMS")).toEqual([]);
    expect(classifyColourFamilies("Zzyzzogeton")).toEqual([]);
  });
});

describe("dedupeColourValues", () => {
  it("collapses case/whitespace duplicate colours (the duplicate-visible-label bug) into one entry", () => {
    const result = dedupeColourValues([
      { value: "Natural", productCount: 10 },
      { value: "natural", productCount: 4 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].productCount).toBe(14);
  });
});

describe("buildColourFamilyOptions", () => {
  it("groups raw colour values into a short family list instead of shipping every raw shade", () => {
    const raw = [
      { value: "Navy", productCount: 50 },
      { value: "Royal Blue", productCount: 30 },
      { value: "Sky Blue", productCount: 10 },
      { value: "Black", productCount: 40 },
      { value: "Charcoal", productCount: 20 },
      { value: "Ecru", productCount: 5 },
    ];
    const options = buildColourFamilyOptions(raw);
    expect(options.map((o) => o.label)).toEqual(["Blue", "Black", "Grey / Silver", "Natural / Beige"]);
    // The Blue family's value is a comma-joined list of this leaf's own raw
    // Blue-family values -- CategoryFinder/Cards.jsx already know how to
    // split this on "," into a colors[] array with no component change.
    const blue = options.find((o) => o.label === "Blue");
    expect(blue.value.split(",").sort()).toEqual(["Navy", "Royal Blue", "Sky Blue"].sort());
    expect(blue.productCount).toBe(90);
  });

  it("drops pure noise values entirely -- never shown, not even under Other", () => {
    const options = buildColourFamilyOptions([
      { value: "Black", productCount: 10 },
      { value: "White", productCount: 8 },
      { value: "PMS", productCount: 99 },
      { value: "Custom", productCount: 50 },
    ]);
    const joinedValues = options.flatMap((o) => o.value.split(","));
    expect(joinedValues).not.toContain("PMS");
    expect(joinedValues).not.toContain("Custom");
  });

  it("groups an unrecognized real shade name under Other rather than hiding it", () => {
    const options = buildColourFamilyOptions([
      { value: "Black", productCount: 10 },
      { value: "White", productCount: 8 },
      { value: "Zzyzzogeton", productCount: 3 },
    ]);
    const other = options.find((o) => o.label === "Other");
    expect(other).toBeDefined();
    expect(other.value).toBe("Zzyzzogeton");
  });

  it("a two-tone value contributes to every family it matches, not just one", () => {
    const options = buildColourFamilyOptions([
      { value: "Black/White", productCount: 20 },
      { value: "Red", productCount: 5 },
    ]);
    const black = options.find((o) => o.label === "Black");
    const white = options.find((o) => o.label === "White");
    expect(black.value).toContain("Black/White");
    expect(white.value).toContain("Black/White");
  });
});
