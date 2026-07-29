// Run manually (not part of `npm run build`, not run in CI): fetches a one-time
// snapshot of the live catalogue needed to classify every category's Finder
// questions. Hits only the public backend API -- this repo has no database
// credentials and shouldn't gain any.
//
//   node scripts/category-finder/fetch-catalogue-snapshot.mjs
//
// Writes scripts/category-finder/.snapshot/catalogue-snapshot.json.
//
// That file is a RAW, TRANSIENT, per-value-count-level dump across every
// category -- it is gitignored (see .gitignore), not committed. Re-run this
// whenever the catalogue has changed meaningfully, then re-run
// generate-manifest.mjs to refresh the committed manifest + the compact,
// non-sensitive coverage/audit-evidence files that DO get committed.
//
// SAMPLING METHODOLOGY (read this before trusting a classification):
// the public API has no per-value-count, aggregate-distribution, or
// colour-population endpoint, and a full send_attributes=true scan is an
// expensive, uncached, live full-category document scan on the backend (not
// something to do per category during a routine audit). This script instead
// takes a bounded, STRATIFIED sample: up to STRATA_COUNT pages spread evenly
// from the first page to the last, each a plain (cheap) product-list call,
// merged into one sample. This deliberately avoids the bias of a plain
// "first page only" sample, where product ordering (which may be
// supplier-prioritised or otherwise non-random) could make the first N
// products unrepresentative of the whole category.
//
// Every leaf's `auditMode` records whether the sample actually covered the
// WHOLE category ("complete_paginated" -- every page was fetched, so the
// counts are exact) or only a bounded subset ("sampled_estimate" -- treat
// percentages as estimates, not ground truth). `filterMappingsValidated` is
// NEVER set true by the generator regardless of auditMode (see classify.mjs)
// -- live option validation is a separate, not-yet-implemented step.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { flattenHierarchy } from "./lib/hierarchy.mjs";
import { validateSnapshot } from "./lib/schema.mjs";
import { dedupeProductsById } from "./lib/dedupe.mjs";
import { mapWithConcurrency } from "./lib/concurrency.mjs";
import { fetchJsonWithRetry as fetchJsonWithRetryShared } from "./lib/httpRetry.mjs";
import { applyCustomAttributeDerivation } from "./lib/customAttributeDerivation.mjs";

// See lib/customAttributeDerivation.mjs for the actual per-leaf derivation
// logic (Beanies Fabric, Coaster Material, Metal Pens primary body
// material, Workwear Visibility/Compliance split) -- extracted there so
// it's directly unit-testable against fixtures, not only exercisable via a
// real network fetch. Custom-derived attribute names must be added to
// ATTR_NAMES below too, or the generic per-product loop's
// `if (!ATTR_NAMES.includes(name)) continue` guard would silently drop
// them before they ever reach classify.mjs.

const API_BASE = process.env.SUPERMERCH_API_BASE || "https://api.supermerch.com.au";
const CONCURRENCY = 3;
const RETRY_DELAYS_MS = [500, 1500, 4000];
// "Compliance" added after discovering the live API already carries a real,
// structured certification tag (values seen: Hi-Vis, NSW Rail Compliant,
// TTMC, VIC Rail Compliant, UPF Rated) -- this is exactly the authoritative
// signal the Workwear Hi-Vis/Non-Hi-Vis requirement needs, decoupled from
// colour (a fluoro-coloured garment with no Compliance:Hi-Vis tag must not
// be inferred as compliant). No fuzzy name/description keyword classifier
// was needed for this one; the data already exists, it just wasn't in this
// allowlist.
const ATTR_NAMES = [
  "Gender Fit",
  "Material",
  "Capacity",
  "Eco Factors",
  "Sport",
  "Theme",
  "Feature",
  "Features",
  "Sleeves",
  "Compliance",
  // Synthetic, per-product derived attributes (see CUSTOM_ATTRIBUTE_DERIVERS
  // above) -- these never appear literally in a product's raw
  // promodata_attributes; they're computed here from the real Material
  // value(s) already tagged on that product, then folded into the exact
  // same aggregation/usability pipeline as any other attribute name.
  "Fabric",
  "Coaster Material",
  "Primary Body Material",
  "Visibility",
];
const STRATA_COUNT = 5; // number of pages sampled, spread evenly across the category
const PER_PAGE_LIMIT = 20; // per-page product count for each stratum (a plain list call, not send_attributes)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, ".snapshot");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "catalogue-snapshot.json");

const fetchJsonWithRetry = (url) => fetchJsonWithRetryShared(url, RETRY_DELAYS_MS);

function round1(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * Picks up to STRATA_COUNT page numbers evenly spread across [1, totalPages]
 * -- e.g. for totalPages=40, STRATA_COUNT=5: pages 1, 11, 21, 30, 40. For a
 * category small enough that totalPages <= STRATA_COUNT, every page is
 * selected (a complete, not sampled, audit).
 */
function pickStrataPages(totalPages) {
  if (totalPages <= STRATA_COUNT) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set();
  for (let i = 0; i < STRATA_COUNT; i++) {
    const page = 1 + Math.round((i * (totalPages - 1)) / (STRATA_COUNT - 1));
    pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}

async function fetchLeafStats(leaf) {
  const countUrl = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.id)}&limit=1&page=1`;
  const countResp = await fetchJsonWithRetry(countUrl);
  const productCount = countResp.item_count ?? countResp.pagination?.totalCount ?? 0;

  if (productCount === 0) {
    return { leafId: leaf.id, leafName: leaf.name, parentId: leaf.parentId, parentName: leaf.parentName, navGroup: leaf.navGroup, productCount: 0 };
  }

  const totalPages = Math.max(1, Math.ceil(productCount / PER_PAGE_LIMIT));
  const strataPages = pickStrataPages(totalPages);

  // Some deep page/skip values trigger a backend 500 on large categories (a
  // known Mongo sort/skip limitation, same class of issue as the earlier
  // Phone & Technology investigation) -- a single bad stratum must not abort
  // the whole 297-leaf batch. Each page is fetched independently; a page that
  // still fails after fetchJsonWithRetry's own retries contributes nothing to
  // the sample rather than throwing, and forces auditMode to
  // "sampled_estimate" (never claim a complete/exact count when part of the
  // intended sample is missing, even if every OTHER stratum succeeded).
  let anyPageFailed = false;
  const pageResults = await mapWithConcurrency(strataPages, CONCURRENCY, async (page) => {
    const url = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.id)}&limit=${PER_PAGE_LIMIT}&page=${page}`;
    try {
      const resp = await fetchJsonWithRetry(url);
      return resp.data || [];
    } catch (err) {
      console.error(`  ! stratum fetch failed for ${leaf.id} page ${page}: ${err.message} -- continuing with remaining strata`);
      anyPageFailed = true;
      return [];
    }
  });
  const isCompleteAudit = !anyPageFailed && strataPages.length === totalPages;

  // Dedupe by catalogue-record identity in case of any page-boundary overlap
  // (defensive -- shouldn't normally happen with correct pagination, but
  // sample integrity matters here). See dedupeProductsById for why `_id`
  // takes priority over `meta.id`.
  const sampleProducts = dedupeProductsById(pageResults.flat());
  const sampleSize = sampleProducts.length; // ACTUAL count returned, not the requested limit*pages

  if (sampleSize === 0) {
    // Every stratum failed (or the category is genuinely all unparseable
    // records) -- there is no real sample to build attribute/colour stats
    // from. Report this honestly as a fetch failure rather than fabricating
    // a sampleSize of 0 against a known-positive productCount (which the
    // schema would otherwise accept as "genuinely nothing populated").
    return {
      leafId: leaf.id,
      leafName: leaf.name,
      parentId: leaf.parentId,
      parentName: leaf.parentName,
      navGroup: leaf.navGroup,
      productCount,
      fetchFailed: true,
      fetchFailureReason: `All ${strataPages.length} stratified page fetches failed for a category reporting ${productCount} products -- needs re-audit, not evidence of zero data.`,
    };
  }

  // Per-product dedup: a product listing "Material: Steel" twice must not
  // count twice, and a product with BOTH "Material: Steel" and
  // "Material: Aluminium" must count once toward taggedProductCount for
  // Material but contribute to BOTH values' productCount.
  const taggedProductCounts = new Map(); // name -> count of products with >=1 value
  const valueProductCounts = new Map(); // name -> Map(value -> product count)
  let colourPopulatedCount = 0;
  const colourProductCounts = new Map(); // value -> product count

  for (const product of sampleProducts) {
    const rawAttrs = product?.product?.categorisation?.promodata_attributes || [];
    const perProductValues = new Map(); // name -> Set(values), THIS product only
    for (const raw of rawAttrs) {
      const idx = raw.indexOf(":");
      if (idx === -1) continue;
      const name = raw.slice(0, idx).trim();
      const value = raw.slice(idx + 1).trim();
      if (!ATTR_NAMES.includes(name) || !value) continue;
      if (!perProductValues.has(name)) perProductValues.set(name, new Set());
      perProductValues.get(name).add(value); // Set dedupes a repeated identical value within this one product
    }

    applyCustomAttributeDerivation(leaf.id, perProductValues);

    for (const [name, valueSet] of perProductValues) {
      taggedProductCounts.set(name, (taggedProductCounts.get(name) || 0) + 1);
      if (!valueProductCounts.has(name)) valueProductCounts.set(name, new Map());
      const valueMap = valueProductCounts.get(name);
      for (const value of valueSet) {
        valueMap.set(value, (valueMap.get(value) || 0) + 1);
      }
    }

    const colourList = product?.product?.colours?.list || [];
    const perProductColours = new Set();
    for (const entry of colourList) {
      const names = [entry?.name, ...(entry?.colours || []), ...(entry?.appa_colours || [])].filter(Boolean);
      for (const name of names) perProductColours.add(name);
    }
    if (perProductColours.size > 0) {
      colourPopulatedCount += 1;
      for (const value of perProductColours) {
        colourProductCounts.set(value, (colourProductCounts.get(value) || 0) + 1);
      }
    }
  }

  // applyCustomAttributeDerivation already deleted the raw source attribute
  // (Material / Compliance) from each product's OWN perProductValues before
  // aggregation, for every leaf it touched -- so taggedProductCounts simply
  // never accumulates anything for that raw name on those leaves, and this
  // loop's normal zero-count skip below handles it with no special case
  // needed here.
  const attributes = [];
  for (const name of ATTR_NAMES) {
    const taggedProductCount = taggedProductCounts.get(name) || 0;
    if (taggedProductCount === 0) continue;
    const values = [...valueProductCounts.get(name).entries()]
      .map(([value, productCount]) => ({ value, productCount }))
      .sort((a, b) => b.productCount - a.productCount);
    const valueOccurrenceCount = values.reduce((s, v) => s + v.productCount, 0);
    const topValueProductCount = values[0].productCount;
    attributes.push({
      name,
      sampleSize,
      taggedProductCount,
      valueOccurrenceCount,
      populatedPct: round1(taggedProductCount, sampleSize),
      distinctValues: values.length,
      topValueProductCount,
      topShare: round1(topValueProductCount, taggedProductCount),
      values,
    });
  }

  const colourValues = [...colourProductCounts.entries()].map(([value, productCount]) => ({ value, productCount })).sort((a, b) => b.productCount - a.productCount);

  return {
    leafId: leaf.id,
    leafName: leaf.name,
    parentId: leaf.parentId,
    parentName: leaf.parentName,
    navGroup: leaf.navGroup,
    productCount,
    auditMode: isCompleteAudit ? "complete_paginated" : "sampled_estimate",
    sampleSize,
    strataPagesFetched: strataPages.length,
    totalPages,
    attributes,
    colourPopulatedCount,
    colourPopulatedPct: round1(colourPopulatedCount, sampleSize),
    colourValues,
  };
}

async function main() {
  console.log(`Fetching category hierarchy from ${API_BASE}/api/v1-categories ...`);
  const v1Response = await fetchJsonWithRetry(`${API_BASE}/api/v1-categories`);
  const v1categories = v1Response.data || [];

  const { leaves, parents } = flattenHierarchy(v1categories, { childrenKey: "subTypes" });
  console.log(`Discovered ${leaves.length} leaf categories and ${parents.length} parent/group pages (recursive traversal, cycle/duplicate-checked). Auditing each leaf with stratified multi-page sampling (concurrency=${CONCURRENCY}, deliberately slow -- this is a one-time offline batch job) ...`);

  let done = 0;
  const results = await mapWithConcurrency(leaves, CONCURRENCY, async (leaf) => {
    const stats = await fetchLeafStats(leaf);
    done += 1;
    if (done % 25 === 0) console.log(`  ...${done}/${leaves.length}`);
    return stats;
  });

  // Parent/group aggregate pages (e.g. "PX" Workwear, covering all of
  // PX-01..PX-14): confirmed live that BOTH /api/client-products and
  // /api/params-products (the endpoint real Finder pages call) already
  // return the correct aggregate across every child leaf when queried by the
  // parent's own category ID directly (e.g. product_type_ids=PX summed
  // exactly to the total of all its PX-* children in a live spot-check) --
  // no separate aggregation logic is needed, fetchLeafStats already works
  // unmodified since it only needs {id, name}.
  console.log(`Auditing ${parents.length} parent/group pages the same way ...`);
  const parentResults = await mapWithConcurrency(parents, CONCURRENCY, async (parent) => {
    const stats = await fetchLeafStats({ id: parent.id, name: parent.name, parentId: parent.id, parentName: parent.name, navGroup: null });
    return { ...stats, childCount: parent.childCount };
  });

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    apiBase: API_BASE,
    strataCount: STRATA_COUNT,
    perPageLimit: PER_PAGE_LIMIT,
    leaves: results,
    parents: parentResults,
  };

  validateSnapshot(snapshot); // fail loudly here, before writing anything, if the fetch produced anything malformed or a duplicate leafId

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  const completeCount = results.filter((r) => r.auditMode === "complete_paginated").length;
  const sampledCount = results.filter((r) => r.auditMode === "sampled_estimate").length;
  console.log(`Done. ${completeCount} leaves fully audited, ${sampledCount} sampled (estimate). Wrote ${SNAPSHOT_PATH} (gitignored -- not committed).`);
}

main().catch((err) => {
  console.error("fetch-catalogue-snapshot failed:", err.name === "SchemaError" || err.name === "HierarchyError" ? err.message : err);
  process.exit(1);
});
