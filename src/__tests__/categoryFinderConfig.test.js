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

// A separate, disjoint ID space from the leaf mock above -- "PGRP-01"/"PGRP-EXCLUDED"
// never appear as leaf IDs, mirroring how real parent/group codes ("PX") and
// leaf type codes ("PX-04") are drawn from disjoint spaces by construction.
vi.mock("../config/generated/parentGroupManifest", async () => {
  const { QUANTITY_OPTIONS } = await import("../config/quantityOptions");
  const baseQuestions = [{ id: "moq", type: "query", queryParam: "moq", options: QUANTITY_OPTIONS }];
  return {
    PARENT_GROUP_MANIFEST: {
      "PGRP-01": {
        categoryId: "PGRP-01",
        categoryName: "Test Group",
        finderEyebrow: "Find it faster",
        finderTitle: "Find the right test group in under 30 seconds",
        finderDescription: "Choose what matters most.",
        itemNamePlural: "test group",
        finderMode: "generic",
        filterMappingsValidated: true,
        runtimeEnabled: true,
        questions: baseQuestions,
      },
      "PGRP-EXCLUDED": {
        categoryId: "PGRP-EXCLUDED",
        categoryName: "Test Excluded Group",
        finderMode: "excluded",
        filterMappingsValidated: false,
        runtimeEnabled: false,
        exclusionReason: "No live audit data for this parent/group page yet.",
        questions: [],
      },
      "PGRP-UNVERIFIED": {
        categoryId: "PGRP-UNVERIFIED",
        categoryName: "Test Unverified Group",
        finderMode: "generic",
        filterMappingsValidated: false,
        runtimeEnabled: false,
        itemNamePlural: "test unverified group",
        questions: baseQuestions,
      },
    },
  };
});

const { CATEGORY_FINDER_CONFIG, getCategoryFinderConfig } = await import("../config/categoryFinderConfig");
const { PARENT_GROUP_MANIFEST } = await import("../config/generated/parentGroupManifest");

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

describe("categoryFinderConfig adapter: parent/group pages resolve through the SAME function", () => {
  it("resolves a runtime-ready parent/group ID to a usable config, the same shape a leaf produces", () => {
    const config = getCategoryFinderConfig("PGRP-01");
    const entry = PARENT_GROUP_MANIFEST["PGRP-01"];
    expect(config).toEqual({
      eyebrow: entry.finderEyebrow,
      title: entry.finderTitle,
      description: entry.finderDescription,
      submitLabel: "Show my matches",
      itemNamePlural: entry.itemNamePlural,
      questions: entry.questions,
    });
    expect(config.questions.length).toBeGreaterThan(0);
  });

  it("returns null for an excluded parent/group entry", () => {
    expect(getCategoryFinderConfig("PGRP-EXCLUDED")).toBeNull();
  });

  it("returns null for a parent/group entry that hasn't been live-verified yet, even with real questions", () => {
    expect(getCategoryFinderConfig("PGRP-UNVERIFIED")).toBeNull();
  });

  it("a leaf id is never satisfied by the parent manifest, and vice versa -- each id resolves through exactly one manifest", () => {
    // PE-02 exists only in the leaf mock, PGRP-01 only in the parent mock --
    // confirms the adapter doesn't accidentally cross-check both for every id
    // in a way that could let one manifest silently shadow the other.
    expect(getCategoryFinderConfig("PE-02")).not.toBeNull();
    expect(PARENT_GROUP_MANIFEST["PE-02"]).toBeUndefined();
    expect(getCategoryFinderConfig("PGRP-01")).not.toBeNull();
    expect(CATEGORY_FINDER_CONFIG["PGRP-01"]).toBeUndefined();
  });

  it("leaf behavior is completely unaffected by the parent manifest existing alongside it (PE-02 unchanged)", () => {
    // Re-assert the exact same PE-02 shape as the pre-parent-wiring test above --
    // adding parent resolution must not change a single thing about how a leaf,
    // and PE-02 specifically, resolves.
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

describe("categoryFinderConfig adapter: no competing configuration for the same ID (collision guard)", () => {
  it("throws at load time if a leaf ID and a parent/group ID were ever generated to collide", async () => {
    vi.resetModules();
    vi.doMock("../config/generated/categoryFinderManifest", () => ({
      CATEGORY_FINDER_MANIFEST: { "DUPLICATE-ID": { categoryId: "DUPLICATE-ID", finderMode: "generic", questions: [] } },
    }));
    vi.doMock("../config/generated/parentGroupManifest", () => ({
      PARENT_GROUP_MANIFEST: { "DUPLICATE-ID": { categoryId: "DUPLICATE-ID", finderMode: "generic", questions: [] } },
    }));
    await expect(import("../config/categoryFinderConfig")).rejects.toThrow(/DUPLICATE-ID/);
    vi.doUnmock("../config/generated/categoryFinderManifest");
    vi.doUnmock("../config/generated/parentGroupManifest");
    vi.resetModules();
  });
});

describe("categoryFinderConfig adapter: real generated data (integration)", () => {
  it("every runtime-ready parent/group entry in the REAL generated manifest resolves to a usable config with >=1 real question", async () => {
    vi.resetModules();
    const real = await vi.importActual("../config/generated/parentGroupManifest");
    const realAdapter = await vi.importActual("../config/categoryFinderConfig");
    const runtimeReadyParents = Object.values(real.PARENT_GROUP_MANIFEST).filter(
      (e) => e.filterMappingsValidated === true && e.runtimeEnabled === true
    );
    for (const entry of runtimeReadyParents) {
      const config = realAdapter.getCategoryFinderConfig(entry.categoryId);
      expect(config, `parent ${entry.categoryId} should resolve to a usable config`).not.toBeNull();
      expect(config.questions.length, `parent ${entry.categoryId} should have >=1 real question`).toBeGreaterThan(0);
    }
  });

  it("every excluded or not-yet-verified parent/group entry in the REAL generated manifest returns null", async () => {
    const real = await vi.importActual("../config/generated/parentGroupManifest");
    const realAdapter = await vi.importActual("../config/categoryFinderConfig");
    const notReady = Object.values(real.PARENT_GROUP_MANIFEST).filter(
      (e) => e.finderMode === "excluded" || e.filterMappingsValidated !== true || e.runtimeEnabled !== true
    );
    for (const entry of notReady) {
      expect(realAdapter.getCategoryFinderConfig(entry.categoryId), `parent ${entry.categoryId} should NOT resolve`).toBeNull();
    }
  });

  it("no real leaf ID and real parent/group ID collide", async () => {
    const realLeaf = await vi.importActual("../config/generated/categoryFinderManifest");
    const realParent = await vi.importActual("../config/generated/parentGroupManifest");
    const leafIds = new Set(Object.keys(realLeaf.CATEGORY_FINDER_MANIFEST));
    const collisions = Object.keys(realParent.PARENT_GROUP_MANIFEST).filter((id) => leafIds.has(id));
    expect(collisions).toEqual([]);
  });
});
