import { describe, expect, it } from "vitest";
import { validateSnapshot, validateLeafSnapshot, validateAttributeStat, SchemaError } from "../../scripts/category-finder/lib/schema.mjs";

// A 1,000-product category, sampled at 100, where 92 of the 100 sampled
// products contain "Capacity" (matches the worked example in review
// feedback: coverage must be judged against the SAMPLE, not the full
// category count of 1,000).
const capacityAttr = () => ({
  name: "Capacity",
  sampleSize: 100,
  taggedProductCount: 92,
  valueOccurrenceCount: 108, // > taggedProductCount because some products have multiple values
  populatedPct: 92,
  distinctValues: 3,
  topValueProductCount: 48,
  topShare: 52.2, // 48/92
  values: [
    { value: "500ml", productCount: 48 },
    { value: "750ml", productCount: 40 },
    { value: "1L", productCount: 20 },
  ],
});

const validLeaf = () => ({
  leafId: "PE-02",
  leafName: "Drink Bottles",
  productCount: 1000,
  auditMode: "sampled_estimate",
  sampleSize: 100,
  attributes: [capacityAttr()],
  colourPopulatedPct: 80,
  colourValues: [{ value: "Black", productCount: 40 }, { value: "White", productCount: 20 }],
});

describe("validateAttributeStat: sample-based coverage, not full-category-based", () => {
  it("accepts the worked example: 92/100 sampled products tagged, in a 1,000-product category", () => {
    expect(() => validateAttributeStat(capacityAttr(), "test")).not.toThrow();
  });

  it("rejects when populatedPct is computed against the full category count instead of the sample (the exact bug this fixes)", () => {
    // 100/738 = 13.5% -- this is what the OLD, buggy code would have
    // produced for a 100-sample out of a 738-product category. The schema
    // must reject it as inconsistent with taggedProductCount/sampleSize.
    const attr = { ...capacityAttr(), sampleSize: 100, taggedProductCount: 100, populatedPct: 13.5 };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/populatedPct/);
  });

  it("rejects taggedProductCount exceeding sampleSize", () => {
    const attr = { ...capacityAttr(), sampleSize: 50, taggedProductCount: 60 };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/cannot exceed/);
  });

  it("handles a product with multiple values for one attribute: valueOccurrenceCount can exceed taggedProductCount", () => {
    // 92 tagged products, but 108 total value occurrences (some products
    // have 2 values) -- this must be accepted, not treated as inconsistent.
    expect(() => validateAttributeStat(capacityAttr(), "test")).not.toThrow();
  });

  it("rejects when sum of per-value productCounts doesn't match valueOccurrenceCount", () => {
    const attr = { ...capacityAttr(), valueOccurrenceCount: 999 };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/valueOccurrenceCount/);
  });

  it("rejects a per-value productCount exceeding the attribute's taggedProductCount", () => {
    // Only override `values` -- the per-value check runs during the values
    // loop, before any of the post-loop sum/distinctValues/topShare
    // consistency checks, so the rest of capacityAttr()'s fields are
    // irrelevant to reaching this specific error path.
    const attr = { ...capacityAttr(), values: [{ value: "500ml", productCount: 200 }] };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/cannot exceed the attribute's taggedProductCount/);
  });

  it("rejects topValueProductCount that doesn't match the actual max per-value productCount", () => {
    const attr = { ...capacityAttr(), topValueProductCount: 999 };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/topValueProductCount/);
  });

  it("rejects topShare inconsistent with topValueProductCount/taggedProductCount", () => {
    const attr = { ...capacityAttr(), topShare: 10 };
    expect(() => validateAttributeStat(attr, "test")).toThrow(/topShare/);
  });

  it("rejects missing sampleSize", () => {
    const attr = { ...capacityAttr() };
    delete attr.sampleSize;
    expect(() => validateAttributeStat(attr, "test")).toThrow(/sampleSize/);
  });
});

function round1(n, d) {
  return Math.round((n / d) * 1000) / 10;
}

describe("validateLeafSnapshot", () => {
  it("accepts a well-formed leaf", () => {
    expect(() => validateLeafSnapshot(validLeaf())).not.toThrow();
  });

  it("accepts a zero-product category with no sampling data required at all", () => {
    expect(() => validateLeafSnapshot({ leafId: "X-01", leafName: "Empty", productCount: 0 })).not.toThrow();
  });

  it("accepts a fetchFailed leaf (positive productCount, every stratum errored) with no sampling data required, given a reason", () => {
    const leaf = { leafId: "PU", leafName: "Shirts", productCount: 2200, fetchFailed: true, fetchFailureReason: "All 5 stratified page fetches failed." };
    expect(() => validateLeafSnapshot(leaf)).not.toThrow();
  });

  it("rejects a fetchFailed leaf missing fetchFailureReason", () => {
    const leaf = { leafId: "PU", leafName: "Shirts", productCount: 2200, fetchFailed: true };
    expect(() => validateLeafSnapshot(leaf)).toThrow(/fetchFailureReason/);
  });

  it("accepts a sample smaller than the full category without complaint (this is expected/normal) but still requires auditMode/sampleSize", () => {
    const leaf = { ...validLeaf(), sampleSize: 40, attributes: [{ ...capacityAttr(), sampleSize: 40, taggedProductCount: 30, populatedPct: 75, distinctValues: 2, topShare: round1(15, 30), topValueProductCount: 15, valueOccurrenceCount: 30, values: [{ value: "500ml", productCount: 15 }, { value: "750ml", productCount: 15 }] }] };
    expect(() => validateLeafSnapshot(leaf)).not.toThrow();
  });

  it("rejects a leaf missing auditMode", () => {
    const leaf = validLeaf();
    delete leaf.auditMode;
    expect(() => validateLeafSnapshot(leaf)).toThrow(/auditMode/);
  });

  it("rejects an invalid auditMode value", () => {
    const leaf = { ...validLeaf(), auditMode: "guessed" };
    expect(() => validateLeafSnapshot(leaf)).toThrow(/auditMode/);
  });

  it("accepts a 'complete_paginated' auditMode where sampleSize equals productCount (a small category, every page fetched)", () => {
    const leaf = { ...validLeaf(), productCount: 100, sampleSize: 100, auditMode: "complete_paginated", attributes: [{ ...capacityAttr(), sampleSize: 100 }] };
    expect(() => validateLeafSnapshot(leaf)).not.toThrow();
  });

  it("rejects sampleSize exceeding productCount", () => {
    const leaf = { ...validLeaf(), productCount: 50, sampleSize: 100 };
    expect(() => validateLeafSnapshot(leaf)).toThrow(/sampleSize.*cannot exceed/);
  });

  it("rejects when an attribute's sampleSize disagrees with the leaf's own sampleSize (a response returning fewer products than requested for one call but not reflected consistently)", () => {
    // sampleSize=92 must itself be internally consistent with the rest of
    // the attribute stat (taggedProductCount=92 -> populatedPct=100) so that
    // this test exercises the leaf-vs-attribute sampleSize mismatch
    // specifically, not an unrelated internal-consistency failure.
    const leaf = { ...validLeaf(), sampleSize: 100, attributes: [{ ...capacityAttr(), sampleSize: 92, populatedPct: 100 }] };
    expect(() => validateLeafSnapshot(leaf)).toThrow(/sampleSize.*does not match/);
  });

  it("rejects colourPopulatedPct > 0 without colourValues", () => {
    const leaf = validLeaf();
    delete leaf.colourValues;
    expect(() => validateLeafSnapshot(leaf)).toThrow(/colourValues/);
  });

  it("rejects a malformed colourValues entry (missing productCount)", () => {
    const leaf = { ...validLeaf(), colourValues: [{ value: "Black" }] };
    expect(() => validateLeafSnapshot(leaf)).toThrow(/colourValues/);
  });
});

describe("validateSnapshot: duplicate leaf ID detection", () => {
  it("accepts a snapshot with all-unique leaf IDs", () => {
    expect(() => validateSnapshot({ fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [validLeaf(), { ...validLeaf(), leafId: "PE-01" }] })).not.toThrow();
  });

  it("FAILS when the same leafId appears twice, rather than silently letting a later entry overwrite an earlier one", () => {
    const snapshot = { fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [validLeaf(), { ...validLeaf() }] }; // both PE-02
    expect(() => validateSnapshot(snapshot)).toThrow(SchemaError);
    expect(() => validateSnapshot(snapshot)).toThrow(/Duplicate leafId "PE-02"/);
  });

  it("rejects an empty leaves array", () => {
    expect(() => validateSnapshot({ fetchedAt: "2026-01-01T00:00:00.000Z", leaves: [] })).toThrow(/non-empty array/);
  });

  it("rejects a snapshot missing fetchedAt", () => {
    expect(() => validateSnapshot({ leaves: [validLeaf()] })).toThrow(/fetchedAt/);
  });
});
