import { describe, expect, it } from "vitest";
import { verifyLeafMappings } from "../../scripts/category-finder/lib/verifyFilterMappings.mjs";

const apiBase = "https://api.example.test";

function leafWithQuestions(questions) {
  return { categoryId: "PA-01", questions };
}

const capacityQuestion = {
  id: "capacity",
  type: "attribute",
  attributeName: "Capacity",
  options: [
    { label: "500ml", value: "500ml" },
    { label: "750ml", value: "750ml" },
  ],
};

const colourQuestion = {
  id: "colour",
  type: "query",
  queryParam: "colors",
  options: [{ label: "Black", value: "Black" }],
};

const moqQuestion = { id: "moq", type: "query", queryParam: "moq", options: [{ label: "1–24", value: "24" }] };
const budgetQuestion = { id: "budget", type: "price", options: [{ label: "Under $5", value: "0:5" }] };

describe("verifyLeafMappings", () => {
  it("passes when every testable question's top option returns a non-empty, narrowing result", async () => {
    const entry = leafWithQuestions([capacityQuestion, colourQuestion]);
    const fetchJson = async (url) => {
      if (url.includes("attribute_name=Capacity")) return { item_count: 40 };
      if (url.includes("colors%5B%5D=Black") || url.includes("colors[]=Black")) return { item_count: 25 };
      throw new Error(`unexpected URL in test: ${url}`);
    };
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.checks).toHaveLength(2);
    expect(result.checks.every((c) => c.ok)).toBe(true);
  });

  it("is vacuously verified when the leaf has no attribute/colour questions (moq/budget only)", async () => {
    const entry = leafWithQuestions([moqQuestion, budgetQuestion]);
    const fetchJson = async () => {
      throw new Error("should never be called -- nothing category-specific to verify");
    };
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(true);
    expect(result.checks).toEqual([]);
  });

  it("fails when a filtered request returns zero results", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    const fetchJson = async () => ({ item_count: 0 });
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(false);
    expect(result.checks[0].ok).toBe(false);
    expect(result.checks[0].reason).toMatch(/zero results/);
    expect(result.reason).toMatch(/1\/1 question/);
  });

  it("fails when a filtered request returns MORE results than the leaf's unfiltered count (filter is not narrowing / silently ignored)", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    const fetchJson = async () => ({ item_count: 150 });
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(false);
    expect(result.checks[0].reason).toMatch(/silently ignored/);
  });

  it("fails when a filtered request returns EXACTLY the unfiltered count (a strict-narrowing requirement, not just <=, since an equal count reads as the filter being ignored)", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    const fetchJson = async () => ({ item_count: 100 });
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(false);
    expect(result.checks[0].reason).toMatch(/silently ignored/);
  });

  it("fails when the request itself errors (network failure, non-2xx status)", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    const fetchJson = async () => {
      throw new Error("HTTP 500 for ...");
    };
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(false);
    expect(result.checks[0].itemCount).toBeNull();
    expect(result.checks[0].reason).toMatch(/request failed/);
  });

  it("requires ALL testable questions to pass -- one failure fails the whole leaf, not just that question", async () => {
    const entry = leafWithQuestions([capacityQuestion, colourQuestion]);
    const fetchJson = async (url) => {
      if (url.includes("attribute_name=Capacity")) return { item_count: 40 };
      return { item_count: 0 }; // colour fails
    };
    const result = await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(result.verified).toBe(false);
    expect(result.checks.find((c) => c.questionId === "capacity").ok).toBe(true);
    expect(result.checks.find((c) => c.questionId === "colour").ok).toBe(false);
  });

  it("only tests the TOP option (index 0) of each testable question, not every option", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    let calledWithValue = null;
    const fetchJson = async (url) => {
      calledWithValue = new URL(url).searchParams.get("attribute_value");
      return { item_count: 10 };
    };
    await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    expect(calledWithValue).toBe("500ml"); // options[0], not "750ml"
  });

  it("builds the attribute check URL against the real params-products endpoint with the expected param names", async () => {
    const entry = leafWithQuestions([capacityQuestion]);
    let capturedUrl = null;
    const fetchJson = async (url) => {
      capturedUrl = url;
      return { item_count: 10 };
    };
    await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    const url = new URL(capturedUrl);
    expect(url.pathname).toBe("/api/params-products");
    expect(url.searchParams.get("product_type_ids")).toBe("PA-01");
    expect(url.searchParams.get("attribute_name")).toBe("Capacity");
    expect(url.searchParams.get("attribute_value")).toBe("500ml");
  });

  it("builds the colour check URL using colors[] (matching ProductsContext.jsx's real request shape)", async () => {
    const entry = leafWithQuestions([colourQuestion]);
    let capturedUrl = null;
    const fetchJson = async (url) => {
      capturedUrl = url;
      return { item_count: 10 };
    };
    await verifyLeafMappings(entry, 100, { fetchJson, apiBase });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("colors[]")).toBe("Black");
  });
});
