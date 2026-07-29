// One-off, targeted re-fetch for a SMALL SUBSET of leaves, used after a
// derivation-logic change that only affects a couple of leaves -- avoids
// re-running the entire 297+27 category live audit (which can take a long
// time and only writes its result to disk once, at the very end -- risky to
// interrupt). This script fetches just the requested leaf IDs and replaces
// their entries in the EXISTING committed-locally snapshot file, leaving
// every other leaf/parent untouched.
//
//   node scripts/category-finder/patch-snapshot-leaves.mjs PK-02 PM-07
//
// Safe by construction: reads the existing snapshot, only overwrites the
// specific leafId entries requested, then re-validates the whole snapshot
// before writing anything back.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchLeafStats } from "./fetch-catalogue-snapshot.mjs";
import { validateSnapshot } from "./lib/schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, ".snapshot", "catalogue-snapshot.json");
const AUTHORITATIVE_PATH = path.join(__dirname, "authoritative-category-ids.json");

async function main() {
  const requestedIds = process.argv.slice(2);
  if (requestedIds.length === 0) {
    console.error("Usage: node scripts/category-finder/patch-snapshot-leaves.mjs <leafId> [leafId...]");
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  const authoritative = JSON.parse(fs.readFileSync(AUTHORITATIVE_PATH, "utf8"));

  for (const leafId of requestedIds) {
    const authLeaf = authoritative.leaves.find((l) => l.id === leafId);
    if (!authLeaf) {
      console.error(`No authoritative record for leaf ${leafId} -- skipping.`);
      continue;
    }
    console.log(`Fetching fresh stats for ${leafId} (${authLeaf.name}) ...`);
    const stats = await fetchLeafStats({ ...authLeaf, navGroup: authLeaf.navGroup ?? null });
    const idx = snapshot.leaves.findIndex((l) => l.leafId === leafId);
    if (idx === -1) {
      snapshot.leaves.push(stats);
    } else {
      snapshot.leaves[idx] = stats;
    }
    console.log(`  -> productCount=${stats.productCount}, auditMode=${stats.auditMode}, sampleSize=${stats.sampleSize ?? "n/a"}`);
  }

  validateSnapshot(snapshot); // fail loudly rather than write a broken snapshot
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`Patched ${requestedIds.length} leaf/leaves in ${SNAPSHOT_PATH}.`);
}

main().catch((err) => {
  console.error("patch-snapshot-leaves failed:", err);
  process.exit(1);
});
