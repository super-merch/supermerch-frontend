// The generator's actual classification logic, extracted into a pure,
// dependency-injected module so it can be unit-tested against fixtures
// without needing a real snapshot file or network access.

import { isAttributeUsable, isPresenceAttributeUsable, isColourUsable, hasNoProducts } from "./exclusionRules.mjs";
import { sharedQuantityQuestion, sharedBudgetQuestion, sharedColourQuestion } from "../families.js";
import { dedupeValueStats } from "./valueDedup.mjs";
import { buildColourFamilyOptions } from "./colourNormalization.mjs";

const BLOCKED_ATTRIBUTE_NAMES = new Set([
  "supplier",
  "supplier name",
  "supplier code",
  "supplier id",
  "internal code",
  "product code",
  "sku",
]);

function toTitleCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function questionIdFor(attributeName) {
  return attributeName.toLowerCase().replace(/\s+/g, "_");
}

// Some derived attribute stat names exist ONLY for cleaner
// classification/display -- see customAttributeDerivation.mjs's
// splitWorkwearCompliance, which aggregates the real "Compliance" values
// under a separate "Visibility" stat key so a Hi-Vis question isn't
// polluted by unrelated certifications. But "Visibility" is not a real
// backend field: product.categorisation.promodata_attributes only ever
// stores "Compliance: Hi-Vis". Confirmed live -- attribute_name=Visibility
// returns item_count 0 against production for every PX-* leaf and the PX
// parent (caught by live verification silently stripping the question
// site-wide). The API filter must target the REAL backend attribute name;
// only the customer-facing label may use the clean derived name.
const DERIVED_ATTRIBUTE_BACKEND_NAME = { Visibility: "Compliance" };

/**
 * Builds real, validated dropdown options from one attribute's per-value
 * stats. Values are first deduped case/whitespace-insensitively (raw
 * supplier data has casing variants of the same value -- e.g. "Steel" vs
 * "steel " -- that would otherwise title-case down to identical duplicate
 * VISIBLE labels; see valueDedup.mjs) before each surviving value's `value`
 * is passed through verbatim as the exact raw string the backend's
 * attribute_value regex match expects -- never a cleaned-up label -- and
 * `label` is a light title-case cleanup for display only. Sorted by
 * per-value PRODUCT count (not raw value-occurrence count), and values that
 * look like internal/supplier fields are dropped defensively even though
 * the attribute-name allowlist should already prevent them from reaching
 * here.
 */
export function buildAttributeOptions(attributeStat) {
  const deduped = dedupeValueStats(attributeStat.values.filter((v) => v.productCount > 0));
  return deduped
    .filter((v) => !BLOCKED_ATTRIBUTE_NAMES.has(v.value.trim().toLowerCase()))
    .map((v) => ({ label: toTitleCase(v.value), value: v.value }));
}

/**
 * Builds colour options from a leaf's colourValues stats, if colour passes
 * the population threshold. Raw supplier colour vocabulary can run to
 * hundreds of distinct shade names per leaf (case duplicates included) --
 * buildColourFamilyOptions (see colourNormalization.mjs) both dedupes
 * case/whitespace variants and groups the survivors into a short, controlled
 * family list (Black, White, Blue, ...), so what ships is never the raw
 * per-shade list. A family option's `value` is a comma-joined list of the
 * leaf's own raw values in that family -- CategoryFinder.jsx puts it
 * straight into one URL param, and Cards.jsx already splits any `colors`
 * param on "," before building the colors[] array sent to the backend, so
 * no component or backend change is needed to support this.
 */
export function buildColourOptions(leaf) {
  if (!isColourUsable(leaf.colourPopulatedPct)) return null;
  const familyOptions = buildColourFamilyOptions(leaf.colourValues || []);
  if (familyOptions.length < 2) return null; // a single-family "choice" isn't a real question
  return familyOptions.map((f) => ({ label: f.label, value: f.value }));
}

function findAttr(attributes, name) {
  return (attributes || []).find((a) => a.name === name);
}

/**
 * @param {object} leaf - a validated snapshot leaf record
 * @param {object} deps
 * @param {object} deps.families - FAMILIES map
 * @param {Record<string,string>} deps.leafFamilyMap - leafId -> family key
 * @param {Record<string,object>} deps.leafOverrides - leafId -> {questions, filterMappingsValidated, runtimeEnabled}
 * @returns {{finderMode, proposedFamily, questions, filterMappingsValidated, runtimeEnabled, notes}}
 */
export function classifyLeaf(leaf, { families, leafFamilyMap, leafOverrides }) {
  if (leafOverrides[leaf.leafId]) {
    const override = leafOverrides[leaf.leafId];
    return {
      finderMode: "curated",
      proposedFamily: null,
      questions: override.questions,
      // Only a hand-authored, hand-verified override may claim true -- the
      // generator itself never performs the live checks (URL params produce
      // the intended request, the request succeeds, results are relevant)
      // that would justify it, so both gates must default to false for
      // anything the generator derives on its own. `runtimeEnabled` is a
      // SEPARATE business decision from "is this technically correct" --
      // an override can be fully validated yet still held back from
      // customers, so it must be declared explicitly too, not inferred from
      // filterMappingsValidated.
      filterMappingsValidated: override.filterMappingsValidated === true,
      runtimeEnabled: override.runtimeEnabled === true,
      notes: ["Hand-authored override."],
      // Optional copy overrides -- a fully hand-curated leaf (e.g. PE-02)
      // needs its exact eyebrow/title/description/itemNamePlural preserved
      // too, not just its questions. undefined here means buildManifestEntry
      // falls back to the generic leafName-derived copy, so existing
      // overrides that only set questions/gates are unaffected.
      itemNamePlural: override.itemNamePlural,
      finderEyebrow: override.finderEyebrow,
      finderTitle: override.finderTitle,
      finderDescription: override.finderDescription,
    };
  }

  if (hasNoProducts(leaf.productCount)) {
    return {
      finderMode: "excluded",
      proposedFamily: null,
      questions: [],
      filterMappingsValidated: false,
      runtimeEnabled: false,
      notes: [leaf.exclusionReason || "Zero products match this category's filter rules."],
    };
  }

  if (leaf.fetchFailed === true) {
    // A live-audit failure, not zero/unusable data -- excluded with a
    // distinct reason so it reads as "needs re-audit" rather than "no
    // products here" (see fetch-catalogue-snapshot.mjs).
    return {
      finderMode: "excluded",
      proposedFamily: null,
      questions: [],
      filterMappingsValidated: false,
      runtimeEnabled: false,
      notes: [leaf.fetchFailureReason || "Live catalogue audit failed for this category -- needs re-audit."],
    };
  }

  const notes = [];
  const chosenAttrs = []; // [{name, options}]
  let proposedFamily = null;
  let finderMode = "generic";

  const familyKey = leafFamilyMap[leaf.leafId];
  if (familyKey && families[familyKey]) {
    const family = families[familyKey];
    const groupIsApplicable = family.applicableGroups.includes(leaf.parentId) || family.applicableGroups.includes(leaf.leafId);
    if (!groupIsApplicable) {
      notes.push(`${familyKey} family has a mapping for this leaf but its group (${leaf.parentId}) is not in applicableGroups -- treating as unmapped.`);
    } else {
      const requiredStat = findAttr(leaf.attributes, family.requiredAttribute);
      if (isAttributeUsable(requiredStat)) {
        const options = buildAttributeOptions(requiredStat);
        if (options.length >= 2) {
          proposedFamily = familyKey;
          finderMode = "inherited";
          chosenAttrs.push({ name: family.requiredAttribute, options });
          notes.push(`Inherited ${familyKey}: ${family.requiredAttribute} passed usability check (${requiredStat.taggedProductCount}/${requiredStat.sampleSize} sampled products tagged) and produced ${options.length} real options.`);

          const optionalStat = findAttr(leaf.attributes, family.optionalAttribute);
          const isPresenceMode = family.optionalAttributeMode === "presence";
          const optionalUsable = isPresenceMode ? isPresenceAttributeUsable(optionalStat) : isAttributeUsable(optionalStat);
          if (chosenAttrs.length < 2 && optionalUsable) {
            const optionalOptions = buildAttributeOptions(optionalStat);
            // A presence attribute (e.g. "Hi-Vis") is meaningful with just 1
            // real option -- selecting it narrows from the whole category
            // down to the tagged subset; the unselected "Any" default
            // already covers "don't care", so no paired negative value is
            // needed the way a categorical attribute would need >=2 choices
            // to be a real question.
            const minOptions = isPresenceMode ? 1 : 2;
            if (optionalOptions.length >= minOptions) {
              chosenAttrs.push({ name: family.optionalAttribute, options: optionalOptions, singleValueAllowed: isPresenceMode && optionalOptions.length === 1 });
            }
          }
        } else {
          notes.push(`${familyKey} family's ${family.requiredAttribute} passed the stat-level usability check but produced fewer than 2 real options after filtering -- fell back to generic.`);
        }
      } else {
        notes.push(`${familyKey} family considered but ${family.requiredAttribute} failed usability for this leaf -- fell back to generic.`);
      }
    }
  }

  if (chosenAttrs.length < 2) {
    const candidates = (leaf.attributes || [])
      .filter((a) => isAttributeUsable(a) && !chosenAttrs.some((c) => c.name === a.name))
      .sort((a, b) => b.taggedProductCount - a.taggedProductCount);
    for (const candidate of candidates) {
      if (chosenAttrs.length >= 2) break;
      const options = buildAttributeOptions(candidate);
      if (options.length >= 2) {
        chosenAttrs.push({ name: candidate.name, options });
        if (finderMode === "generic") notes.push(`Generic fallback: selected "${candidate.name}" (${options.length} real options, ${candidate.taggedProductCount}/${candidate.sampleSize} sampled products tagged).`);
      }
    }
  }

  const colourOptions = buildColourOptions(leaf);

  const questions = [sharedQuantityQuestion(), sharedBudgetQuestion()];
  chosenAttrs.forEach(({ name, options, singleValueAllowed }) => {
    questions.push({
      id: questionIdFor(name),
      label: name,
      placeholder: "Any",
      type: "attribute",
      attributeName: DERIVED_ATTRIBUTE_BACKEND_NAME[name] || name,
      options,
      // Only ever true for a deliberately presence-mode family attribute
      // (see FAMILIES' optionalAttributeMode) with exactly 1 real option --
      // tells the live verifier (MIN_SURVIVING_OPTIONS normally requires >=2
      // options to keep a question) that this ONE option is still a
      // meaningful filter on its own, since the unselected "Any" state
      // already covers the complement.
      ...(singleValueAllowed ? { singleValueAllowed: true } : {}),
    });
  });
  if (colourOptions) {
    questions.push(sharedColourQuestion(colourOptions));
  } else if (leaf.colourPopulatedPct != null) {
    notes.push(`Colour excluded: ${leaf.colourPopulatedPct}% populated or fewer than 2 real colour values.`);
  }

  if (leaf.auditMode && leaf.auditMode !== "exact") {
    notes.push(`Audit mode is "${leaf.auditMode}" (not an exact/complete count) -- filterMappingsValidated and runtimeEnabled cannot be set true by the generator regardless of how the stats look; live verification is required first.`);
  }

  return {
    finderMode,
    proposedFamily,
    questions,
    // The generator has not performed live verification (no network calls in
    // generate-manifest.mjs) -- it can only ever propose a configuration, so
    // both gates are always false for generated (non-override) entries. A
    // separate, explicit live-verification pass is required before
    // filterMappingsValidated can be true, and a separate, explicit business
    // decision is required before runtimeEnabled can be true -- neither is
    // implemented by this script.
    filterMappingsValidated: false,
    runtimeEnabled: false,
    notes,
  };
}
