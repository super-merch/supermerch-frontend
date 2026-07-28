// Run manually (not part of `npm run build`, not run in CI): fetches a one-time
// snapshot of the live catalogue needed to classify every category's Finder
// questions. Hits only the public backend API -- this repo has no database
// credentials and shouldn't gain any.
//
//   node scripts/category-finder/fetch-catalogue-snapshot.mjs
//
// Writes scripts/category-finder/.snapshot/catalogue-snapshot.json. That file is
// committed (it's aggregated counts/attribute-value distributions only, never
// individual product records) so a reviewer can see why a leaf was classified a
// given way without re-running this script.
//
// Re-run this whenever the catalogue has changed meaningfully, then re-run
// generate-manifest.mjs to refresh the committed manifest.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const API_BASE = process.env.SUPERMERCH_API_BASE || "https://api.supermerch.com.au";
const CONCURRENCY = 3;
const RETRY_DELAYS_MS = [500, 1500, 4000];

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

function flattenLeaves(v1categories) {
  const leaves = [];
  for (const main of v1categories) {
    const subs = main.subTypes || [];
    if (subs.length === 0) {
      leaves.push({ leafId: main.id, leafName: main.name, parentId: main.id, parentName: main.name, isMainItself: true, navGroup: main.navGroup });
    } else {
      for (const s of subs) {
        leaves.push({ leafId: s.id, leafName: s.name, parentId: main.id, parentName: main.name, isMainItself: false, navGroup: main.navGroup });
      }
    }
  }
  return leaves;
}

async function fetchLeafStats(leaf) {
  // Cheap count-only call (no send_attributes) plus one attribute-list call.
  // send_attributes=true is a live, uncached scan whose cost scales with
  // category size on the backend -- issuing it once per leaf, ever (until the
  // next manual re-run), not per page load, is the deliberate tradeoff here.
  const countUrl = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.leafId)}&limit=1&page=1`;
  const attrUrl = `${API_BASE}/api/client-products?product_type_ids=${encodeURIComponent(leaf.leafId)}&limit=1&page=1&send_attributes=true`;

  const countResp = await fetchJsonWithRetry(countUrl);
  const productCount = countResp.item_count ?? countResp.pagination?.totalCount ?? 0;

  let attributes = [];
  let colourPopulatedPct = null;
  if (productCount > 0) {
    const attrResp = await fetchJsonWithRetry(attrUrl);
    attributes = attrResp.attributes || [];
    // The public API has no per-value-count or colour-population endpoint --
    // generate-manifest.mjs's classify() treats a missing colourPopulatedPct as
    // "not usable" rather than guessing. A more accurate figure requires a
    // direct database audit (as was done once, manually, during discovery) --
    // that's a deliberate, documented limitation of this script, not an
    // oversight.
  }

  return { ...leaf, productCount, attributes, colourPopulatedPct };
}

async function main() {
  console.log(`Fetching category hierarchy from ${API_BASE}/api/v1-categories ...`);
  const v1Response = await fetchJsonWithRetry(`${API_BASE}/api/v1-categories`);
  const v1categories = v1Response.data || [];
  const leaves = flattenLeaves(v1categories);
  console.log(`Discovered ${leaves.length} leaf categories. Auditing each (concurrency=${CONCURRENCY}, this is slow by design) ...`);

  let done = 0;
  const results = await mapWithConcurrency(leaves, CONCURRENCY, async (leaf) => {
    const stats = await fetchLeafStats(leaf);
    done += 1;
    if (done % 25 === 0) console.log(`  ...${done}/${leaves.length}`);
    return stats;
  });

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(
    SNAPSHOT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), apiBase: API_BASE, leafCount: leaves.length, leaves: results }, null, 2)
  );
  console.log(`Done. Wrote ${SNAPSHOT_PATH}`);
}

main().catch((err) => {
  console.error("fetch-catalogue-snapshot failed:", err);
  process.exit(1);
});
