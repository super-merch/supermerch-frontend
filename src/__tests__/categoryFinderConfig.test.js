import { describe, expect, it } from "vitest";
import {
  CATEGORY_FINDER_CONFIG,
  getCategoryFinderConfig,
} from "../config/categoryFinderConfig";

describe("categoryFinderConfig", () => {
  it("enables the pilot only for drink bottles", () => {
    expect(getCategoryFinderConfig("PE-02")).toBe(
      CATEGORY_FINDER_CONFIG["PE-02"]
    );
    expect(getCategoryFinderConfig("PA-01")).toBeNull();
    expect(getCategoryFinderConfig(null)).toBeNull();
  });

  it("uses unique question identifiers and supported mappings", () => {
    const config = getCategoryFinderConfig("PE-02");
    const ids = config.questions.map((question) => question.id);

    expect(new Set(ids).size).toBe(ids.length);
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
