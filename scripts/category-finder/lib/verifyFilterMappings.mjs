// Live verification core for one manifest leaf entry -- the missing piece
// that lets filterMappingsValidated ever legitimately become true for a
// generator-classified (non-override) entry. classify.mjs deliberately never
// sets this itself; this module is the SEPARATE, explicit check that does,
// by replaying the leaf's generated question options as real requests
// against the customer-facing product API and confirming they actually work.
//
// Only attribute and colour questions are verified here -- they are the only
// ones whose options are derived from this specific leaf's real sampled
// data, so they're the only ones that can be individually wrong per leaf.
// moq (order quantity) and budget (price range) are generic, sitewide filter
// mechanisms already proven correct independent of any category (see
// MOQFilter.jsx / quantityOptions.js) -- there is nothing category-specific
// about them to verify here.
//
// A question's TOP option (buildAttributeOptions/buildColourOptions already
// sort by real productCount descending) is the one tested: it's the option
// most likely to exist in the live catalogue right now and most
// representative of whether the mechanism works at all for this leaf.

const PARAMS_PRODUCTS_PATH = "/api/params-products";

function isTestableQuestion(question) {
  return question.type === "attribute" || (question.type === "query" && question.queryParam === "colors");
}

function extractItemCount(resp) {
  return resp?.item_count ?? resp?.total_count ?? resp?.totalCount ?? resp?.meta?.total ?? 0;
}

function buildCheckUrl(apiBase, categoryId, question, value) {
  const params = new URLSearchParams({ product_type_ids: categoryId, page: "1", limit: "1" });
  if (question.type === "attribute") {
    params.append("attribute_name", question.attributeName);
    params.append("attribute_value", value);
  } else {
    params.append("colors[]", value);
  }
  return `${apiBase}${PARAMS_PRODUCTS_PATH}?${params.toString()}`;
}

/**
 * @param {object} entry - a manifest leaf entry ({categoryId, questions, ...})
 * @param {number} unfilteredCount - the leaf's live unfiltered product count (from the snapshot)
 * @param {object} deps
 * @param {(url: string) => Promise<object>} deps.fetchJson - injected so this is testable without a real network call
 * @param {string} deps.apiBase
 * @returns {Promise<{verified: boolean, checks: Array<{questionId: string, value: string, itemCount: number|null, ok: boolean, reason: string|null}>, reason: string|null}>}
 */
export async function verifyLeafMappings(entry, unfilteredCount, { fetchJson, apiBase }) {
  const testableQuestions = entry.questions.filter(isTestableQuestion);
  if (testableQuestions.length === 0) {
    // Nothing category-specific to verify (e.g. a leaf whose only questions
    // are moq/budget) -- vacuously verified.
    return { verified: true, checks: [], reason: null };
  }

  const checks = [];
  for (const question of testableQuestions) {
    const topOption = question.options[0];
    const url = buildCheckUrl(apiBase, entry.categoryId, question, topOption.value);
    try {
      const resp = await fetchJson(url);
      const itemCount = extractItemCount(resp);
      if (itemCount <= 0) {
        checks.push({ questionId: question.id, value: topOption.value, itemCount, ok: false, reason: "filtered request returned zero results" });
      } else if (itemCount >= unfilteredCount) {
        // Strictly less than, not <=: a filter that returns EXACTLY the
        // unfiltered count is indistinguishable from one the backend is
        // silently ignoring -- isAttributeUsable()'s topShare<90% threshold
        // means a genuinely usable attribute's top value should never cover
        // literally every product in the category, so equality here is a
        // red flag, not a coincidence to wave through.
        checks.push({ questionId: question.id, value: topOption.value, itemCount, ok: false, reason: `filtered count (${itemCount}) does not narrow below the leaf's unfiltered count (${unfilteredCount}) -- looks like the filter is being silently ignored` });
      } else {
        checks.push({ questionId: question.id, value: topOption.value, itemCount, ok: true, reason: null });
      }
    } catch (err) {
      checks.push({ questionId: question.id, value: topOption.value, itemCount: null, ok: false, reason: `request failed: ${err.message}` });
    }
  }

  const failedChecks = checks.filter((c) => !c.ok);
  return {
    verified: failedChecks.length === 0,
    checks,
    reason: failedChecks.length === 0 ? null : `${failedChecks.length}/${checks.length} question(s) failed live verification`,
  };
}
