import { describe, expect, it } from "vitest";
import { dedupeProductsById } from "../../scripts/category-finder/lib/dedupe.mjs";

describe("dedupeProductsById: prefers MongoDB _id over meta.id", () => {
  it("does NOT collapse two products that share the same meta.id but have different _id values", () => {
    // This is the exact bug scenario: meta.id can be shared across genuinely
    // distinct product records, so deduping on meta.id alone would wrongly
    // treat these as one sampled product.
    const products = [
      { _id: "mongo-1", meta: { id: 42 } },
      { _id: "mongo-2", meta: { id: 42 } },
    ];
    expect(dedupeProductsById(products)).toHaveLength(2);
  });

  it("does NOT collapse two products that both lack meta.id but have different _id values", () => {
    const products = [{ _id: "mongo-1" }, { _id: "mongo-2" }];
    expect(dedupeProductsById(products)).toHaveLength(2);
  });

  it("collapses two entries that share the same _id, even if meta.id differs", () => {
    // _id is the authoritative catalogue-record identity -- if two entries
    // report the same _id they're the same underlying record regardless of
    // what meta.id says.
    const products = [
      { _id: "mongo-1", meta: { id: 1 } },
      { _id: "mongo-1", meta: { id: 2 } },
    ];
    expect(dedupeProductsById(products)).toHaveLength(1);
  });

  it("falls back to meta.id when _id is absent", () => {
    const products = [{ meta: { id: 7 } }, { meta: { id: 7 } }, { meta: { id: 8 } }];
    const deduped = dedupeProductsById(products);
    expect(deduped).toHaveLength(2);
    expect(deduped.map((p) => p.meta.id)).toEqual([7, 8]);
  });

  it("keeps every product when neither _id nor meta.id is present on any of them", () => {
    // No identity at all means there's no basis to treat them as duplicates.
    const products = [{}, {}, {}];
    expect(dedupeProductsById(products)).toHaveLength(3);
  });

  it("preserves the first-seen product for a given identity and the original relative order", () => {
    const first = { _id: "mongo-1", overview: { name: "First seen" } };
    const duplicate = { _id: "mongo-1", overview: { name: "Duplicate" } };
    const other = { _id: "mongo-2", overview: { name: "Other" } };
    const deduped = dedupeProductsById([first, duplicate, other]);
    expect(deduped).toEqual([first, other]);
  });
});
