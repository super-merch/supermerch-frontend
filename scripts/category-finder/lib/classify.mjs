// The generator's actual classification logic, extracted into a pure,
// dependency-injected module so it can be unit-tested against fixtures
// without needing a real snapshot file or network access.

import { isAttributeUsable, isColourUsable, hasNoProducts } from "./exclusionRules.mjs";
import { sharedQuantityQuestion, sharedBudgetQuestion, sharedColourQuestion } from "../families.js";

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

/**
 * Builds real, validated dropdown options from one attribute's per-value
 * stats. Each option's `value` is the exact raw string the backend's
 * attribute_value regex match expects -- never a cleaned-up label -- and
 * `label` is a light title-case cleanup for display only. Sorted by
 * per-value PRODUCT count (not raw value-occurrence count), and values that
 * look like internal/supplier fields are dropped defensively even though
 * the attribute-name allowlist should already prevent them from reaching
 * here.
 */
export function buildAttributeOptions(attributeStat) {
  return attributeStat.values
    .filter((v) => v.productCount > 0)
    .filter((v) => !BLOCKED_ATTRIBUTE_NAMES.has(v.value.trim().toLowerCase()))
    .sort((a, b) => b.productCount - a.productCount)
    .map((v) => ({ label: toTitleCase(v.value), value: v.value }));
}

/**
 * Builds real colour options from a leaf's colourValues stats, if colour
 * passes the population threshold.
 */
export function buildColourOptions(leaf) {
  if (!isColourUsable(leaf.colourPopulatedPct)) return null;
  const values = (leaf.colourValues || []).filter((v) => v.productCount > 0);
  if (values.length < 2) return null; // a single-colour "choice" isn't a real question
  return values
    .sort((a, b) => b.productCount - a.productCount)
    .map((v) => ({ label: toTitleCase(v.value), value: v.value }));
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
          if (chosenAttrs.length < 2 && isAttributeUsable(optionalStat)) {
            const optionalOptions = buildAttributeOptions(optionalStat);
            if (optionalOptions.length >= 2) {
              chosenAttrs.push({ name: family.optionalAttribute, options: optionalOptions });
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
  chosenAttrs.forEach(({ name, options }) => {
    questions.push({ id: questionIdFor(name), label: name, placeholder: "Any", type: "attribute", attributeName: name, options });
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
