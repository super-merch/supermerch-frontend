import { describe, expect, it } from "vitest";
import { isAttributeUsable, isPresenceAttributeUsable, isColourUsable, hasNoProducts, THRESHOLDS } from "../../scripts/category-finder/lib/exclusionRules.mjs";

function attr({ taggedProductCount, sampleSize, topShare = 50, distinctValues = 3 }) {
  return { taggedProductCount, sampleSize, topShare, distinctValues };
}

describe("isAttributeUsable", () => {
  it("rejects null/missing attribute stats", () => {
    expect(isAttributeUsable(null)).toBe(false);
    expect(isAttributeUsable(undefined)).toBe(false);
  });

  it("rejects below-coverage attributes", () => {
    expect(isAttributeUsable(attr({ taggedProductCount: 10, sampleSize: 100 }))).toBe(false); // 10% < 30%
  });

  it("rejects a single dominant value even with good coverage", () => {
    expect(isAttributeUsable(attr({ taggedProductCount: 90, sampleSize: 100, topShare: 95 }))).toBe(false);
  });

  it("rejects a single-distinct-value attribute", () => {
    expect(isAttributeUsable(attr({ taggedProductCount: 90, sampleSize: 100, topShare: 100, distinctValues: 1 }))).toBe(false);
  });

  it("rejects an over-fragmented attribute (too many raw values for a plain dropdown)", () => {
    expect(isAttributeUsable(attr({ taggedProductCount: 90, sampleSize: 100, topShare: 20, distinctValues: 20 }))).toBe(false);
  });

  it("accepts a well-covered, well-distributed attribute", () => {
    expect(isAttributeUsable(attr({ taggedProductCount: 80, sampleSize: 100, topShare: 50, distinctValues: 4 }))).toBe(true);
  });
});

describe("isPresenceAttributeUsable: presence/certification-style attributes (e.g. Compliance)", () => {
  it("rejects null/missing attribute stats", () => {
    expect(isPresenceAttributeUsable(null)).toBe(false);
  });

  it("rejects near-zero coverage -- too few products carry the tag to be worth a filter", () => {
    expect(isPresenceAttributeUsable({ taggedProductCount: 1, sampleSize: 100 })).toBe(false); // 1%
  });

  it("rejects near-total coverage -- selecting it wouldn't narrow anything", () => {
    expect(isPresenceAttributeUsable({ taggedProductCount: 99, sampleSize: 100 })).toBe(false); // 99%
  });

  it("accepts real, partial coverage regardless of how dominant one value is among the tagged subset", () => {
    // The exact real-world case this was built for: Compliance is
    // 88-100% "Hi-Vis" among TAGGED Workwear products (rail-compliance/UPF
    // values are rare), which isAttributeUsable would reject outright.
    expect(isPresenceAttributeUsable({ taggedProductCount: 59, sampleSize: 94 })).toBe(true); // 62.8% coverage
  });

  it("accepts a single-distinct-value presence attribute (e.g. only Hi-Vis ever appears, no other Compliance value)", () => {
    expect(isPresenceAttributeUsable({ taggedProductCount: 15, sampleSize: 32 })).toBe(true); // 46.9% coverage, distinctValues irrelevant here
  });

  it("accepts coverage right at the boundaries", () => {
    expect(isPresenceAttributeUsable({ taggedProductCount: THRESHOLDS.MIN_PRESENCE_COVERAGE * 100, sampleSize: 100 })).toBe(true);
    expect(isPresenceAttributeUsable({ taggedProductCount: THRESHOLDS.MAX_PRESENCE_COVERAGE * 100, sampleSize: 100 })).toBe(true);
  });
});

describe("isColourUsable", () => {
  it("rejects below-threshold colour population", () => {
    expect(isColourUsable(39)).toBe(false);
  });
  it("accepts at/above-threshold colour population", () => {
    expect(isColourUsable(40)).toBe(true);
  });
});

describe("hasNoProducts", () => {
  it("is true only for exactly zero products", () => {
    expect(hasNoProducts(0)).toBe(true);
    expect(hasNoProducts(1)).toBe(false);
  });
});
