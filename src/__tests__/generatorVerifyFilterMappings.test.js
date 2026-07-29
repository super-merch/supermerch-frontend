import { describe, expect, it } from "vitest";
import { verifyLeafMappings } from "../../scripts/category-finder/lib/verifyFilterMappings.mjs";

const apiBase = "https://api.example.test";

function product({ id = "p1", attrs = [], colours = [], price = 10, minQty = null, priceBreaks = null }) {
  return {
    _id: id,
    meta: { id },
    overview: { min_qty: minQty },
    product: {
      categorisation: { promodata_attributes: attrs },
      colours: { list: colours.map((name) => ({ name, colours: [name], appa_colours: [name] })) },
      prices: { price_groups: priceBreaks ? [{ base_price: { price_breaks: priceBreaks } }] : [] },
    },
    pricingSummary: { finalMinPrice: price },
  };
}

function response(itemCount, products = []) {
  return { item_count: itemCount, data: products };
}

function leaf(questions) {
  return { categoryId: "PA-01", questions };
}

const capacityQuestion = {
  id: "capacity",
  type: "attribute",
  attributeName: "Capacity",
  options: [
    { label: "500ml", value: "500ml" },
    { label: "750ml", value: "750ml" },
    { label: "Broken", value: "1L" },
  ],
};

const colourQuestion = {
  id: "colour",
  type: "query",
  queryParam: "colors",
  options: [
    { label: "Black", value: "Black" },
    { label: "White", value: "White" },
  ],
};

const moqQuestion = { id: "moq", type: "query", queryParam: "moq", options: [] };
const budgetQuestion = { id: "budget", type: "price", options: [] };

function urlParams(url) {
  return new URL(url).searchParams;
}

describe("verifyLeafMappings: exhaustive per-option checking", () => {
  it("tests EVERY option (not just the top one), removes only the option that fails, and keeps the question when >=2 survive", async () => {
    const entry = leaf([capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("attribute_value")) return response(100); // baseline
      const value = p.get("attribute_value");
      if (value === "500ml") return response(40, [product({ id: "a", attrs: ["Capacity: 500ml"] })]);
      if (value === "750ml") return response(30, [product({ id: "b", attrs: ["Capacity: 750ml"] })]);
      if (value === "1L") return response(0); // fails: zero results
      throw new Error(`unexpected value ${value}`);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const capacityReport = result.questions.find((q) => q.id === "capacity");
    expect(capacityReport.options).toHaveLength(3); // every option was tested
    expect(capacityReport.survivingOptions.map((o) => o.value)).toEqual(["500ml", "750ml"]);
    expect(capacityReport.removedOptions).toEqual([{ value: "1L", reason: "filtered request returned zero results" }]);
    expect(capacityReport.questionSurvives).toBe(true);
    expect(result.survivingQuestions.find((q) => q.id === "capacity").options).toHaveLength(2);
  });

  it("drops the whole question when fewer than 2 options survive", async () => {
    const entry = leaf([colourQuestion]); // 2 options, one will fail
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("colors[]")) return response(50);
      const value = p.get("colors[]");
      if (value === "Black") return response(20, [product({ id: "a", colours: ["Black"] })]);
      return response(0); // White fails
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const colourReport = result.questions.find((q) => q.id === "colour");
    expect(colourReport.questionSurvives).toBe(false);
    expect(result.survivingQuestions.find((q) => q.id === "colour")).toBeUndefined();
    expect(result.removedQuestionIds).toContain("colour");
  });

  it("fails an option whose filtered count does not strictly narrow below the FRESH baseline (not an old snapshot count)", async () => {
    const entry = leaf([capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("attribute_value")) return response(10); // fresh baseline is only 10
      const value = p.get("attribute_value");
      // every option "narrows" against a stale count of 100 but NOT against the fresh 10
      if (value === "500ml") return response(10, [product({ id: "a", attrs: ["Capacity: 500ml"] })]);
      return response(10, [product({ id: "b", attrs: [`Capacity: ${value}`] })]);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.liveUnfilteredCount).toBe(10);
    const capacityReport = result.questions.find((q) => q.id === "capacity");
    expect(capacityReport.options.every((o) => !o.passed)).toBe(true);
    expect(capacityReport.options[0].reason).toMatch(/does not narrow below the fresh unfiltered count \(10\)/);
  });

  it("fails an option when the sampled returned products don't actually carry the requested attribute value", async () => {
    const entry = leaf([capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("attribute_value")) return response(100);
      const value = p.get("attribute_value");
      if (value === "500ml") return response(5, [product({ id: "a", attrs: ["Capacity: 750ml"] })]); // WRONG attribute on returned product
      return response(20, [product({ id: "b", attrs: [`Capacity: ${value}`] })]);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const opt = result.questions.find((q) => q.id === "capacity").options.find((o) => o.value === "500ml");
    expect(opt.passed).toBe(false);
    expect(opt.sampleProductsValidated).toBe(false);
    expect(opt.reason).toMatch(/do not actually carry/);
  });

  it("matches a comma-joined multi-value option against any of its constituent raw values", async () => {
    const multiValueQuestion = {
      id: "material",
      type: "attribute",
      attributeName: "Material",
      options: [{ label: "Eco materials", value: "Bamboo,Wheat Straw,Cork,rPET" }, { label: "Other", value: "Other" }],
    };
    const entry = leaf([multiValueQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("attribute_value")) return response(100);
      const value = p.get("attribute_value");
      if (value === "Bamboo,Wheat Straw,Cork,rPET") return response(12, [product({ id: "a", attrs: ["Material: Cork"] })]); // product has just ONE of the joined values
      return response(8, [product({ id: "b", attrs: ["Material: Other"] })]);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const opt = result.questions.find((q) => q.id === "material").options.find((o) => o.value === "Bamboo,Wheat Straw,Cork,rPET");
    expect(opt.passed).toBe(true);
    expect(opt.sampleProductsValidated).toBe(true);
  });
});

describe("verifyLeafMappings: quantity/budget/combined checks", () => {
  it("passes quantity/budget/combined when prices are in range and orderable", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq") && p.has("min_price")) return response(5, [product({ id: "c", price: 12, priceBreaks: [{ qty: 50, price: 12 }] })]);
      if (p.has("moq")) return response(10, [product({ id: "a", price: 15, priceBreaks: [{ qty: 50, price: 15 }] })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 15 })]);
      return response(100); // baseline
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.passed).toBe(true);
    expect(result.budgetCheck.passed).toBe(true);
    expect(result.combinedQuantityBudgetCheck.passed).toBe(true);
    expect(result.survivingQuestions.map((q) => q.id).sort()).toEqual(["budget", "moq"]);
  });

  it("removes the budget question when a product's computed price is outside the requested range", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq") && p.has("min_price")) return response(5, [product({ id: "c", price: 999 })]);
      if (p.has("moq")) return response(10, [product({ id: "a", price: 15 })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 999 })]); // out of the $5-$20 range
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.budgetCheck.passed).toBe(false);
    expect(result.budgetCheck.reason).toMatch(/above requested max/);
    expect(result.removedQuestionIds).toContain("budget");
    expect(result.survivingQuestions.map((q) => q.id)).toEqual(["moq"]);
  });

  it("removes budget (not moq) when the combined check fails even though each alone passed -- the PS/Phone & Technology precedent", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq") && p.has("min_price")) throw new Error("HTTP 500 for combined request");
      if (p.has("moq")) return response(10, [product({ id: "a", price: 15 })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 15 })]);
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.passed).toBe(true);
    expect(result.budgetCheck.passed).toBe(true);
    expect(result.combinedQuantityBudgetCheck.passed).toBe(false);
    expect(result.removedQuestionIds).toContain("budget");
    expect(result.survivingQuestions.map((q) => q.id)).toEqual(["moq"]);
  });

  it("flags a null computed price as a failure", async () => {
    const entry = leaf([budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("min_price")) return response(3, [{ _id: "x", meta: { id: "x" }, overview: {}, product: { prices: { price_groups: [] } }, pricingSummary: {} }]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.budgetCheck.passed).toBe(false);
    expect(result.budgetCheck.reason).toMatch(/null computed price/);
  });
});

describe("verifyLeafMappings: overall leaf outcome", () => {
  it("passed=false when the fresh baseline fetch itself fails", async () => {
    const entry = leaf([capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("attribute_value")) throw new Error("HTTP 500 for baseline");
      return response(10, [product({ id: "a", attrs: [`Capacity: ${p.get("attribute_value")}`] })]);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.baselineOk).toBe(false);
    expect(result.passed).toBe(false);
  });

  it("passed=false and no surviving questions when everything fails", async () => {
    const entry = leaf([capacityQuestion, moqQuestion]);
    const fetchJson = async () => response(0);
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.survivingQuestions).toHaveLength(0);
    expect(result.passed).toBe(false);
  });

  it("records a client-products diagnostic result without letting it affect passed/failed", async () => {
    const entry = leaf([moqQuestion]);
    const fetchJson = async (url) => {
      if (url.includes("/api/client-products")) throw new Error("client-products is down");
      const p = urlParams(url);
      if (p.has("moq")) return response(5, [product({ id: "a", price: 15, priceBreaks: [{ qty: 50, price: 15 }] })]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.clientProductsDiagnostic.httpStatus).toBeNull();
    expect(result.clientProductsDiagnostic.note).toMatch(/diagnostic only/);
    expect(result.passed).toBe(true); // the diagnostic failure did not affect the real gating result
  });

  it("uses an injectable clock for verifiedAt so timestamps are deterministic in tests", async () => {
    const entry = leaf([moqQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(5, [product({ id: "a", price: 15 })]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase, now: () => "2026-01-01T00:00:00.000Z" });
    expect(result.verifiedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
