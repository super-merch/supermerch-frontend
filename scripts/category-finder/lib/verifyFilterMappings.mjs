// Live verification core for one manifest leaf entry.
//
// This is a deliberately EXHAUSTIVE check, not a spot-check: every option of
// every attribute/colour question is replayed against the real
// customer-facing endpoint (not just the top/most-populated option), a fresh
// unfiltered baseline is fetched in the SAME run (never trusted from an
// earlier snapshot, which can drift), and a sample of the actually-returned
// products is inspected to confirm they really match the requested filter --
// a non-empty, narrower result count alone does not prove the backend
// applied the filter correctly.
//
// Quantity (moq) and budget (price range) are also verified per leaf, not
// assumed generically safe -- different categories can behave differently
// under the same filter due to product volume, aggregation cost, or missing
// price tiers (this project has already found one real per-category 500 on
// deep pagination; the same class of bug could exist on price-range
// filtering for a specific category, which the moq/budget checks below now
// test for directly, using the exact fixed combinations requested for
// review: moq=50 alone, a $5-$20 budget alone, and the two combined).
//
// FAILURE HANDLING: this module never simply fails a whole category the
// moment ONE option or question misbehaves. It removes only the offending
// option (re-checking whether the question still has >=2 real options left)
// or the offending question (moq/budget), and the category is only
// considered to have no useful Finder if NOTHING survives. This mirrors
// exactly how a human reviewer would fix a broken dropdown -- delete the bad
// choice, keep the good ones -- rather than discarding the whole feature.
//
// Two independent endpoints are checked for every request:
//   - /api/params-products: the endpoint the real Category Finder pages
//     actually call (ProductsContext.jsx's productTypeId-only branch). This
//     is the ONLY endpoint that gates pass/fail.
//   - /api/client-products: recorded as a diagnostic-only comparison (this
//     project has already seen these two endpoints behave differently under
//     load), never used to override a params-products result in either
//     direction.
//
// filterMappingsValidated is the ONLY thing this module's caller should set.
// runtimeEnabled is a separate, later, explicitly-invoked step (see
// promote-runtime-enabled.mjs) -- this file has no opinion on it.

import { mapWithConcurrency } from "./concurrency.mjs";

const PARAMS_PRODUCTS_PATH = "/api/params-products";
const CLIENT_PRODUCTS_PATH = "/api/client-products";
const SAMPLE_LIMIT = 5; // small, but non-zero -- enough real products to inspect for correctness without bulk-fetching
const MIN_SURVIVING_OPTIONS = 2; // matches isAttributeUsable()'s MIN_DISTINCT_VALUES -- a 0-or-1-choice dropdown isn't a real question
// A colour dropdown can have 100+ real options -- checking them one at a
// time was the single biggest throughput problem in this pipeline (a
// category with a huge colour list could dominate a whole batch's wall-clock
// time on its own, even with per-request timeouts in place). Options within
// ONE question are now checked with their own small concurrency limit,
// independent of (and nested inside) the outer per-category concurrency in
// verify-filter-mappings.mjs.
const OPTION_CHECK_CONCURRENCY = 6;

// Every one of the moq/budget dropdown's own bucket VALUES is tested
// individually, the same per-option removal treatment as attribute/colour
// options (see verifyQuantityOptions/verifyBudgetOptions below) -- a single
// fixed representative value (the previous design: moq=50 only, $5-$20
// only) missed that a category can genuinely work at some buckets and not
// others (e.g. a high-minimum-order-quantity product only orderable at
// qty>=500 would fail a moq=50-only check and lose the WHOLE quantity
// question, even though every other bucket is fine). This was a real,
// reported bug: several leaves lost budget or quantity entirely because the
// one fixed bucket tested happened not to apply to them.
const EXAMPLE_LIMIT = 3; // for reporting -- e.g. the Shirts Under-$5 review needs concrete qualifying examples, not just a pass/fail

// One supplementary combined moq+budget check (using each question's
// first-still-surviving bucket, once both have at least one) -- distinct
// from the per-bucket checks above, this exists ONLY to catch a
// combination-specific backend issue that neither filter alone would
// surface (the historical PS/Phone & Technology precedent: price-range
// aggregation cost that only appears once quantity filtering is ALSO
// applied). If this fails, budget is demoted entirely (budget has
// historically been the more fragile piece) rather than failing the
// category outright.
function firstSurvivingValue(options) {
  return options.length > 0 ? options[0].value : null;
}

function isTestableQuestion(question) {
  return question.type === "attribute" || (question.type === "query" && question.queryParam === "colors");
}

function isValidListResponseShape(resp) {
  return resp && typeof resp === "object" && Array.isArray(resp.data) && typeof resp.item_count === "number";
}

function extractItemCount(resp) {
  return resp?.item_count ?? resp?.total_count ?? resp?.totalCount ?? resp?.meta?.total ?? 0;
}

function buildUrl(apiBase, path, categoryId, extraParams) {
  const params = new URLSearchParams({ product_type_ids: categoryId, page: "1", limit: String(SAMPLE_LIMIT), send_attributes: "true" });
  for (const [key, value] of extraParams) params.append(key, value);
  return `${apiBase}${path}?${params.toString()}`;
}

// A question's option `value` can itself be a comma-joined multi-value
// string (e.g. Capacity's "Under 300ml" -> "100ml - 199ml,200ml - 299ml") --
// matching must accept ANY of the joined raw values, the same OR-match
// semantics the backend itself uses for a comma-separated attribute_value.
function splitMultiValue(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function productHasAttributeValue(product, attributeName, requestedValue) {
  const rawAttrs = product?.product?.categorisation?.promodata_attributes || [];
  const candidates = splitMultiValue(requestedValue);
  return rawAttrs.some((raw) => {
    const idx = raw.indexOf(":");
    if (idx === -1) return false;
    const name = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    return name === attributeName && candidates.includes(value);
  });
}

function productHasColourValue(product, requestedValue) {
  const candidates = splitMultiValue(requestedValue);
  const list = product?.product?.colours?.list || [];
  const names = list.flatMap((entry) => [entry?.name, ...(entry?.colours || []), ...(entry?.appa_colours || [])].filter(Boolean));
  return candidates.some((c) => names.includes(c));
}

function productPrice(product) {
  const price = product?.pricingSummary?.finalMinPrice;
  return typeof price === "number" ? price : null;
}

// "Orderable at quantity" has no single authoritative field this frontend
// repo can see (pricing/MOQ enforcement lives in the backend) -- this checks
// the customer-observable proxy: either the product's own min_qty doesn't
// exceed the requested quantity, or at least one real price break in ANY
// price group kicks in at or below it (the backend's own quantity-aware
// price resolution already spans every price_groups entry, not just index
// 0 -- see getAllV2Products.js's tier-price $let, "across ALL price_groups"
// -- so this proxy must match that, not just check group 0, or it would
// wrongly report a product unorderable when only a later price group
// actually has the qualifying break). Returns null (not a failure) when
// neither field is present to check against, rather than guessing.
function productIsOrderableAtQuantity(product, qty) {
  const minQty = product?.overview?.min_qty;
  if (typeof minQty === "number" && minQty > 0 && minQty <= qty) return true;
  const priceGroups = product?.product?.prices?.price_groups;
  if (Array.isArray(priceGroups) && priceGroups.length > 0) {
    const allBreaks = priceGroups.flatMap((group) => group?.base_price?.price_breaks || []);
    if (allBreaks.length > 0) {
      return allBreaks.some((pb) => typeof pb.qty === "number" && pb.qty <= qty);
    }
  }
  if (typeof minQty === "number" && minQty > 0) return minQty <= qty;
  return null;
}

async function fetchFreshUnfilteredCount(categoryId, { fetchJson, apiBase }) {
  const url = buildUrl(apiBase, PARAMS_PRODUCTS_PATH, categoryId, []);
  try {
    const resp = await fetchJson(url);
    if (!isValidListResponseShape(resp)) {
      return { itemCount: null, url, ok: false, reason: "invalid response shape for unfiltered baseline" };
    }
    return { itemCount: extractItemCount(resp), url, ok: true, reason: null };
  } catch (err) {
    return { itemCount: null, url, ok: false, reason: `request failed: ${err.message}` };
  }
}

async function checkAttributeOrColourOption(categoryId, question, value, freshUnfilteredCount, deps) {
  // A colour option's value can be a comma-joined multi-value string (e.g. a
  // colour-family option covering several raw shades). The backend does NOT
  // split "colors[]" params on comma itself (unlike attribute_value, which
  // it does split) -- the real page instead splits client-side before ever
  // reaching the network (Cards.jsx: `urlColors.split(",")`) and sends one
  // colors[] entry per raw value. This must replicate that exact shape, or
  // it tests something the real page never actually sends.
  const extraParams =
    question.type === "attribute"
      ? [["attribute_name", question.attributeName], ["attribute_value", value]]
      : splitMultiValue(value).map((v) => ["colors[]", v]);
  const url = buildUrl(deps.apiBase, PARAMS_PRODUCTS_PATH, categoryId, extraParams);
  try {
    const resp = await deps.fetchJson(url);
    if (!isValidListResponseShape(resp)) {
      return { value, url, httpStatus: null, itemCount: null, strictlyNarrowed: null, sampleProductsValidated: null, passed: false, reason: "invalid response shape" };
    }
    const itemCount = extractItemCount(resp);
    if (itemCount <= 0) {
      return { value, url, httpStatus: 200, itemCount, strictlyNarrowed: null, sampleProductsValidated: null, passed: false, reason: "filtered request returned zero results" };
    }
    const strictlyNarrowed = freshUnfilteredCount == null ? null : itemCount < freshUnfilteredCount;
    if (strictlyNarrowed === false) {
      return { value, url, httpStatus: 200, itemCount, strictlyNarrowed, sampleProductsValidated: null, passed: false, reason: `filtered count (${itemCount}) does not narrow below the fresh unfiltered count (${freshUnfilteredCount}) -- looks like the filter is being silently ignored` };
    }
    const products = resp.data;
    const sampleProductsValidated = products.length > 0
      ? products.every((p) => (question.type === "attribute" ? productHasAttributeValue(p, question.attributeName, value) : productHasColourValue(p, value)))
      : null;
    if (sampleProductsValidated === false) {
      return { value, url, httpStatus: 200, itemCount, strictlyNarrowed, sampleProductsValidated, passed: false, reason: "sampled returned products do not actually carry the requested attribute/colour value -- filter param is not doing what it claims" };
    }
    return { value, url, httpStatus: 200, itemCount, strictlyNarrowed, sampleProductsValidated, passed: true, reason: null };
  } catch (err) {
    return { value, url, httpStatus: null, itemCount: null, strictlyNarrowed: null, sampleProductsValidated: null, passed: false, reason: `request failed: ${err.message}` };
  }
}

async function verifyTestableQuestion(categoryId, question, freshUnfilteredCount, deps) {
  const optionResults = await mapWithConcurrency(question.options, OPTION_CHECK_CONCURRENCY, (option) =>
    checkAttributeOrColourOption(categoryId, question, option.value, freshUnfilteredCount, deps)
  );
  const survivingOptions = question.options.filter((_, i) => optionResults[i].passed);
  const removedOptions = optionResults.filter((r) => !r.passed).map((r) => ({ value: r.value, reason: r.reason }));
  // A presence-mode attribute question (e.g. Workwear's Compliance:Hi-Vis,
  // see classify.mjs) is explicitly marked as meaningful with just 1 real
  // option -- the generator already made that call deliberately (a
  // customer selecting "Hi-Vis" narrows from the whole category; the
  // unselected "Any" default already covers the complement), so the live
  // verifier must not re-impose the normal >=2-option minimum here.
  const minOptionsToSurvive = question.singleValueAllowed ? 1 : MIN_SURVIVING_OPTIONS;
  return {
    id: question.id,
    param: question.type === "attribute" ? "attribute_name/attribute_value" : "colors[]",
    options: optionResults,
    survivingOptions,
    removedOptions,
    questionSurvives: survivingOptions.length >= minOptionsToSurvive,
  };
}

async function runQuantityBudgetCheck(categoryId, extraParams, { checkQty, minPrice, maxPrice }, deps) {
  const url = buildUrl(deps.apiBase, PARAMS_PRODUCTS_PATH, categoryId, extraParams);
  try {
    const resp = await deps.fetchJson(url);
    if (!isValidListResponseShape(resp)) {
      return { url, httpStatus: null, itemCount: null, examples: [], passed: false, reason: "invalid response shape" };
    }
    const itemCount = extractItemCount(resp);
    if (itemCount <= 0) {
      return { url, httpStatus: 200, itemCount, examples: [], passed: false, reason: "zero results" };
    }
    const problems = [];
    // Captured regardless of pass/fail -- concrete evidence for the kind of
    // per-bucket business review this project has already needed (e.g. "does
    // Shirts genuinely have products under $5, and at what quantity?"),
    // without a second, separate pass over the same data.
    const examples = [];
    for (const product of resp.data) {
      const id = product?.meta?.id ?? product?._id ?? "?";
      const price = productPrice(product);
      if (examples.length < EXAMPLE_LIMIT) examples.push({ id, price, name: product?.overview?.name ?? product?.product?.name ?? null });
      if (price == null) {
        problems.push(`product ${id}: null computed price`);
        continue;
      }
      if (minPrice != null && price < minPrice) problems.push(`product ${id}: priced $${price} below requested min $${minPrice}`);
      if (maxPrice != null && price > maxPrice) problems.push(`product ${id}: priced $${price} above requested max $${maxPrice}`);
      if (checkQty != null) {
        const orderable = productIsOrderableAtQuantity(product, checkQty);
        if (orderable === false) problems.push(`product ${id}: not orderable at qty ${checkQty} per its own price breaks/min_qty`);
      }
    }
    if (problems.length > 0) {
      return { url, httpStatus: 200, itemCount, examples, passed: false, reason: problems.join("; ") };
    }
    return { url, httpStatus: 200, itemCount, examples, passed: true, reason: null };
  } catch (err) {
    return { url, httpStatus: null, itemCount: null, examples: [], passed: false, reason: `request failed: ${err.message}` };
  }
}

// Tests every one of the moq question's own bucket VALUES individually
// (1-24, 25-49, ..., 500+), the same per-option removal treatment as
// verifyTestableQuestion gives attribute/colour options -- a bucket that
// doesn't apply to this category (e.g. no products orderable that low/high)
// is removed on its own; the question survives if enough buckets remain.
async function verifyQuantityOptions(categoryId, moqQuestion, deps) {
  const optionResults = await mapWithConcurrency(moqQuestion.options, OPTION_CHECK_CONCURRENCY, async (option) => {
    const checkQty = Number(option.value);
    const result = await runQuantityBudgetCheck(categoryId, [["moq", option.value]], { checkQty }, deps);
    return { ...result, value: option.value };
  });
  const survivingOptions = moqQuestion.options.filter((_, i) => optionResults[i].passed);
  return {
    id: "moq",
    param: "moq",
    options: optionResults,
    survivingOptions,
    removedOptions: optionResults.filter((r) => !r.passed).map((r) => ({ value: r.value, reason: r.reason })),
    questionSurvives: survivingOptions.length >= MIN_SURVIVING_OPTIONS,
  };
}

// Tests every one of the budget question's own bucket VALUES individually
// (e.g. "Under $5", "$5-$10", ...) -- this is specifically what explains
// (and fixes) leaves that were losing budget entirely under the old
// single-fixed-range check: a category can have zero products in one bucket
// (a real, honest finding -- e.g. Shirts genuinely may have nothing under
// $5 at low order quantities) while still having perfectly good budget
// coverage in every other bucket.
async function verifyBudgetOptions(categoryId, budgetQuestion, deps) {
  const optionResults = await mapWithConcurrency(budgetQuestion.options, OPTION_CHECK_CONCURRENCY, async (option) => {
    const [minStr, maxStr] = option.value.split(":");
    const minPrice = minStr ? Number(minStr) : null;
    const maxPrice = maxStr ? Number(maxStr) : null;
    const extraParams = [];
    if (minPrice != null) extraParams.push(["min_price", String(minPrice)]);
    if (maxPrice != null) extraParams.push(["max_price", String(maxPrice)]);
    const result = await runQuantityBudgetCheck(categoryId, extraParams, { minPrice, maxPrice }, deps);
    return { ...result, value: option.value };
  });
  const survivingOptions = budgetQuestion.options.filter((_, i) => optionResults[i].passed);
  return {
    id: "budget",
    param: "min_price/max_price",
    options: optionResults,
    survivingOptions,
    removedOptions: optionResults.filter((r) => !r.passed).map((r) => ({ value: r.value, reason: r.reason })),
    questionSurvives: survivingOptions.length >= MIN_SURVIVING_OPTIONS,
  };
}

async function checkClientProductsDiagnostic(entry, deps) {
  // Diagnostic only -- /api/client-products is NOT the endpoint real
  // Category Finder pages call for a leaf category (see
  // ProductsContext.jsx's productTypeId-only branch, which uses
  // params-products). Recorded for comparison, never used to gate.
  const url = buildUrl(deps.apiBase, CLIENT_PRODUCTS_PATH, entry.categoryId, []);
  try {
    const resp = await deps.fetchJson(url);
    return { url, httpStatus: isValidListResponseShape(resp) ? 200 : null, itemCount: isValidListResponseShape(resp) ? extractItemCount(resp) : null, note: "diagnostic only -- real Finder pages for a leaf category use /api/params-products, not this endpoint" };
  } catch (err) {
    return { url, httpStatus: null, itemCount: null, note: `request failed: ${err.message} (diagnostic only, does not affect gating)` };
  }
}

/**
 * @param {object} entry - a manifest leaf entry ({categoryId, questions, ...})
 * @param {object} deps
 * @param {(url: string) => Promise<object>} deps.fetchJson
 * @param {string} deps.apiBase
 * @param {() => string} [deps.now] - injectable clock, defaults to new Date().toISOString()
 * @returns {Promise<object>} full evidence object; see verify-filter-mappings.mjs for the committed shape
 */
export async function verifyLeafMappings(entry, deps) {
  const verifiedAt = (deps.now || (() => new Date().toISOString()))();
  const freshBaseline = await fetchFreshUnfilteredCount(entry.categoryId, deps);

  const testableQuestions = entry.questions.filter(isTestableQuestion);
  const questionReports = [];
  for (const question of testableQuestions) {
    questionReports.push(await verifyTestableQuestion(entry.categoryId, question, freshBaseline.itemCount, deps));
  }

  const moqQuestion = entry.questions.find((q) => q.id === "moq");
  const budgetQuestion = entry.questions.find((q) => q.id === "budget");
  const quantityCheck = moqQuestion ? await verifyQuantityOptions(entry.categoryId, moqQuestion, deps) : null;
  const budgetCheck = budgetQuestion ? await verifyBudgetOptions(entry.categoryId, budgetQuestion, deps) : null;

  // Supplementary combined check -- see the const declaration above for why
  // this exists on top of (not instead of) the exhaustive per-bucket checks.
  let survivingMoqOptions = quantityCheck ? quantityCheck.survivingOptions : [];
  let survivingBudgetOptions = budgetCheck ? budgetCheck.survivingOptions : [];
  let combinedCheck = null;
  if (survivingMoqOptions.length > 0 && survivingBudgetOptions.length > 0) {
    const qty = Number(firstSurvivingValue(survivingMoqOptions));
    const [minStr, maxStr] = firstSurvivingValue(survivingBudgetOptions).split(":");
    const minPrice = minStr ? Number(minStr) : null;
    const maxPrice = maxStr ? Number(maxStr) : null;
    const extraParams = [["moq", String(qty)]];
    if (minPrice != null) extraParams.push(["min_price", String(minPrice)]);
    if (maxPrice != null) extraParams.push(["max_price", String(maxPrice)]);
    combinedCheck = await runQuantityBudgetCheck(entry.categoryId, extraParams, { checkQty: qty, minPrice, maxPrice }, deps);
    if (!combinedCheck.passed) {
      // Each bucket passed alone, but the combination didn't -- a
      // combination-specific backend issue (the Phone & Technology
      // precedent). Budget is the historically fragile piece, so remove it
      // entirely rather than discarding quantity too.
      survivingBudgetOptions = [];
    }
  }

  const moqSurvives = survivingMoqOptions.length >= MIN_SURVIVING_OPTIONS;
  const budgetSurvives = survivingBudgetOptions.length >= MIN_SURVIVING_OPTIONS;

  const clientProductsDiagnostic = await checkClientProductsDiagnostic(entry, deps);

  const survivingQuestions = [];
  const removedQuestionIds = [];
  for (const question of entry.questions) {
    if (question.id === "moq") {
      if (moqSurvives) survivingQuestions.push({ ...question, options: survivingMoqOptions });
      else removedQuestionIds.push("moq");
      continue;
    }
    if (question.id === "budget") {
      if (budgetSurvives) survivingQuestions.push({ ...question, options: survivingBudgetOptions });
      else removedQuestionIds.push("budget");
      continue;
    }
    const report = questionReports.find((r) => r.id === question.id);
    if (report && report.questionSurvives) {
      survivingQuestions.push({ ...question, options: report.survivingOptions });
    } else {
      removedQuestionIds.push(question.id);
    }
  }

  // A single surviving question -- whether that's Colour alone, Order
  // quantity alone, or one lone attribute -- isn't a real Finder: it doesn't
  // meet the "quantity first, budget second, up to two attributes, colour
  // last" experience this project is meant to deliver, and shipping it
  // silently would look identical to a fully-working multi-question Finder
  // in the manifest. Require at least 2 surviving questions to ship at all;
  // a leaf that only manages 1 is disabled with an explicit reason instead
  // (belowMinimumQuestions below), rather than silently shipping a
  // single-weak-question Finder.
  const MIN_SURVIVING_QUESTIONS_TO_SHIP = 2;
  const belowMinimumQuestions = survivingQuestions.length > 0 && survivingQuestions.length < MIN_SURVIVING_QUESTIONS_TO_SHIP;
  const passed = freshBaseline.ok && survivingQuestions.length >= MIN_SURVIVING_QUESTIONS_TO_SHIP;

  return {
    categoryId: entry.categoryId,
    verifiedAt,
    liveUnfilteredCount: freshBaseline.itemCount,
    baselineOk: freshBaseline.ok,
    questions: questionReports,
    quantityCheck,
    budgetCheck,
    combinedQuantityBudgetCheck: combinedCheck,
    clientProductsDiagnostic,
    survivingQuestions: passed ? survivingQuestions : [],
    removedQuestionIds: passed ? removedQuestionIds : [...removedQuestionIds, ...survivingQuestions.map((q) => q.id)],
    belowMinimumQuestions,
    passed,
  };
}
