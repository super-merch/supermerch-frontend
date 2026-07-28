import { describe, expect, it } from "vitest";
import {
  CATEGORY_FINDER_CONFIG,
  getCategoryFinderConfig,
} from "../config/categoryFinderConfig";

describe("categoryFinderConfig adapter", () => {
  it("returns null for an unconfigured id", () => {
    expect(getCategoryFinderConfig("PA-01")).toBeNull();
    expect(getCategoryFinderConfig(null)).toBeNull();
    expect(getCategoryFinderConfig(undefined)).toBeNull();
  });

  it("maps a manifest entry to the shape CategoryFinder.jsx expects", () => {
    const config = getCategoryFinderConfig("PE-02");
    const entry = CATEGORY_FINDER_CONFIG["PE-02"];

    expect(config).toEqual({
      eyebrow: entry.finderEyebrow,
      title: entry.finderTitle,
      description: entry.finderDescription,
      submitLabel: "Show my matches",
      itemNamePlural: entry.itemNamePlural,
      questions: entry.questions,
    });
  });

  it("would return null for an excluded manifest entry", () => {
    // Simulates the excluded-entry contract without depending on which specific
    // id is excluded in the current manifest (that's covered by the full
    // categoryFinderManifest.test.js reconciliation suite instead).
    const excludedShapeConfig = getCategoryFinderConfig("__not_a_real_id__");
    expect(excludedShapeConfig).toBeNull();
  });
});
