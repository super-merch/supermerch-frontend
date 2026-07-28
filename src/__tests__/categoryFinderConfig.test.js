import { describe, expect, it, vi } from "vitest";

// This mock stands in for the generated manifest so the adapter's "unknown
// id" and "known but excluded id" behaviors can be tested as two genuinely
// distinct cases -- an unknown id was previously used as a stand-in for
// "excluded" here, which doesn't actually exercise the exclusion branch
// (`entry.finderMode === "excluded"`) at all, just the "entry doesn't
// exist" branch. A real excluded fixture is needed to test exclusion.
vi.mock("../config/generated/categoryFinderManifest", async () => {
  const { QUANTITY_OPTIONS } = await import("../config/quantityOptions");
  return {
    CATEGORY_FINDER_MANIFEST: {
      "PE-02": {
        categoryId: "PE-02",
        finderEyebrow: "Bottle Finder",
        finderTitle: "Find the right bottle in under 30 seconds",
        finderDescription: "Choose what matters most.",
        itemNamePlural: "bottles",
        finderMode: "curated",
        // The moq question's options here are deliberately the exact canonical
        // array -- the adapter always substitutes QUANTITY_OPTIONS for any
        // "moq" question regardless of what a manifest entry embeds (see
        // categoryFinderConfig.js), so a differing fixture here would fail
        // this test for an unrelated reason.
        questions: [{ id: "moq", type: "query", queryParam: "moq", options: QUANTITY_OPTIONS }],
      },
      "MISC-01": {
        categoryId: "MISC-01",
        finderMode: "excluded",
        exclusionReason: "productMatchRules empty -- matches zero products.",
        questions: [],
      },
    },
  };
});

const { CATEGORY_FINDER_CONFIG, getCategoryFinderConfig } = await import("../config/categoryFinderConfig");

describe("categoryFinderConfig adapter", () => {
  it("returns null for an id with no manifest entry at all", () => {
    expect(getCategoryFinderConfig("__not_a_real_id__")).toBeNull();
    expect(getCategoryFinderConfig(null)).toBeNull();
    expect(getCategoryFinderConfig(undefined)).toBeNull();
  });

  it("returns null for a REAL excluded manifest entry (not a missing-id stand-in)", () => {
    // MISC-01 genuinely exists in the manifest with finderMode: "excluded" --
    // this exercises the actual exclusion branch, not just "not found".
    expect(CATEGORY_FINDER_CONFIG["MISC-01"].finderMode).toBe("excluded");
    expect(getCategoryFinderConfig("MISC-01")).toBeNull();
  });

  it("maps a curated manifest entry to the shape CategoryFinder.jsx expects", () => {
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
});
