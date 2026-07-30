// Generic case/whitespace-insensitive dedup for {value, productCount} stats.
//
// Root cause this fixes (shared by both colour and attribute values, see
// colourNormalization.mjs's file header for the full writeup): raw supplier
// data has case/whitespace variants of the same value ("Steel" vs "steel ")
// that fetch-catalogue-snapshot.mjs used to key by the exact raw string,
// producing separate entries that title-case down to an identical display
// label. Both colour and attribute matching on the backend are
// case-insensitive (getAllV2Products.js: the colour regex and the
// `attrName\\s*:\\s*value` regex both carry the "i" flag), so submitting
// any one casing variant matches products regardless of which casing THAT
// product's own data uses -- collapsing case variants into one canonical
// entry never changes which products a filter matches.

/**
 * @param {Array<{value: string, productCount: number}>} values
 * @returns {Array<{value: string, productCount: number}>} deduped, sorted by
 *   productCount descending. The canonical `value` kept per normalized key
 *   is whichever exact casing was seen on the most products (arbitrary tie
 *   break among equally-common variants -- any variant matches identically).
 */
export function dedupeValueStats(values) {
  const byKey = new Map(); // normalizedKey -> Map(rawValue -> productCount)
  for (const { value, productCount } of values || []) {
    const key = String(value).trim().toLowerCase().replace(/\s+/g, " ");
    if (!byKey.has(key)) byKey.set(key, new Map());
    const variantCounts = byKey.get(key);
    variantCounts.set(value, (variantCounts.get(value) || 0) + productCount);
  }
  const deduped = [];
  for (const variantCounts of byKey.values()) {
    const sorted = [...variantCounts.entries()].sort((a, b) => b[1] - a[1]);
    const canonicalValue = sorted[0][0];
    const totalProductCount = sorted.reduce((sum, [, count]) => sum + count, 0);
    deduped.push({ value: canonicalValue, productCount: totalProductCount });
  }
  return deduped.sort((a, b) => b.productCount - a.productCount);
}
