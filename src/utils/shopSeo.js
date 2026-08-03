import { isValidCategoryId } from "./categoryValidity";

export const getShopSeoContext = (search = "") => {
  const params = new URLSearchParams(search);
  const category = params.get("category")?.trim() || "";

  return {
    entityId: category || "shop",
    canonicalPath: category
      ? `/shop?category=${encodeURIComponent(category)}`
      : "/shop",
    // Plain /shop (no category) is always a real, indexable page. A
    // category value only counts as valid when it's a real leaf/parent
    // product-type ID -- must match api/seo-page.js's server-side check.
    isValidCategory: category ? isValidCategoryId(category) : true,
  };
};

// Query params that don't create a distinct, thin/duplicate variant of a
// /shop page: `category` selects the canonical category view itself, and the
// rest are stripped from the canonical URL anyway (see canonicalUrl.js).
const BENIGN_SHOP_PARAMS = new Set([
  "category",
  "page",
  "sort",
  "view",
  "gclid",
  "fbclid",
]);

/**
 * True when /shop has facet/filter params beyond the ones above (e.g.
 * color, size, price range) — combinations of these create combinatorial,
 * largely duplicate content and should be kept out of the index while the
 * canonical /shop and /shop?category=X views stay indexable.
 */
export const hasShopFilterParams = (search = "") => {
  const params = new URLSearchParams(search);
  return [...params.keys()].some((key) => {
    const normalized = key.toLowerCase();
    return !BENIGN_SHOP_PARAMS.has(normalized) && !normalized.startsWith("utm_");
  });
};

