import { describe, expect, it } from "vitest";
import { extractPreviouslyShownIds } from "../chat.js";

// Regression coverage for "show me more options" returning the same
// products again — see tools.js's withoutPreviouslyShown for the other half.
describe("extractPreviouslyShownIds", () => {
  it("collects ids from assistant turns' items, deduplicated", () => {
    const history = [
      { role: "user", text: "eco-friendly tote bags" },
      { role: "assistant", text: "Here are a few options...", items: [{ id: 1 }, { id: 2 }] },
      { role: "user", text: "show me more" },
      { role: "assistant", text: "Also check out...", items: [{ id: 2 }, { id: 3 }] },
    ];
    expect(extractPreviouslyShownIds(history)).toEqual([1, 2, 3]);
  });

  it("ignores user turns and assistant turns with no items", () => {
    const history = [
      { role: "user", text: "hello", items: [{ id: 99 }] }, // user items (if ever present) don't count
      { role: "assistant", text: "Hi! What can I help with?" }, // no items field at all
    ];
    expect(extractPreviouslyShownIds(history)).toEqual([]);
  });

  it("returns an empty array for non-array input", () => {
    expect(extractPreviouslyShownIds(undefined)).toEqual([]);
    expect(extractPreviouslyShownIds(null)).toEqual([]);
  });

  it("filters out items with a null/undefined id", () => {
    const history = [
      { role: "assistant", text: "...", items: [{ id: 1 }, { id: null }, {}] },
    ];
    expect(extractPreviouslyShownIds(history)).toEqual([1]);
  });
});
