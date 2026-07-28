import { CATEGORY_FINDER_MANIFEST } from "./generated/categoryFinderManifest";

// Thin adapter over the generated manifest -- CategoryFinder.jsx doesn't know the
// manifest exists, it just calls getCategoryFinderConfig(productTypeId) and gets
// back the {eyebrow, title, description, submitLabel, itemNamePlural, questions}
// shape it's always consumed. Excluded/missing entries return null, same as before.
export const getCategoryFinderConfig = (productTypeId) => {
  const entry = CATEGORY_FINDER_MANIFEST[productTypeId];
  if (!entry || entry.finderMode === "excluded" || entry.questions.length === 0) {
    return null;
  }
  return {
    eyebrow: entry.finderEyebrow,
    title: entry.finderTitle,
    description: entry.finderDescription,
    submitLabel: "Show my matches",
    itemNamePlural: entry.itemNamePlural,
    questions: entry.questions,
  };
};

// Kept for existing/adapter-level tests that want the raw manifest entries.
export const CATEGORY_FINDER_CONFIG = CATEGORY_FINDER_MANIFEST;
