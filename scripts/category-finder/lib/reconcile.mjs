// Reconciles generator output against the committed, independently-sourced
// authoritative-category-ids.json -- NOT against the same manifest it
// produced. This is the actual point of the reconciliation requirement: an
// incomplete snapshot (say, one that only covers 288 of 297 leaves because a
// network call failed partway through) must never be able to validate itself
// as "complete" just because its own totals happen to sum correctly. It has
// to match a source that was captured independently, at a different time,
// through a different code path.

class ReconciliationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReconciliationError";
  }
}

/**
 * @param {Record<string, {finderMode: string}>} manifest - keyed by categoryId
 * @param {{leaves: Array<{id, name}>, parents: Array<{id, name}>}} authoritative
 * @param {Array<{id, name}>} [generatedParents] - parent-page manifest entries, if reconciling those too
 * @throws {ReconciliationError} with every discrepancy listed, not just the first
 */
export function reconcileLeaves(manifest, authoritative) {
  const problems = [];
  const authoritativeIds = new Set(authoritative.leaves.map((l) => l.id));
  const manifestIds = new Set(Object.keys(manifest));

  const missing = [...authoritativeIds].filter((id) => !manifestIds.has(id));
  const unexpected = [...manifestIds].filter((id) => !authoritativeIds.has(id));

  if (missing.length > 0) {
    problems.push(`Missing ${missing.length} authoritative leaf ID(s) from generated manifest: ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? ", ..." : ""}`);
  }
  if (unexpected.length > 0) {
    problems.push(`Manifest contains ${unexpected.length} ID(s) not present in the authoritative inventory: ${unexpected.slice(0, 20).join(", ")}${unexpected.length > 20 ? ", ..." : ""}`);
  }
  if (manifestIds.size !== Object.keys(manifest).length) {
    problems.push("Duplicate keys detected in manifest object (should be structurally impossible, but checked explicitly).");
  }

  const counts = { curated: 0, inherited: 0, generic: 0, excluded: 0 };
  for (const entry of Object.values(manifest)) {
    if (!Object.prototype.hasOwnProperty.call(counts, entry.finderMode)) {
      problems.push(`Entry "${entry.categoryId}" has an unknown finderMode: ${JSON.stringify(entry.finderMode)}`);
      continue;
    }
    counts[entry.finderMode] += 1;
  }
  const sum = counts.curated + counts.inherited + counts.generic + counts.excluded;
  if (sum !== authoritative.leaves.length) {
    problems.push(
      `finderMode counts sum to ${sum} (curated=${counts.curated}, inherited=${counts.inherited}, generic=${counts.generic}, excluded=${counts.excluded}), but the authoritative inventory has ${authoritative.leaves.length} leaves.`
    );
  }

  if (problems.length > 0) {
    throw new ReconciliationError(`Leaf reconciliation FAILED against authoritative-category-ids.json:\n- ${problems.join("\n- ")}`);
  }

  return { total: authoritative.leaves.length, ...counts };
}

/**
 * Same idea, for the 27 parent/group pages.
 */
export function reconcileParents(parentManifest, authoritative) {
  const problems = [];
  const authoritativeIds = new Set(authoritative.parents.map((p) => p.id));
  const manifestIds = new Set(Object.keys(parentManifest));

  const missing = [...authoritativeIds].filter((id) => !manifestIds.has(id));
  const unexpected = [...manifestIds].filter((id) => !authoritativeIds.has(id));

  if (missing.length > 0) problems.push(`Missing parent page ID(s): ${missing.join(", ")}`);
  if (unexpected.length > 0) problems.push(`Unexpected parent page ID(s) not in authoritative inventory: ${unexpected.join(", ")}`);

  if (problems.length > 0) {
    throw new ReconciliationError(`Parent-page reconciliation FAILED against authoritative-category-ids.json:\n- ${problems.join("\n- ")}`);
  }

  return { total: authoritative.parents.length };
}

export { ReconciliationError };
