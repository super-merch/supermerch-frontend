/**
 * Centralized category metadata helpers.
 *
 * All functions accept a promodata category id and the v1categories array
 * (from ProductsContext / /api/v1-categories).
 *
 * Missing metadata always falls back to safe defaults so callers never crash.
 */

/**
 * Returns the category entry from the v1categories array matching the given id,
 * or null if not found.
 *
 * Lookup order:
 * 1. Exact match on `id` (_promodataGroupId or mongo _id)
 * 2. Fallback: first category whose `allowedTypeGroupIds` includes the given id
 *
 * @param {string} categoryId - _promodataGroupId value (e.g. "CL", "HW", "PW")
 * @param {Array} categories  - v1categories array from ProductsContext
 * @returns {object|null}
 */
export function getCategoryMeta(categoryId, categories) {
  if (!categories || !Array.isArray(categories)) return null;
  const exact = categories.find((c) => c.id === categoryId);
  if (exact) return exact;

  return (
    categories.find(
      (c) =>
        Array.isArray(c.allowedTypeGroupIds) &&
        c.allowedTypeGroupIds.includes(categoryId),
    ) ?? null
  );
}

/**
 * Resolver-focused lookup:
 * - Prefer exact only when it has navGroup
 * - Else fallback to allowedTypeGroupIds match
 * - Else fallback to exact
 */
export function getCategoryMetaForNavGroup(categoryId, categories) {
  if (!categories || !Array.isArray(categories)) return null;
  const exact = categories.find((c) => c.id === categoryId);
  const fallback = categories.find(
    (c) =>
      Array.isArray(c.allowedTypeGroupIds) &&
      c.allowedTypeGroupIds.includes(categoryId),
  );
  if (exact && String(exact?.navGroup || "").trim()) return exact;
  if (fallback) return fallback;
  if (exact) return exact;
  return null;
}

/**
 * Returns true when the category's navGroup is "clothing".
 * Falls back to false for missing/unknown categories.
 *
 * @param {string} categoryId
 * @param {Array}  categories
 * @returns {boolean}
 */
export function isClothingCategory(categoryId, categories) {
  const meta = getCategoryMeta(categoryId, categories);
  return meta?.navGroup === "clothing";
}

/**
 * Returns true when the category's navGroup is "headwear".
 * Falls back to false for missing/unknown categories.
 *
 * @param {string} categoryId
 * @param {Array}  categories
 * @returns {boolean}
 */
export function isHeadwearCategory(categoryId, categories) {
  const meta = getCategoryMeta(categoryId, categories);
  return meta?.navGroup === "headwear";
}

/**
 * Returns the artwork source for a category: "supermerch" or "promodata".
 * Falls back to "promodata" for missing metadata or null artworkSource.
 *
 * @param {string} categoryId
 * @param {Array}  categories
 * @returns {"supermerch"|"promodata"}
 */
export function getArtworkSource(categoryId, categories) {
  const meta = getCategoryMeta(categoryId, categories);
  return meta?.artworkSource || "promodata";
}
