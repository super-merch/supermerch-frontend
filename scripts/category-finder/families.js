// Hand-authored family templates + leaf assignment. Deliberately not inferred
// from navGroup/allowedTypeGroupIds -- exceptions like "PK Headwear looks
// clothing-like but Gender Fit is a near-single-value there" need to be a
// visible, reviewable line of code, not a heuristic that silently misfires.
//
// PR1 note: only the templates and the assignment map's *shape* are needed for
// this PR (the manifest still ships with just PE-02). The full leaf-by-leaf
// LEAF_FAMILY_MAP population (~280 entries) is PR2's job, validated per-leaf
// against real category data from the discovery audit, not assumed from group
// membership alone.

// Single source of truth: src/config/quantityOptions.js. That file is plain,
// dependency-free ESM (no JSX, no React import) specifically so it can be
// imported unmodified from both the browser bundle (CategoryFinder.jsx,
// MOQFilter.jsx) and these Node generator scripts -- duplicating the array
// here would let the Finder and sidebar wording silently drift apart.
import { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL } from "../../src/config/quantityOptions.js";
export { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL };

export const sharedQuantityQuestion = () => ({
  id: "moq",
  label: "Order quantity",
  placeholder: ANY_QUANTITY_LABEL,
  type: "query",
  queryParam: "moq",
  options: QUANTITY_OPTIONS,
});

export const sharedBudgetQuestion = (buckets) => ({
  id: "budget",
  label: "Unit budget (ex GST)",
  placeholder: "Any budget",
  type: "price",
  options:
    buckets || [
      { label: "Under $5", value: "0:5" },
      { label: "$5–$10", value: "5:10" },
      { label: "$10–$20", value: "10:20" },
      { label: "$20–$35", value: "20:35" },
      { label: "$35+", value: "35:" },
    ],
});

export const sharedColourQuestion = (options) => ({
  id: "colour",
  label: "Colour",
  placeholder: "Any colour",
  type: "query",
  queryParam: "colors",
  options,
});

// Family templates: { requiredAttribute, optionalAttribute }. A leaf only
// inherits a family if the required attribute independently passes
// isAttributeUsable() for THAT leaf's own real data -- family membership alone
// is never sufficient (see generate-manifest.mjs's classify()).
export const FAMILIES = {
  clothing_gender_fit: {
    requiredAttribute: "Gender Fit",
    optionalAttribute: "Sleeves",
    // Explicitly excluded groups: PK (Headwear -- Gender Fit is ~91% Unisex
    // there, near-zero discriminating power) and PJ (Golf -- not a clothing
    // group at all; included here only as a reminder this is an opt-in list,
    // not every group under a generic "clothing" umbrella).
    applicableGroups: ["PU", "PV", "PW", "PN", "PO", "PC", "PG", "PB", "PX"],
  },
  drinkware: {
    requiredAttribute: "Capacity",
    optionalAttribute: "Material",
    applicableGroups: ["PE"],
  },
  bags_eco: {
    requiredAttribute: "Eco Factors",
    optionalAttribute: "Material",
    applicableGroups: ["PA"],
  },
  writing_eco: {
    requiredAttribute: "Eco Factors",
    optionalAttribute: "Material",
    applicableGroups: ["PY"],
  },
};

// Populated leaf-by-leaf in PR2, validated per-leaf against the discovery audit.
export const LEAF_FAMILY_MAP = {};

// Per-leaf hand overrides that take priority over family/generic resolution
// (e.g. the existing PE-02 curated Bottle Finder). Populated in PR2 for any
// leaf whose generated question set needs a human-authored exception.
export const LEAF_OVERRIDES = {};
