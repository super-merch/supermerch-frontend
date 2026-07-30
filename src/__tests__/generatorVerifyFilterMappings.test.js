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

// Two buckets each -- enough to exercise per-bucket survival (>= 2 needed to
// keep the question) without every test having to mock all 6 real quantity
// buckets or all 5 real budget buckets.
const moqQuestion = {
  id: "moq",
  type: "query",
  queryParam: "moq",
  options: [
    { label: "1–24", value: "24" },
    { label: "50–99", value: "99" },
  ],
};
const budgetQuestion = {
  id: "budget",
  type: "price",
  options: [
    { label: "Under $5", value: "0:5" },
    { label: "$5–$10", value: "5:10" },
  ],
};

function urlParams(url) {
  return new URL(url).searchParams;
}

describe("verifyLeafMappings: presence-mode single-value attribute question (e.g. Workwear Compliance:Hi-Vis)", () => {
  const complianceQuestion = {
    id: "compliance",
    type: "attribute",
    attributeName: "Compliance",
    singleValueAllowed: true,
    options: [{ label: "Hi-Vis", value: "Hi-Vis" }],
  };

  it("keeps a single-option presence question when the generator already marked it singleValueAllowed", async () => {
    const entry = leaf([complianceQuestion, moqQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(10, [product({ id: "m", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (!p.has("attribute_value")) return response(100); // baseline
      return response(20, [product({ id: "a", attrs: ["Compliance: Hi-Vis"] })]);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const report = result.questions.find((q) => q.id === "compliance");
    expect(report.survivingOptions).toHaveLength(1);
    expect(report.questionSurvives).toBe(true); // 1 option is enough for a singleValueAllowed question
    expect(result.survivingQuestions.some((q) => q.id === "compliance")).toBe(true);
  });

  it("still drops a normal (non-singleValueAllowed) question when only 1 option survives", async () => {
    const entry = leaf([capacityQuestion, moqQuestion]); // capacityQuestion has 3 options, none marked singleValueAllowed
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(10, [product({ id: "m", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (!p.has("attribute_value")) return response(100);
      const value = p.get("attribute_value");
      if (value === "500ml") return response(20, [product({ id: "a", attrs: ["Capacity: 500ml"] })]);
      return response(0); // 750ml and 1L both fail -- only 1 of 3 survives
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const report = result.questions.find((q) => q.id === "capacity");
    expect(report.survivingOptions).toHaveLength(1);
    expect(report.questionSurvives).toBe(false);
  });
});

describe("verifyLeafMappings: exhaustive per-option checking", () => {
  it("tests EVERY option (not just the top one), removes only the option that fails, and keeps the question when >=2 survive", async () => {
    // Paired with moqQuestion so the leaf has 2 real surviving questions overall --
    // this test is about per-option removal within ONE question, not the
    // separate "at least 2 questions to ship" policy (see its own describe block).
    const entry = leaf([capacityQuestion, moqQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(10, [product({ id: "m", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
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

describe("verifyLeafMappings: quantity/budget per-bucket checks", () => {
  it("tests every quantity bucket and every budget bucket individually, keeping both questions when every bucket passes", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      // priceBreaks qty:1 and price:5 both satisfy every one of this fixture's buckets (24, 99, "0:5", "5:10") --
      // this test is about the per-bucket PLUMBING (every bucket gets its own request, survivors are kept), not
      // about deliberately varying pass/fail per bucket (see the next tests for that).
      if (p.has("moq") && p.has("min_price")) return response(5, [product({ id: "c", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]); // combined check
      if (p.has("moq")) return response(10, [product({ id: "a", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 5 })]);
      return response(100); // baseline
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.options).toHaveLength(2); // both buckets tested individually
    expect(result.quantityCheck.questionSurvives).toBe(true);
    expect(result.budgetCheck.options).toHaveLength(2);
    expect(result.budgetCheck.questionSurvives).toBe(true);
    expect(result.combinedQuantityBudgetCheck.passed).toBe(true);
    expect(result.survivingQuestions.map((q) => q.id).sort()).toEqual(["budget", "moq"]);
    // each surviving question keeps only the buckets that actually passed
    expect(result.survivingQuestions.find((q) => q.id === "moq").options).toHaveLength(2);
  });

  it("removes only the one budget bucket that fails, keeping the budget question when the other bucket still passes", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq") && p.has("min_price")) return response(3, [product({ id: "c", price: 4, priceBreaks: [{ qty: 24, price: 4 }] })]);
      if (p.has("moq")) return response(10, [product({ id: "a", price: 4, priceBreaks: [{ qty: 24, price: 4 }] })]);
      if (p.get("max_price") === "5") return response(0); // "Under $5" bucket: genuinely nothing that cheap
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 7 })]); // "$5-$10" bucket: fine
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.budgetCheck.survivingOptions.map((o) => o.value)).toEqual(["5:10"]);
    // only 1 bucket survives (< MIN_SURVIVING_OPTIONS of 2) -- the whole budget question is removed, but for an
    // honest, bucket-specific reason recorded per-option, not a single fixed representative-value failure.
    expect(result.budgetCheck.questionSurvives).toBe(false);
    expect(result.removedQuestionIds).toContain("budget");
    // moq alone would have survived, but a single surviving question isn't
    // enough to ship a real Finder (never ship a single-weak-question
    // Finder) -- moq is demoted too, and the whole leaf fails.
    expect(result.survivingQuestions).toEqual([]);
    expect(result.removedQuestionIds).toContain("moq");
    expect(result.belowMinimumQuestions).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("a high-minimum-order-quantity category loses only its low-quantity bucket, not the whole moq question, once at least 2 buckets still pass", async () => {
    const threeOptionMoq = { ...moqQuestion, options: [...moqQuestion.options, { label: "500+", value: "500" }] };
    // Paired with budgetQuestion (fully passing) so the leaf ships overall --
    // this test is about per-bucket moq removal, not the separate "at least
    // 2 questions to ship" policy.
    const entry = leaf([threeOptionMoq, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("min_price")) return response(10, [product({ id: "b", price: 5 })]);
      const moq = p.get("moq");
      if (moq === "24") return response(0); // nothing orderable that low
      if (moq) return response(10, [product({ id: "a", price: 4, priceBreaks: [{ qty: Number(moq), price: 4 }] })]);
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.removedOptions).toEqual([{ value: "24", reason: "zero results" }]);
    expect(result.quantityCheck.survivingOptions.map((o) => o.value).sort()).toEqual(["500", "99"]);
    expect(result.quantityCheck.questionSurvives).toBe(true);
    expect(result.survivingQuestions.find((q) => q.id === "moq")).toBeDefined();
  });

  it("removes budget (not moq) when the combined check fails even though every individual bucket passed -- the PS/Phone & Technology precedent", async () => {
    // Paired with capacityQuestion (fully passing) so moq+capacity still add
    // up to 2 surviving questions after budget is demoted -- this test is
    // about which question the combined-check failure demotes, not the
    // separate "at least 2 questions to ship" policy.
    const entry = leaf([moqQuestion, budgetQuestion, capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (!p.has("moq") && !p.has("min_price") && p.has("attribute_value")) {
        return response(20, [product({ id: "cap", attrs: [`Capacity: ${p.get("attribute_value")}`] })]);
      }
      if (p.has("moq") && p.has("min_price")) throw new Error("HTTP 500 for combined request");
      if (p.has("moq")) return response(10, [product({ id: "a", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 5 })]);
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.questionSurvives).toBe(true);
    expect(result.budgetCheck.questionSurvives).toBe(true);
    expect(result.combinedQuantityBudgetCheck.passed).toBe(false);
    expect(result.removedQuestionIds).toContain("budget");
    expect(result.survivingQuestions.map((q) => q.id).sort()).toEqual(["capacity", "moq"]);
  });

  it("flags a null computed price as a bucket failure", async () => {
    const entry = leaf([budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("min_price")) return response(3, [{ _id: "x", meta: { id: "x" }, overview: {}, product: { prices: { price_groups: [] } }, pricingSummary: {} }]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.budgetCheck.questionSurvives).toBe(false);
    expect(result.budgetCheck.options.every((o) => o.reason === "product x: null computed price")).toBe(true);
  });

  it("captures up to 3 concrete example products per bucket for business review reporting (e.g. the Shirts Under-$5 review)", async () => {
    const entry = leaf([budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.get("max_price") === "5") {
        return response(4, [product({ id: "a", price: 3 }), product({ id: "b", price: 4 }), product({ id: "c", price: 2 }), product({ id: "d", price: 4.5 })]);
      }
      if (p.has("min_price")) return response(8, [product({ id: "e", price: 7 })]);
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    const underFive = result.budgetCheck.options.find((o) => o.value === "0:5");
    expect(underFive.itemCount).toBe(4);
    expect(underFive.examples).toHaveLength(3); // capped even though 4 products were returned
    expect(underFive.examples[0]).toMatchObject({ id: "a", price: 3 });
  });
});

describe("verifyLeafMappings: never ship a single-weak-question Finder", () => {
  it("fails the whole leaf when only 1 question survives, even though that question itself is genuinely valid", async () => {
    // moq alone passes every check on its own merits -- but a 1-question
    // Finder (whether that's Colour alone, quantity alone, or one lone
    // attribute) isn't the intended "quantity, budget, up to two
    // attributes, colour last" experience, and shipping it silently would
    // look identical to a fully-working Finder in the manifest.
    const entry = leaf([moqQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(10, [product({ id: "a", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.questionSurvives).toBe(true); // moq itself is fine in isolation
    expect(result.survivingQuestions).toEqual([]); // but doesn't ship alone
    expect(result.removedQuestionIds).toContain("moq");
    expect(result.belowMinimumQuestions).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("ships normally once at least 2 questions survive", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(10, [product({ id: "a", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 5 })]);
      return response(100);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.survivingQuestions.map((q) => q.id).sort()).toEqual(["budget", "moq"]);
    expect(result.belowMinimumQuestions).toBe(false);
    expect(result.passed).toBe(true);
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

  it("checks orderable-at-quantity across ALL price groups, not just the first, matching the backend's own multi-group tier pricing", async () => {
    // The backend's real quantity-aware price resolution already spans
    // every price_groups entry (getAllV2Products.js), not just index 0 -- a
    // product whose ONLY qualifying price break lives in its second price
    // group must still pass this check, not be wrongly reported unorderable.
    const productWithBreakInSecondGroupOnly = {
      _id: "p1",
      meta: { id: "p1" },
      overview: {},
      product: {
        categorisation: { promodata_attributes: [] },
        colours: { list: [] },
        prices: {
          price_groups: [
            { base_price: { price_breaks: [{ qty: 1000, price: 20 }] } }, // group 0: never qualifies for this fixture's test buckets (24, 99)
            { base_price: { price_breaks: [{ qty: 1, price: 18 }] } }, // group 1: qualifies at both 24 and 99
          ],
        },
      },
      pricingSummary: { finalMinPrice: 18 },
    };
    const entry = leaf([moqQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("moq")) return response(5, [productWithBreakInSecondGroupOnly]);
      return response(50);
    };
    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.questionSurvives).toBe(true);
  });

  it("treats price breaks as authoritative when overview.min_qty contradicts them", async () => {
    const contradictoryProduct = product({
      id: "contradictory",
      minQty: 1,
      price: 8,
      priceBreaks: [{ qty: 500, price: 8 }],
    });
    const entry = leaf([moqQuestion, capacityQuestion]);
    const fetchJson = async (url) => {
      const p = urlParams(url);
      if (p.has("attribute_value")) {
        return response(5, [
          product({
            id: "capacity",
            attrs: [`Capacity:${p.get("attribute_value")}`],
          }),
        ]);
      }
      if (p.has("moq")) return response(1, [contradictoryProduct]);
      return response(50);
    };

    const result = await verifyLeafMappings(entry, { fetchJson, apiBase });
    expect(result.quantityCheck.questionSurvives).toBe(false);
    expect(result.removedQuestionIds).toContain("moq");
  });

  it("records a client-products diagnostic result without letting it affect passed/failed", async () => {
    const entry = leaf([moqQuestion, budgetQuestion]);
    const fetchJson = async (url) => {
      if (url.includes("/api/client-products")) throw new Error("client-products is down");
      const p = urlParams(url);
      if (p.has("moq") && p.has("min_price")) return response(5, [product({ id: "c", price: 5, priceBreaks: [{ qty: 1, price: 5 }] })]);
      if (p.has("moq")) return response(5, [product({ id: "a", price: 5, priceBreaks: [{ qty: 24, price: 5 }, { qty: 99, price: 5 }] })]);
      if (p.has("min_price")) return response(8, [product({ id: "b", price: 5 })]);
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
