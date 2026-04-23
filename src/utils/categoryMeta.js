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
 * @param {string} categoryId - _promodataGroupId value
 * @param {Array} categories  - v1categories array from ProductsContext
 * @returns {object|null}
 */
export function getCategoryMeta(categoryId, categories) {
  if (!categories || !Array.isArray(categories)) return null;
  return categories.find((c) => c.id === categoryId) ?? null;
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
