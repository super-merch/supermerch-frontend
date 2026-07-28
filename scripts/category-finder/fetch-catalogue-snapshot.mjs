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

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { flattenHierarchy } from "./lib/hierarchy.mjs";
import { validateSnapshot } from "./lib/schema.mjs";

const API_BASE = process.env.SUPERMERCH_API_BASE || "https://api.supermerch.com.au";
const CONCURRENCY = 3;
const RETRY_DELAYS_MS = [500, 1500, 4000];
const ATTR_NAMES = ["Gender Fit", "Material", "Capacity", "Eco Factors", "Sport", "Theme", "Feature", "Features", "Sleeves"];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, ".snapshot");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "catalogue-snapshot.json");

async function fetchJsonWithRetry(url) {
  let lastError;
  for (const delay of [0, ...RETRY_DELAYS_MS]) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// NOTE: the public API has no per-value-count or colour-population endpoint.
// This script derives them itself from a bounded product sample per leaf
// (large enough to be a reasonable estimate, small enough to stay a "cheap"
// call, not a full send_attributes=true scan of the whole category). This is
// a deliberate, documented approximation -- exact counts would require either
// a backend aggregation endpoint that doesn't exist yet, or a direct
// database audit (as was done once, manually, during discovery). Every
// leaf's stats carry `sampleSize` so a reviewer can see the confidence level
// behind a given classification.
const SAMPLE_SIZE = 100;

async function fetchLeafStats(leaf) {
  const countUrl = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.id)}&limit=1&page=1`;
  const countResp = await fetchJsonWithRetry(countUrl);
  const productCount = countResp.item_count ?? countResp.pagination?.totalCount ?? 0;

  if (productCount === 0) {
    return { leafId: leaf.id, leafName: leaf.name, parentId: leaf.parentId, parentName: leaf.parentName, navGroup: leaf.navGroup, productCount: 0 };
  }

  const sampleUrl = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.id)}&limit=${SAMPLE_SIZE}&page=1&send_attributes=true`;
  const sampleResp = await fetchJsonWithRetry(sampleUrl);

  // The distinct-value list tells us WHICH values exist server-wide for this
  // category; per-value counts and colour data are derived from the returned
  // product sample itself (the API has no per-value-count endpoint).
  const products = sampleResp.data || [];
  const sampleSize = products.length;

  const attrValueCounts = new Map(); // name -> Map(value -> count)
  for (const name of ATTR_NAMES) attrValueCounts.set(name, new Map());

  const colourCounts = new Map();
  let colourPopulatedCount = 0;

  for (const product of products) {
    const rawAttrs = product?.product?.categorisation?.promodata_attributes || [];
    for (const raw of rawAttrs) {
      const idx = raw.indexOf(":");
      if (idx === -1) continue;
      const name = raw.slice(0, idx).trim();
      const value = raw.slice(idx + 1).trim();
      if (!attrValueCounts.has(name)) continue;
      const valueMap = attrValueCounts.get(name);
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }

    const colourList = product?.product?.colours?.list || [];
    if (colourList.length > 0) {
      colourPopulatedCount += 1;
      for (const entry of colourList) {
        const names = [entry?.name, ...(entry?.colours || []), ...(entry?.appa_colours || [])].filter(Boolean);
        for (const name of names) {
          colourCounts.set(name, (colourCounts.get(name) || 0) + 1);
        }
      }
    }
  }

  const attributes = [];
  for (const name of ATTR_NAMES) {
    const valueMap = attrValueCounts.get(name);
    if (valueMap.size === 0) continue;
    const values = [...valueMap.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
    const totalTagged = values.reduce((s, v) => s + v.count, 0);
    attributes.push({ name, distinctValues: values.length, totalTagged, topShare: Math.round((values[0].count / totalTagged) * 1000) / 10, values });
  }

  const colourValues = [...colourCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);

  return {
    leafId: leaf.id,
    leafName: leaf.name,
    parentId: leaf.parentId,
    parentName: leaf.parentName,
    navGroup: leaf.navGroup,
    productCount,
    sampleSize,
    attributes,
    colourPopulatedCount,
    colourPopulatedPct: sampleSize > 0 ? Math.round((colourPopulatedCount / sampleSize) * 1000) / 10 : 0,
    colourValues,
  };
}

async function main() {
  console.log(`Fetching category hierarchy from ${API_BASE}/api/v1-categories ...`);
  const v1Response = await fetchJsonWithRetry(`${API_BASE}/api/v1-categories`);
  const v1categories = v1Response.data || [];

  const { leaves, parents } = flattenHierarchy(v1categories, { childrenKey: "subTypes" });
  console.log(`Discovered ${leaves.length} leaf categories and ${parents.length} parent/group pages (recursive traversal, cycle/duplicate-checked). Auditing each leaf (concurrency=${CONCURRENCY}, deliberately slow -- this is a one-time offline batch job) ...`);

  let done = 0;
  const results = await mapWithConcurrency(leaves, CONCURRENCY, async (leaf) => {
    const stats = await fetchLeafStats(leaf);
    done += 1;
    if (done % 25 === 0) console.log(`  ...${done}/${leaves.length}`);
    return stats;
  });

  const snapshot = { fetchedAt: new Date().toISOString(), apiBase: API_BASE, sampleSize: SAMPLE_SIZE, leaves: results };

  validateSnapshot(snapshot); // fail loudly here, before writing anything, if the fetch produced anything malformed

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`Done. Wrote ${SNAPSHOT_PATH} (gitignored -- not committed).`);
}

main().catch((err) => {
  console.error("fetch-catalogue-snapshot failed:", err.name === "SchemaError" || err.name === "HierarchyError" ? err.message : err);
  process.exit(1);
});
