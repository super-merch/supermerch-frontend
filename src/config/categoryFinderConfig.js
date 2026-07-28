import { CATEGORY_FINDER_MANIFEST } from "./generated/categoryFinderManifest";
import { QUANTITY_OPTIONS } from "./quantityOptions";

// Thin adapter over the generated manifest -- CategoryFinder.jsx doesn't know the
// manifest exists, it just calls getCategoryFinderConfig(productTypeId) and gets
// back the {eyebrow, title, description, submitLabel, itemNamePlural, questions}
// shape it's always consumed. Excluded/missing entries return null, same as before.
//
// The moq question's `options` are swapped for the canonical QUANTITY_OPTIONS
// array here, at the point of use, rather than trusting the generated
// manifest's embedded copy to stay in sync -- a JSON-serialized manifest file
// can't "import" a shared reference, so this is the actual single-source-of-
// truth enforcement point (see quantityOptionsSharedSource.test.js).
const withCanonicalQuantityOptions = (questions) =>
  questions.map((question) =>
    question.id === "moq" ? { ...question, options: QUANTITY_OPTIONS } : question
  );

// Two-gate runtime enablement, both required:
//   - filterMappingsValidated: the category's API parameters/options have
//     actually been verified (URL params produce the intended request, the
//     request succeeds, results are relevant) -- the generator can never set
//     this true on its own (see classify.mjs), only a hand-verified override.
//   - runtimeEnabled: a separate, explicit business decision that this
//     category is approved for customers to see, independent of whether it's
//     technically correct. A category can be fully validated and still held
//     back deliberately; this flag is never inferred from the other one.
// A generated (non-override) entry defaults both to false, so PR2 adding 296
// more classified-but-unverified categories can never make any of them
// render in production until each is explicitly promoted on both axes.
const isRuntimeReady = (entry) => entry.filterMappingsValidated === true && entry.runtimeEnabled === true;

export const getCategoryFinderConfig = (productTypeId) => {
  const entry = CATEGORY_FINDER_MANIFEST[productTypeId];
  if (!entry || entry.finderMode === "excluded" || entry.questions.length === 0 || !isRuntimeReady(entry)) {
    return null;
  }
  return {
    eyebrow: entry.finderEyebrow,
    title: entry.finderTitle,
    description: entry.finderDescription,
    submitLabel: "Show my matches",
    itemNamePlural: entry.itemNamePlural,
    questions: withCanonicalQuantityOptions(entry.questions),
  };
};

// Kept for existing/adapter-level tests that want the raw manifest entries.
export const CATEGORY_FINDER_CONFIG = CATEGORY_FINDER_MANIFEST;
