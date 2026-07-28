import { describe, expect, it } from "vitest";
import { reconcileLeaves, reconcileParents, ReconciliationError } from "../../scripts/category-finder/lib/reconcile.mjs";

const authoritative = {
  leaves: [{ id: "A" }, { id: "B" }, { id: "C" }],
  parents: [{ id: "P1" }, { id: "P2" }],
};

const goodManifest = () => ({
  A: { categoryId: "A", finderMode: "curated" },
  B: { categoryId: "B", finderMode: "generic" },
  C: { categoryId: "C", finderMode: "excluded" },
});

describe("reconcileLeaves", () => {
  it("passes and returns correct counts when the manifest exactly matches the authoritative inventory", () => {
    const counts = reconcileLeaves(goodManifest(), authoritative);
    expect(counts).toEqual({ total: 3, curated: 1, inherited: 0, generic: 1, excluded: 1 });
  });

  it("fails when a leaf is MISSING from the manifest -- this is the core incomplete-snapshot regression guard", () => {
    const incomplete = goodManifest();
    delete incomplete.C;
    expect(() => reconcileLeaves(incomplete, authoritative)).toThrow(ReconciliationError);
    expect(() => reconcileLeaves(incomplete, authoritative)).toThrow(/Missing 1 authoritative leaf ID/);
  });

  it("fails when the manifest has an ID not present in the authoritative inventory", () => {
    const extra = { ...goodManifest(), Z: { categoryId: "Z", finderMode: "generic" } };
    expect(() => reconcileLeaves(extra, authoritative)).toThrow(/not present in the authoritative inventory/);
  });

  it("fails when finderMode counts don't sum to the authoritative total (defensive check even though structurally hard to hit)", () => {
    const manifest = goodManifest();
    manifest.A.finderMode = "not_a_real_mode";
    expect(() => reconcileLeaves(manifest, authoritative)).toThrow(/unknown finderMode/);
  });
});

describe("reconcileParents", () => {
  it("passes when parent IDs match exactly", () => {
    expect(() => reconcileParents({ P1: {}, P2: {} }, authoritative)).not.toThrow();
  });

  it("fails when a parent page is missing", () => {
    expect(() => reconcileParents({ P1: {} }, authoritative)).toThrow(ReconciliationError);
  });

  it("fails when an unexpected parent page ID appears", () => {
    expect(() => reconcileParents({ P1: {}, P2: {}, P3: {} }, authoritative)).toThrow(/Unexpected parent page ID/);
  });
});
