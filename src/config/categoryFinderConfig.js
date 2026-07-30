import { CATEGORY_FINDER_MANIFEST } from "./generated/categoryFinderManifest";
import { PARENT_GROUP_MANIFEST } from "./generated/parentGroupManifest";
import { QUANTITY_OPTIONS } from "./quantityOptions";

// Both manifests are generated independently (leaves by generate-manifest.mjs
// + verify-filter-mappings.mjs, parents by generate-manifest.mjs +
// verify-parent-mappings.mjs) and are never supposed to share an ID -- a leaf
// type code (e.g. "PX-04") and a parent/group code (e.g. "PX") are drawn from
// disjoint ID spaces by construction (see authoritative-category-ids.json /
// reconcile.mjs's leaf-vs-parent collision check at generation time). This is
// a defensive, load-time assertion: if the two manifests were ever generated
// out of sync with each other and DID collide on an ID, silently preferring
// one manifest over the other would be exactly the "competing configuration
// for the same ID" bug this must never allow -- fail loudly instead.
const collidingIds = Object.keys(CATEGORY_FINDER_MANIFEST).filter((id) => Object.prototype.hasOwnProperty.call(PARENT_GROUP_MANIFEST, id));
if (collidingIds.length > 0) {
  throw new Error(
    `categoryFinderConfig: ${collidingIds.length} ID(s) exist in BOTH the leaf and parent manifests (${collidingIds.join(", ")}) -- these must be regenerated so leaf and parent/group IDs never collide.`
  );
}

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

function buildConfigFromEntry(entry) {
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
}

// Resolves a productTypeId against BOTH manifests -- a leaf category (e.g.
// "PX-04" Work Jackets) or a parent/group aggregate page (e.g. "PX"
// Workwear, covering every PX-* leaf at once; confirmed live that
// /api/params-products correctly aggregates when queried by the parent ID
// directly). The two manifests are disjoint by construction (asserted at
// load time above), so exactly one of them can ever have a matching entry
// for a given ID -- this never has to choose between two competing
// configurations, only between "leaf has it", "parent has it", or neither.
export const getCategoryFinderConfig = (productTypeId) => {
  const leafEntry = CATEGORY_FINDER_MANIFEST[productTypeId];
  if (leafEntry) return buildConfigFromEntry(leafEntry);
  const parentEntry = PARENT_GROUP_MANIFEST[productTypeId];
  if (parentEntry) return buildConfigFromEntry(parentEntry);
  return null;
};

// Kept for existing/adapter-level tests that want the raw manifest entries.
export const CATEGORY_FINDER_CONFIG = CATEGORY_FINDER_MANIFEST;
