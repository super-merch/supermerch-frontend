import { describe, expect, it } from "vitest";
import { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL } from "../config/quantityOptions";
import { QUANTITY_OPTIONS as GENERATOR_QUANTITY_OPTIONS, ANY_QUANTITY_LABEL as GENERATOR_ANY_QUANTITY_LABEL } from "../../scripts/category-finder/families.js";
import { getCategoryFinderConfig } from "../config/categoryFinderConfig";

// Regression guard: the Finder, the sidebar (MOQFilter.jsx), and the Node
// generator scripts must all resolve to the exact same QUANTITY_OPTIONS array
// -- not three independently-maintained copies that can drift. This test
// proves it by reference identity (ES modules are singleton-cached per
// process, so re-exporting instead of duplicating means these are literally
// the same array object), not just deep equality.
describe("quantity options: single source of truth", () => {
  it("the generator's re-export is the identical array object, not a copy", () => {
    expect(GENERATOR_QUANTITY_OPTIONS).toBe(QUANTITY_OPTIONS);
    expect(GENERATOR_ANY_QUANTITY_LABEL).toBe(ANY_QUANTITY_LABEL);
  });

  it("the exact required wording is present, in order", () => {
    expect(QUANTITY_OPTIONS.map((o) => o.label)).toEqual([
      "1–24",
      "25–49",
      "50–99",
      "100–249",
      "250–499",
      "500+",
    ]);
  });

  it("the Finder's resolved PE-02 config uses this exact same array for its moq question", () => {
    const config = getCategoryFinderConfig("PE-02");
    const moqQuestion = config.questions.find((q) => q.id === "moq");
    expect(moqQuestion.options).toBe(QUANTITY_OPTIONS);
  });
});
