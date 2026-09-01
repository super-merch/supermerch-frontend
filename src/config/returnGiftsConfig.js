// Return Gifts page (/return-gifts) product source configuration.
//
// Previously this page was driven by a hardcoded free-text keyword search
// (["gift pack", "HAM10"] in one place, a different and much broader list in
// another - see git history) matched against product name/sku/code. That
// missed most of the real "Home & Living > Hampers" (promodata type_id
// "PM-17") catalogue and, when widened, pulled in hundreds of unrelated
// products site-wide.
//
// This id points at the SubCategory document that ALREADY backs the
// "Home & Living > Hampers" page (supermerch-backend/models/SubCategory.js,
// `_promodataTypeId: "PM-17"`, slug "hampers"). Passing a SubCategory
// ObjectId as `product_type_ids` to GET /api/params-products (see
// utils/getAllV2Products.js) resolves to a direct match against
// `product.categorisation.promodata_product_type.type_id` - the same
// mechanism every other product-type/subcategory listing page already uses.
// Verified live: resolves to exactly the 48 Hampers products.
//
// No new SubCategory was created for this - the existing "Hampers" doc is
// reused as-is, so this stays admin-manageable via the existing Hampers
// SubCategory screen (isActive, productMatchRules, etc). Only the *choice*
// of which SubCategory backs this bespoke top-level route is hardcoded
// here, since /return-gifts is a standalone page rather than a generic
// nav-driven category page.
export const RETURN_GIFTS_SUBCATEGORY_ID = "69cce4bccc7e3e5a4986000c";
