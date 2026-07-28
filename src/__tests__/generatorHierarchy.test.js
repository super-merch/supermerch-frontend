import { describe, expect, it } from "vitest";
import { flattenHierarchy, HierarchyError } from "../../scripts/category-finder/lib/hierarchy.mjs";

describe("flattenHierarchy", () => {
  it("flattens a simple one-level hierarchy (main -> subTypes)", () => {
    const roots = [
      { id: "PE", name: "Drinkware", subTypes: [{ id: "PE-01", name: "Coffee Mugs" }, { id: "PE-02", name: "Drink Bottles" }] },
    ];
    const { leaves, parents } = flattenHierarchy(roots);
    expect(leaves.map((l) => l.id)).toEqual(["PE-01", "PE-02"]);
    expect(parents.map((p) => p.id)).toEqual(["PE"]);
    expect(leaves[0].parentId).toBe("PE");
  });

  it("treats a zero-subtype main entry as a leaf itself", () => {
    const roots = [{ id: "PU", name: "Shirts" }];
    const { leaves, parents } = flattenHierarchy(roots);
    expect(leaves.map((l) => l.id)).toEqual(["PU"]);
    expect(parents).toHaveLength(0);
    expect(leaves[0].isMainItself).toBe(true);
  });

  it("handles nesting deeper than one level (a subType that itself has children)", () => {
    const roots = [
      {
        id: "A",
        name: "Group A",
        subTypes: [
          { id: "A-1", name: "Sub A1", subTypes: [{ id: "A-1-a", name: "Leaf A1a" }, { id: "A-1-b", name: "Leaf A1b" }] },
          { id: "A-2", name: "Sub A2" },
        ],
      },
    ];
    const { leaves, parents } = flattenHierarchy(roots);
    expect(leaves.map((l) => l.id).sort()).toEqual(["A-1-a", "A-1-b", "A-2"].sort());
    expect(parents.map((p) => p.id).sort()).toEqual(["A", "A-1"].sort());
    const leafA1a = leaves.find((l) => l.id === "A-1-a");
    expect(leafA1a.parentId).toBe("A-1"); // immediate parent, not the root
    expect(leafA1a.depth).toBe(2);
  });

  it("fails clearly on a duplicate category ID anywhere in the tree", () => {
    const roots = [
      { id: "A", name: "A", subTypes: [{ id: "X", name: "dup1" }] },
      { id: "B", name: "B", subTypes: [{ id: "X", name: "dup2" }] },
    ];
    expect(() => flattenHierarchy(roots)).toThrow(HierarchyError);
    expect(() => flattenHierarchy(roots)).toThrow(/Duplicate category ID "X"/);
  });

  it("fails clearly on a node missing an id", () => {
    const roots = [{ name: "No ID here" }];
    expect(() => flattenHierarchy(roots)).toThrow(HierarchyError);
    expect(() => flattenHierarchy(roots)).toThrow(/missing id/);
  });

  it("fails clearly on a node missing a name", () => {
    const roots = [{ id: "X" }];
    expect(() => flattenHierarchy(roots)).toThrow(HierarchyError);
    expect(() => flattenHierarchy(roots)).toThrow(/missing name/);
  });

  it("fails clearly when a children field is present but not an array", () => {
    const roots = [{ id: "A", name: "A", subTypes: "not-an-array" }];
    expect(() => flattenHierarchy(roots)).toThrow(HierarchyError);
    expect(() => flattenHierarchy(roots)).toThrow(/not an array/);
  });

  it("fails clearly on a circular reference (a node appearing in its own ancestry)", () => {
    const cyclic = { id: "A", name: "A" };
    cyclic.subTypes = [cyclic]; // A is its own child
    expect(() => flattenHierarchy([cyclic])).toThrow(HierarchyError);
  });

  it("rejects non-array roots", () => {
    expect(() => flattenHierarchy(null)).toThrow(HierarchyError);
    expect(() => flattenHierarchy({})).toThrow(HierarchyError);
  });
});
