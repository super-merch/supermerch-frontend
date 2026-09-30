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

  // Regression: overview.min_qty is never populated by the live API (always
  // 0, confirmed across unrelated categories), so it must not be trusted as
  // the MOQ. The real MOQ/lead time live on the product's own price breaks.
  it("derives moq and lead_time from price breaks, ignoring the always-0 overview.min_qty", () => {
    const raw = {
      meta: { id: 5, discontinued: false },
      overview: { name: "Sweater Shape Candles", min_qty: 0 },
      product: {
        prices: {
          price_groups: [
            {
              base_price: {
                lead_time: "8 week",
                price_breaks: [
                  { qty: 250, price: 5.48 },
                  { qty: 500, price: 5.2 },
                  { qty: 1000, price: 4.92 },
                ],
              },
            },
          ],
        },
      },
    };
    const card = toCardShape(raw);
    expect(card.moq).toBe(250);
    expect(card.lead_time).toBe("8 week");
  });

  it("falls back to overview.min_qty then 0 when there are no price breaks", () => {
    const card = toCardShape({
      meta: { id: 6 },
      overview: { name: "Z" },
      product: {},
    });
    expect(card.moq).toBe(0);
    expect(card.lead_time).toBeUndefined();
  });
});
