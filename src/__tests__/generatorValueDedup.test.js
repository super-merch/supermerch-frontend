import { describe, expect, it } from "vitest";
import { dedupeValueStats } from "../../scripts/category-finder/lib/valueDedup.mjs";

describe("dedupeValueStats", () => {
  it("merges case/whitespace variants of the same value into one entry, summing productCount", () => {
    const result = dedupeValueStats([
      { value: "Natural", productCount: 10 },
      { value: "natural", productCount: 5 },
      { value: " Natural ", productCount: 3 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].productCount).toBe(18);
  });

  it("keeps the exact casing seen on the most products as the canonical value", () => {
    const result = dedupeValueStats([
      { value: "steel", productCount: 2 },
      { value: "Steel", productCount: 40 },
    ]);
    expect(result[0].value).toBe("Steel");
    expect(result[0].productCount).toBe(42);
  });

  it("leaves genuinely distinct values untouched and sorts by productCount desc", () => {
    const result = dedupeValueStats([
      { value: "Aluminium", productCount: 5 },
      { value: "Steel", productCount: 40 },
      { value: "Plastic", productCount: 20 },
    ]);
    expect(result.map((v) => v.value)).toEqual(["Steel", "Plastic", "Aluminium"]);
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeValueStats([])).toEqual([]);
    expect(dedupeValueStats(undefined)).toEqual([]);
  });
});
