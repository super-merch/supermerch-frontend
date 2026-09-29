import { afterEach, describe, expect, it, vi } from "vitest";

// Regression coverage for "show me more options" returning the same
// products again — the underlying catalog search is deterministic, so
// nothing in the search itself changes call to call. runTool now accepts an
// `excludeIds` context (product ids already shown earlier in the
// conversation, threaded from chat.js/agent.js) and mechanically filters
// them out, rather than relying on the model noticing and avoiding its own
// earlier picks from prose alone.

const searchProductsMock = vi.fn();
vi.mock("../catalogApi.js", () => ({
  searchProducts: (...args) => searchProductsMock(...args),
}));

const PRODUCTS = [
  { id: 1, name: "Alpha Mug", moq: 25, in_stock: true },
  { id: 2, name: "Beta Mug", moq: 25, in_stock: true },
  { id: 3, name: "Gamma Mug", moq: 25, in_stock: true },
];

afterEach(() => {
  searchProductsMock.mockReset();
});

describe("runTool excludeIds — search_products", () => {
  it("filters out products already shown earlier in the conversation", async () => {
    searchProductsMock.mockResolvedValue(PRODUCTS);
    const { runTool } = await import("../tools.js");

    const result = await runTool("search_products", { query: "mugs" }, { excludeIds: [1, 2] });

    expect(result.products.map((p) => p.id)).toEqual([3]);
    expect(result.count).toBe(1);
    expect(result.note).toMatch(/2 product\(s\) already shown/);
  });

  it("adds no note and returns everything when nothing was previously shown", async () => {
    searchProductsMock.mockResolvedValue(PRODUCTS);
    const { runTool } = await import("../tools.js");

    const result = await runTool("search_products", { query: "mugs" }, { excludeIds: [] });

    expect(result.products.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(result.note).toBeUndefined();
  });

  it("works with no context argument at all (backward compatible)", async () => {
    searchProductsMock.mockResolvedValue(PRODUCTS);
    const { runTool } = await import("../tools.js");

    const result = await runTool("search_products", { query: "mugs" });

    expect(result.products.map((p) => p.id)).toEqual([1, 2, 3]);
  });
});

describe("runTool excludeIds — filter_products", () => {
  it("filters out excluded products and forwards a raised limit", async () => {
    searchProductsMock.mockResolvedValue(PRODUCTS);
    const { runTool } = await import("../tools.js");

    const result = await runTool(
      "filter_products",
      { category: "mug", limit: 20 },
      { excludeIds: [1] }
    );

    expect(searchProductsMock).toHaveBeenCalledWith(
      expect.objectContaining({ category: "mug", limit: 20 })
    );
    expect(result.products.map((p) => p.id)).toEqual([2, 3]);
    expect(result.note).toMatch(/1 product\(s\) already shown/);
  });

  it("defaults limit to 10 when the model doesn't specify one", async () => {
    searchProductsMock.mockResolvedValue(PRODUCTS);
    const { runTool } = await import("../tools.js");

    await runTool("filter_products", { category: "mug" }, {});

    expect(searchProductsMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 10 }));
  });
});
