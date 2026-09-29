import { describe, expect, it } from "vitest";
import { toCardShape } from "../catalogApi.js";

// Regression coverage for surfacing real colour variants to Merch Mate so it
// can answer "is this available in red?" directly instead of guessing — see
// api/lib/catalogApi.js and agent.js's system prompt point 4c.
describe("toCardShape colours", () => {
  it("extracts a deduplicated list of colour names from product.colours.list", () => {
    const raw = {
      meta: { id: 1, discontinued: false },
      overview: { name: "Napier Pen" },
      product: {
        colours: {
          list: [
            { name: "Red", swatch: ["#C72C41"] },
            { name: "Black", swatch: ["#000000"] },
            { name: "Red", swatch: ["#C72C41"] },
          ],
        },
      },
    };
    const card = toCardShape(raw);
    expect(card.colours).toEqual(["Red", "Black"]);
  });

  it("omits colours when the product has none", () => {
    const card = toCardShape({ meta: { id: 2 }, overview: { name: "X" }, product: {} });
    expect(card.colours).toBeUndefined();
  });

  it("omits colours when the colour entries have no name", () => {
    const raw = {
      meta: { id: 3 },
      overview: { name: "Y" },
      product: { colours: { list: [{ swatch: ["#000"] }] } },
    };
    const card = toCardShape(raw);
    expect(card.colours).toBeUndefined();
  });
});
