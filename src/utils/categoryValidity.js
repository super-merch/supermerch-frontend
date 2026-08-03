import categoryData from "../../scripts/category-finder/authoritative-category-ids.json" with { type: "json" };

// Single source of truth for "is this a real leaf/parent category ID",
// shared by the client (src/utils/shopSeo.js, RouteSeo.jsx) and the
// api/seo-page.js serverless function, so both sides can never drift out of
// sync on which /shop?category=X values are indexable/self-canonical.
// Browser-compatible: no node:fs or other server-only APIs, since this file
// is bundled into the client as well.
const { leaves = [], parents = [] } = categoryData;

export const VALID_CATEGORY_IDS = new Set(
  [...leaves, ...parents].map((item) => item.id),
);

export const isValidCategoryId = (categoryId) =>
  Boolean(categoryId) && VALID_CATEGORY_IDS.has(categoryId);
