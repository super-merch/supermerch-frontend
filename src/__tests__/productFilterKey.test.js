import { describe, expect, it } from "vitest";
import { buildProductsFilterKey } from "../utils/productFilterKey";

const base = {
  productTypeId: "PE-02",
  category: "Drinkware",
  searchTerm: "",
  sortOption: "lowToHigh",
  pricerange: { min_price: 5, max_price: 20 },
  colors: ["Blue"],
  expressWindow: "",
  moq: "99",
  attributes: [{ name: "Material", value: "Steel" }],
};

describe("buildProductsFilterKey", () => {
  it.each([
    ["moq", { moq: "249" }],
    ["attributes", { attributes: [{ name: "Material", value: "Plastic" }] }],
    ["price", { pricerange: { min_price: 10, max_price: 20 } }],
    ["colour", { colors: ["Red"] }],
    ["sort", { sortOption: "highToLow" }],
  ])("changes when %s changes", (_label, change) => {
    expect(buildProductsFilterKey({ ...base, ...change })).not.toBe(
      buildProductsFilterKey(base),
    );
  });

  it("is stable when equivalent attributes arrive in a different order", () => {
    const attributes = [
      { name: "Material", value: "Steel" },
      { name: "Capacity", value: "750ml" },
    ];
    expect(buildProductsFilterKey({ ...base, attributes })).toBe(
      buildProductsFilterKey({ ...base, attributes: [...attributes].reverse() }),
    );
  });
});
