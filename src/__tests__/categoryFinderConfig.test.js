import { describe, expect, it, vi } from "vitest";

// This mock stands in for the generated manifest so the adapter's "unknown
// id" and "known but excluded id" behaviors can be tested as two genuinely
// distinct cases -- an unknown id was previously used as a stand-in for
// "excluded" here, which doesn't actually exercise the exclusion branch
// (`entry.finderMode === "excluded"`) at all, just the "entry doesn't
// exist" branch. A real excluded fixture is needed to test exclusion.
vi.mock("../config/generated/categoryFinderManifest", async () => {
  const { QUANTITY_OPTIONS } = await import("../config/quantityOptions");
  const baseQuestions = [{ id: "moq", type: "query", queryParam: "moq", options: QUANTITY_OPTIONS }];
  return {
    CATEGORY_FINDER_MANIFEST: {
      "PE-02": {
        categoryId: "PE-02",
        finderEyebrow: "Bottle Finder",
        finderTitle: "Find the right bottle in under 30 seconds",
        finderDescription: "Choose what matters most.",
        itemNamePlural: "bottles",
        finderMode: "curated",
        filterMappingsValidated: true,
        runtimeEnabled: true,
        // The moq question's options here are deliberately the exact canonical
        // array -- the adapter always substitutes QUANTITY_OPTIONS for any
        // "moq" question regardless of what a manifest entry embeds (see
        // categoryFinderConfig.js), so a differing fixture here would fail
        // this test for an unrelated reason.
        questions: baseQuestions,
      },
      "MISC-01": {
        categoryId: "MISC-01",
        finderMode: "excluded",
        filterMappingsValidated: false,
        runtimeEnabled: false,
        exclusionReason: "productMatchRules empty -- matches zero products.",
        questions: [],
      },
      // A generated (non-override) entry: technically classified, but never
      // live-verified, so it must stay gated off regardless of how good its
      // questions look.
      "PX-01": {
        categoryId: "PX-01",
        finderMode: "generic",
        filterMappingsValidated: false,
        runtimeEnabled: false,
        itemNamePlural: "widgets",
        questions: baseQuestions,
      },
      // Hand-verified (filterMappingsValidated: true) but deliberately held
      // back from customers by a separate business decision -- must not
      // render even though the technical gate passed.
      "PX-02": {
        categoryId: "PX-02",
        finderMode: "curated",
        filterMappingsValidated: true,
        runtimeEnabled: false,
        itemNamePlural: "gadgets",
        questions: baseQuestions,
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

  describe("two-gate runtime enablement (filterMappingsValidated AND runtimeEnabled)", () => {
    it("renders when both gates are true (PE-02)", () => {
      expect(getCategoryFinderConfig("PE-02")).not.toBeNull();
    });

    it("returns null when filterMappingsValidated is false, even with real questions and finderMode !== excluded (PX-01)", () => {
      expect(CATEGORY_FINDER_CONFIG["PX-01"].finderMode).not.toBe("excluded");
      expect(CATEGORY_FINDER_CONFIG["PX-01"].questions.length).toBeGreaterThan(0);
      expect(getCategoryFinderConfig("PX-01")).toBeNull();
    });

    it("returns null when filterMappingsValidated is true but runtimeEnabled is false (PX-02) -- a validated category can still be held back by a separate business decision", () => {
      expect(CATEGORY_FINDER_CONFIG["PX-02"].filterMappingsValidated).toBe(true);
      expect(getCategoryFinderConfig("PX-02")).toBeNull();
    });

    it("returns null for an excluded entry regardless of gate values (MISC-01)", () => {
      expect(getCategoryFinderConfig("MISC-01")).toBeNull();
    });

    it("returns null for an unknown id, independent of gating", () => {
      expect(getCategoryFinderConfig("__still_not_real__")).toBeNull();
    });
  });
});
