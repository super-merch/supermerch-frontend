import { describe, expect, it } from "vitest";
import { reconcileLeaves, reconcileParents, validateAuthoritativeInventory, ReconciliationError } from "../../scripts/category-finder/lib/reconcile.mjs";

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

describe("validateAuthoritativeInventory", () => {
  it("passes when leaf IDs, parent IDs, and their combination are all unique", () => {
    expect(() => validateAuthoritativeInventory(authoritative)).not.toThrow();
  });

  it("fails on a duplicate leaf ID, since a Set built from the array would silently collapse it before any later Set-based check could see it", () => {
    const dup = { leaves: [{ id: "A" }, { id: "B" }, { id: "A" }], parents: [{ id: "P1" }] };
    expect(() => validateAuthoritativeInventory(dup)).toThrow(ReconciliationError);
    expect(() => validateAuthoritativeInventory(dup)).toThrow(/Duplicate leaf ID "A" .* indices 0 and 2/);
  });

  it("fails on a duplicate parent ID", () => {
    const dup = { leaves: [{ id: "A" }], parents: [{ id: "P1" }, { id: "P2" }, { id: "P1" }] };
    expect(() => validateAuthoritativeInventory(dup)).toThrow(/Duplicate parent ID "P1" .* indices 0 and 2/);
  });

  it("fails when the same ID appears as both a leaf and a parent/group page", () => {
    const collision = { leaves: [{ id: "A" }, { id: "PE" }], parents: [{ id: "PE" }, { id: "P2" }] };
    expect(() => validateAuthoritativeInventory(collision)).toThrow(ReconciliationError);
    expect(() => validateAuthoritativeInventory(collision)).toThrow(/BOTH a leaf and a parent.*PE/);
  });

  it("reports every problem found in one error, not just the first", () => {
    const multi = { leaves: [{ id: "A" }, { id: "A" }], parents: [{ id: "P1" }, { id: "P1" }] };
    try {
      validateAuthoritativeInventory(multi);
      throw new Error("expected validateAuthoritativeInventory to throw");
    } catch (err) {
      expect(err.message).toMatch(/Duplicate leaf ID "A"/);
      expect(err.message).toMatch(/Duplicate parent ID "P1"/);
    }
  });
});
