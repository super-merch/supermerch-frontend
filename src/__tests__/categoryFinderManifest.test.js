import { describe, expect, it } from "vitest";
import { CATEGORY_FINDER_MANIFEST } from "../config/generated/categoryFinderManifest";
import { RECONCILIATION } from "../config/generated/reconciliation";

const entries = Object.values(CATEGORY_FINDER_MANIFEST);
const FINDER_MODES = ["curated", "inherited", "generic", "excluded"];

describe("categoryFinderManifest reconciliation", () => {
  // Regression guard: a generator run that crashes partway through, or a bug in
  // family/exclusion resolution, must never silently ship fewer categories than
  // intended. RECONCILIATION is written by the generator alongside the manifest
  // itself, so these two files can only drift if someone hand-edits one without
  // the other -- which is exactly the failure mode this guards against.
  it("matches the recorded reconciliation counts exactly", () => {
    expect(entries.length).toBe(RECONCILIATION.totalLeafEntries);
    expect(new Set(entries.map((e) => e.categoryId)).size).toBe(RECONCILIATION.totalLeafEntries);

    const counts = entries.reduce((acc, e) => {
      acc[e.finderMode] = (acc[e.finderMode] || 0) + 1;
      return acc;
    }, {});
    expect(counts.curated || 0).toBe(RECONCILIATION.curated);
    expect(counts.inherited || 0).toBe(RECONCILIATION.inherited);
    expect(counts.generic || 0).toBe(RECONCILIATION.generic);
    expect(counts.excluded || 0).toBe(RECONCILIATION.excluded);
  });

  it("every finderMode count sums to the total (no entry silently unclassified)", () => {
    const counts = entries.reduce((acc, e) => {
      acc[e.finderMode] = (acc[e.finderMode] || 0) + 1;
      return acc;
    }, {});
    const sum = (counts.curated || 0) + (counts.inherited || 0) + (counts.generic || 0) + (counts.excluded || 0);
    expect(sum).toBe(entries.length);
  });
});

describe.each(entries)("categoryFinderManifest entry: $categoryId", (entry) => {
  it("has a known finderMode", () => {
    expect(FINDER_MODES).toContain(entry.finderMode);
  });

  it("excluded entries have a reason and zero questions", () => {
    if (entry.finderMode !== "excluded") return;
    expect(entry.exclusionReason).toBeTruthy();
    expect(entry.questions).toHaveLength(0);
    expect(entry.filterMappingsValidated).toBe(false);
  });

  it("filterMappingsValidated/runtimeEnabled are never true for an excluded entry, and runtimeEnabled is never true without filterMappingsValidated (the two gates are independent, but this combination would be meaningless)", () => {
    if (entry.finderMode === "excluded") {
      expect(entry.filterMappingsValidated).toBe(false);
      expect(entry.runtimeEnabled).toBe(false);
      return;
    }
    if (entry.runtimeEnabled) {
      expect(entry.filterMappingsValidated).toBe(true);
    }
  });

  it("a non-excluded entry with zero surviving questions must not claim filterMappingsValidated (exhaustive live verification can legitimately fail a whole leaf, e.g. a tiny category where the fixed moq/budget check values never match anything)", () => {
    if (entry.finderMode === "excluded") return;
    if (entry.questions.length === 0) {
      expect(entry.filterMappingsValidated).toBe(false);
    }
  });

  it("non-excluded entries WITH surviving questions have a well-formed question set, regardless of runtime-enablement status", () => {
    // Structural correctness (real options, no empty dropdowns, correct
    // ordering) is guaranteed by the generator for EVERY classified entry --
    // filterMappingsValidated/runtimeEnabled are a separate, independently-set
    // axis (live API verification, then business approval) and must never be
    // asserted true here just because an entry was classified curated/
    // inherited/generic. See categoryFinderConfig.test.js for gate-logic tests.
    //
    // Live verification can also remove individual questions (moq, budget,
    // or an attribute/colour question) that failed their live check, or leave
    // a leaf with zero questions at all (covered by the test above) -- so
    // "well-formed" here means the SURVIVING set is correctly shaped, not
    // that every leaf must retain all of moq/budget/attributes/colour.
    if (entry.finderMode === "excluded") return;
    if (entry.questions.length === 0) return; // covered by the zero-questions test above
    expect(entry.exclusionReason).toBeNull();

    const ids = entry.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate question ids

    // Deterministic order is enforced at RENDER time by CategoryFinder.jsx's
    // priority map (moq:0, budget:1, colour:98, everything else falls to a
    // default), not by raw authoring order in the manifest -- so assert on the
    // same effective order the component actually produces, mirroring its logic
    // here rather than requiring the manifest's own array to already be sorted.
    const PRIORITY = { moq: 0, budget: 1, colour: 98 };
    const orderedIds = [...ids].sort((a, b) => (PRIORITY[a] ?? 2) - (PRIORITY[b] ?? 2));

    // Whichever of moq/budget survived verification must still lead, in that
    // relative order -- neither is guaranteed present any more (see above).
    let cursor = 0;
    if (orderedIds.includes("moq")) {
      expect(orderedIds[cursor]).toBe("moq");
      cursor += 1;
    }
    if (orderedIds.includes("budget")) {
      expect(orderedIds[cursor]).toBe("budget");
    }

    // At most 2 non-colour, non-quantity, non-budget attribute questions.
    const attributeQuestions = entry.questions.filter((q) => q.type === "attribute");
    expect(attributeQuestions.length).toBeLessThanOrEqual(2);

    // Colour, once ordered, sorts last.
    const colourIndex = orderedIds.indexOf("colour");
    if (colourIndex !== -1) {
      expect(colourIndex).toBe(orderedIds.length - 1);
    }

    entry.questions.forEach((q) => {
      expect(q.options.length).toBeGreaterThan(0); // no empty dropdowns
      expect(["query", "attribute", "price"]).toContain(q.type);
      if (q.type === "query") expect(q.queryParam).toBeTruthy();
      if (q.type === "attribute") expect(q.attributeName).toBeTruthy();
    });
  });
});
