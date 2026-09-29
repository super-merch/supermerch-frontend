import { describe, expect, it } from "vitest";
import { toCardShape } from "../catalogApi.js";

// Regression coverage for surfacing description + tags to Merch Mate so it
// can judge relevance and answer follow-up questions ("is this eco-friendly?")
// without another tool call — see api/lib/catalogApi.js and agent.js's system
// prompt point 4c.
describe("toCardShape", () => {
  it("includes a plain-text, length-capped description excerpt", () => {
    const raw = {
      meta: { id: 1, discontinued: false },
      overview: { name: "Bamboo Cup" },
      product: {
        description: `<p>A ${"very ".repeat(60)}long <b>description</b>.</p>`,
      },
    };
    const card = toCardShape(raw);
    expect(card.description).not.toMatch(/[<>]/);
    expect(card.description.length).toBeLessThanOrEqual(221); // 220 chars + ellipsis
    expect(card.description.endsWith("…")).toBe(true);
  });

  it("omits description when the product has none", () => {
    const card = toCardShape({ meta: { id: 2 }, overview: { name: "X" }, product: {} });
    expect(card.description).toBeNull();
  });

  it("merges curated productTags and auto specialTags, deduplicated", () => {
    const raw = {
      meta: { id: 3, discontinued: false },
      overview: { name: "Notebook" },
      product: {},
      productTags: [{ name: "Eco-Friendly" }, { name: "Best Seller" }],
      specialTags: ["Best Seller", "Australia Made"],
    };
    const card = toCardShape(raw);
    expect(card.tags).toEqual(["Eco-Friendly", "Best Seller", "Australia Made"]);
  });

  it("leaves tags undefined when the product has none", () => {
    const card = toCardShape({ meta: { id: 4 }, overview: { name: "Y" }, product: {} });
    expect(card.tags).toBeUndefined();
  });
});
