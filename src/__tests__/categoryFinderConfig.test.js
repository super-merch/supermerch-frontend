import { describe, expect, it } from "vitest";
import {
  CATEGORY_FINDER_CONFIG,
  getCategoryFinderConfig,
} from "../config/categoryFinderConfig";

describe("categoryFinderConfig", () => {
  it("keeps the curated drink-bottle configuration", () => {
    expect(getCategoryFinderConfig("PE-02")).toBe(
      CATEGORY_FINDER_CONFIG["PE-02"]
    );
    expect(getCategoryFinderConfig(null)).toBeNull();
  });

  it("builds category-specific questions from reliable API attributes", () => {
    const config = getCategoryFinderConfig("PM-04", {
      categoryLabel: "Candles",
      attributes: [
        { name: "Eco Factors", values: ["Natural Material", "Recycled"] },
        { name: "Material", values: ["Glass", "Ceramic"] },
      ],
    });

    expect(config.title).toContain("candles");
    expect(config.questions.map((question) => question.attributeName)).toEqual(
      expect.arrayContaining(["Material", "Eco Factors"])
    );
  });

  it("does not display a generic Finder without structured attributes", () => {
    expect(
      getCategoryFinderConfig("PM-04", {
        categoryLabel: "Candles",
        attributes: [],
      })
    ).toBeNull();
  });

  it("uses unique question identifiers and supported mappings", () => {
    const config = getCategoryFinderConfig("PE-02");
    const ids = config.questions.map((question) => question.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.slice(0, 2)).toEqual(["moq", "budget"]);
    config.questions.forEach((question) => {
      expect(question.options.length).toBeGreaterThan(0);
      expect(["query", "attribute", "price"]).toContain(question.type);
      if (question.type === "query") {
        expect(question.queryParam).toBeTruthy();
      }
      if (question.type === "attribute") {
        expect(question.attributeName).toBeTruthy();
      }
    });
  });
});
