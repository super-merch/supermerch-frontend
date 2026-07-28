import { describe, expect, it } from "vitest";
import { validateSnapshot, validateLeafSnapshot, validateAttributeStat, SchemaError } from "../../scripts/category-finder/lib/schema.mjs";

const validLeaf = () => ({
  leafId: "PE-02",
  leafName: "Drink Bottles",
  productCount: 100,
  attributes: [
    { name: "Capacity", distinctValues: 2, totalTagged: 50, topShare: 60, values: [{ value: "500ml", count: 30 }, { value: "750ml", count: 20 }] },
  ],
  colourPopulatedPct: 80,
  colourValues: [{ value: "Black", count: 40 }, { value: "White", count: 20 }],
});

describe("validateAttributeStat", () => {
  it("accepts a well-formed attribute stat", () => {
    expect(() => validateAttributeStat(validLeaf().attributes[0], "test")).not.toThrow();
  });

  it("rejects a missing name", () => {
    expect(() => validateAttributeStat({ distinctValues: 1, totalTagged: 1, topShare: 100, values: [{ value: "x", count: 1 }] }, "t")).toThrow(SchemaError);
  });

  it("rejects topShare out of [0,100]", () => {
    const attr = { ...validLeaf().attributes[0], topShare: 150 };
    expect(() => validateAttributeStat(attr, "t")).toThrow(/topShare/);
  });

  it("rejects when sum of per-value counts doesn't match totalTagged (inconsistent data)", () => {
    const attr = { name: "Material", distinctValues: 1, totalTagged: 100, topShare: 100, values: [{ value: "Steel", count: 5 }] };
    expect(() => validateAttributeStat(attr, "t")).toThrow(/does not match "totalTagged"/);
  });

  it("rejects when distinctValues doesn't match values.length", () => {
    const attr = { name: "Material", distinctValues: 5, totalTagged: 10, topShare: 100, values: [{ value: "Steel", count: 10 }] };
    expect(() => validateAttributeStat(attr, "t")).toThrow(/distinctValues.*does not match/);
  });

  it("rejects an empty values array", () => {
    const attr = { name: "Material", distinctValues: 0, totalTagged: 0, topShare: 0, values: [] };
    expect(() => validateAttributeStat(attr, "t")).toThrow(/non-empty array/);
  });
});

describe("validateLeafSnapshot", () => {
  it("accepts a well-formed leaf", () => {
    expect(() => validateLeafSnapshot(validLeaf())).not.toThrow();
  });

  it("accepts a zero-product leaf with no attributes/colour data required", () => {
    expect(() => validateLeafSnapshot({ leafId: "X-01", leafName: "Empty", productCount: 0 })).not.toThrow();
  });

  it("rejects a leaf missing leafId", () => {
    expect(() => validateLeafSnapshot({ leafName: "X", productCount: 1 })).toThrow(SchemaError);
  });

  it("rejects productCount that isn't a finite non-negative number", () => {
    expect(() => validateLeafSnapshot({ leafId: "X", leafName: "X", productCount: -5 })).toThrow(/productCount/);
    expect(() => validateLeafSnapshot({ leafId: "X", leafName: "X", productCount: "100" })).toThrow(/productCount/);
  });

  it("rejects a non-zero-product leaf with attributes missing entirely (not even an empty array)", () => {
    const leaf = validLeaf();
    delete leaf.attributes;
    expect(() => validateLeafSnapshot(leaf)).toThrow(/attributes.*must be an array/);
  });

  it("rejects colourPopulatedPct > 0 without colourValues -- this is the exact bug class that would let every attribute question be silently rejected", () => {
    const leaf = validLeaf();
    delete leaf.colourValues;
    expect(() => validateLeafSnapshot(leaf)).toThrow(/colourValues/);
  });

  it("rejects a malformed colourValues entry", () => {
    const leaf = validLeaf();
    leaf.colourValues = [{ value: "Black" }]; // missing count
    expect(() => validateLeafSnapshot(leaf)).toThrow(/colourValues/);
  });
});

describe("validateSnapshot", () => {
  it("accepts a well-formed snapshot", () => {
    expect(() => validateSnapshot({ fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [validLeaf()] })).not.toThrow();
  });

  it("rejects a snapshot with no leaves", () => {
    expect(() => validateSnapshot({ fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [] })).toThrow(/non-empty array/);
  });

  it("rejects a snapshot missing fetchedAt", () => {
    expect(() => validateSnapshot({ leaves: [validLeaf()] })).toThrow(/fetchedAt/);
  });

  it("fails on the FIRST invalid leaf, with an actionable message identifying which one", () => {
    const goodLeaf = validLeaf();
    const badLeaf = { leafId: "BAD-01", leafName: "Bad", productCount: 10, attributes: "not-an-array", colourPopulatedPct: 0 };
    expect(() => validateSnapshot({ fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [goodLeaf, badLeaf] })).toThrow(/BAD-01/);
  });
});
