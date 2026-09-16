// Wraps the REAL Super Merch product API (api.supermerch.com.au) so the chat
// agent's tools never invent a price, stock status, or product — every fact
// comes from this live catalog, the same one the storefront itself uses.
//
// Pricing note: the API already applies supplier margin + any discount before
// returning `finalPrice` on each price break, and `pricingSummary.finalMinPrice`
// for the cheapest tier. We always surface those computed fields — we never
// recompute margin/discount math ourselves.

const API_BASE = process.env.SUPERMERCH_API_BASE || "https://api.supermerch.com.au";

async function apiGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Super Merch API ${path} responded ${res.status}`);
  }
  return res.json();
}

// Picks the price_group whose promodata_decoration best matches the visitor's
// requested decoration method (falls back to the cheapest/undecorated group).
function pickPriceGroup(priceGroups, decoration) {
  if (!Array.isArray(priceGroups) || priceGroups.length === 0) return null;
  if (decoration) {
    const needle = decoration.toLowerCase();
    const match = priceGroups.find((g) =>
      (g.promodata_decoration || "").toLowerCase().includes(needle)
    );
    if (match) return match;
  }
  // Prefer an "Unbranded"/undecorated group as the default quote baseline.
  const undecorated = priceGroups.find((g) => g.base_price?.undecorated);
  return undecorated || priceGroups[0];
}

// Finds the highest price break the requested quantity qualifies for, and
// returns the ALREADY-MARGIN-ADJUSTED finalPrice — never the raw supplier price.
function unitPriceAtQty(priceBreaks, qty) {
  if (!Array.isArray(priceBreaks) || priceBreaks.length === 0) return null;
  const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  if (qty < sorted[0].qty) return null; // below the minimum order quantity
  let chosen = sorted[0];
  for (const brk of sorted) {
    if (qty >= brk.qty) chosen = brk;
  }
  return {
    qty_break: chosen.qty,
    unit_price: chosen.finalPrice ?? chosen.price,
  };
}

function toCardShape(rawProduct) {
  const overview = rawProduct.overview || {};
  const pricing = rawProduct.pricingSummary || {};
  const categorisation = rawProduct.product?.categorisation || {};
  return {
    id: rawProduct.meta?.id ?? null, // the numeric id /api/single-product/:id expects
    name: overview.name || rawProduct.product?.name || "Unnamed product",
    // Real bug this fixed: a name-substring search for "pen" also matches
    // "Pen Sample Folder" (category Misc Office), "Pen Presentation Tube"
    // (category Pen Packaging) and "Pen Holder" (Misc Office) — none of them
    // an actual pen. Without this, the model had no way to tell an item from
    // its own packaging/accessory/holder and quoted "Pen Sample Folder" as a
    // giveaway pen. Category is the cheapest real signal to catch that.
    category:
      categorisation.product_type?.type_name ||
      categorisation.promodata_product_type?.type_name ||
      null,
    image: overview.hero_image || rawProduct.product?.images?.[0] || null,
    price: pricing.finalMinPrice ?? null,
    moq: overview.min_qty ?? 0,
    supplier: overview.supplier || null,
    in_stock: rawProduct.meta?.discontinued === false,
  };
}

// filter_products' "category" argument is a free-text word the model took
// straight from the visitor ("pen", "water bottle") — it has no way to know
// the site's real category IDs (e.g. "PY-06"). /api/client-products/category
// takes that word LITERALLY as if it were an ID, which it never is, and
// returns some unrelated fixed-feeling result set regardless of the word —
// confirmed directly: category=pen returned "Pen Sample Folder", "Pen
// Display Box", "Pen Holder" and never a single actual pen, every time.
// Resolve the word against the site's real category list first instead.
let categoryIndexPromise = null;
async function getCategoryIndex() {
  if (!categoryIndexPromise) {
    categoryIndexPromise = apiGet("/api/v1-categories").then((data) => {
      const flat = [];
      for (const top of data.data || []) {
        for (const sub of top.subTypes || []) {
          if (sub.id && sub.name) flat.push({ id: sub.id, name: sub.name });
        }
      }
      return flat;
    });
  }
  return categoryIndexPromise;
}

// Word-overlap match against real category names, e.g. "pen" -> Metal Pens,
// Plastic Pens, Stylus Pens, Other Pens, Wooden Pens, Pen Packaging (all
// contain "pen"). This deliberately does NOT try to exclude the
// non-product ones itself (e.g. "Pen Packaging") — telling "Pen Packaging"
// apart from "Metal Pens" reliably needs the same product-vs-accessory
// judgement call already handled downstream (the system prompt's category
// rule, and extractProducts' name-based card filtering in chat.js). Casting
// a slightly wide net here and letting that existing judgement narrow it is
// simpler and more consistent than duplicating a denylist in two places.
function resolveCategoryIds(categoryQuery, index) {
  const words = categoryQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return [];
  // Confirmed live: an exact \bword\b match on "pen" (singular, matching the
  // tool schema's own example "e.g. hoodie, cap, tote bag, mug, pen") only
  // ever matched "Pen Packaging" — every genuine pen category is named in
  // the PLURAL ("Metal Pens", "Plastic Pens", "Wooden Pens"...), and a
  // word-boundary match on "pen" fails against "Pens" (no boundary between
  // "n" and the trailing "s"). Allow a simple plural/singular difference
  // either way instead. Deliberately NOT open-ended prefix matching — that
  // briefly replaced this check and matched "pen" as a literal prefix of
  // "pencil", pulling pencil-sharpener/pencil-set categories into a plain
  // "pens" search.
  const sameWord = (a, b) =>
    a === b || a === `${b}s` || a === `${b}es` || b === `${a}s` || b === `${a}es`;
  const matches = index.filter((c) => {
    const nameWords = c.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    return words.some((w) => nameWords.some((nw) => sameWord(w, nw)));
  });
  return matches.slice(0, 6).map((c) => c.id);
}

/**
 * Live keyword/category search — the ground truth for "what products exist".
 */
export async function searchProducts({ searchTerm, category, minPrice, maxPrice, limit = 10 }) {
  if (category) {
    const index = await getCategoryIndex();
    const categoryIds = resolveCategoryIds(category, index);

    if (categoryIds.length > 0) {
      // Confirmed live: this used to request the FULL `limit` from every
      // matched category (a stray Math.max meant "at least the full limit"
      // instead of "a fair share"), then concatenate category-by-category
      // before truncating to `limit` — so whichever category came first in
      // `categoryIds` (an arbitrary artifact of JSON iteration order, not
      // relevance) filled the entire result on its own. For "pen", that was
      // "Pen Packaging" — every real pen category's results got silently
      // discarded despite being fetched. Give each category a fair share,
      // and round-robin the merge so truncation can't favour just one.
      const perCategoryLimit = Math.max(2, Math.ceil(limit / categoryIds.length));
      const seenIds = new Set();
      const batches = await Promise.all(
        categoryIds.map((id) =>
          apiGet("/api/client-products", {
            product_type_ids: id,
            min_price: minPrice,
            max_price: maxPrice,
            page: 1,
            limit: perCategoryLimit,
            filter: true,
          }).then((data) => (data.data || []).map(toCardShape))
        )
      );
      const merged = [];
      for (let i = 0; merged.length < limit && batches.some((b) => i < b.length); i++) {
        for (const batch of batches) {
          if (merged.length >= limit) break;
          const card = batch[i];
          if (card && card.id != null && !seenIds.has(card.id)) {
            seenIds.add(card.id);
            merged.push(card);
          }
        }
      }
      return merged;
    }

    // The category word didn't match any real category name at all — fall
    // back to a plain text search on that word rather than the broken
    // literal-category-id endpoint, so this still returns something real.
    const data = await apiGet("/api/client-products/search", {
      searchTerm: category,
      min_price: minPrice,
      max_price: maxPrice,
      page: 1,
      limit,
      filter: true,
    });
    return (data.data || []).map(toCardShape);
  }

  const path = "/api/client-products/search";
  const data = await apiGet(path, {
    searchTerm,
    min_price: minPrice,
    max_price: maxPrice,
    page: 1,
    limit,
    filter: true,
  });
  let results = (data.data || []).map(toCardShape);

  // The live /search endpoint only does literal matching on the WHOLE
  // searchTerm — a natural-language phrase like "office party" or "drinkware
  // mugs" reliably returns zero results even though the individual words
  // within it ("party", "mug") return plenty (confirmed by curling the
  // endpoint directly). search_products exists precisely for descriptive/
  // fuzzy visitor requests, and there's no real semantic/vector search wired
  // up yet (see api/SETUP.md) — so rather than surface a false "nothing
  // found" for any multi-word query, fall back to searching each significant
  // word on its own and merging the results.
  if (searchTerm && results.length === 0 && searchTerm.trim().includes(" ")) {
    const words = searchTerm
      .split(/\s+/)
      .map((w) => w.replace(/[^\w-]/g, ""))
      .filter((w) => w.length > 2);

    const merged = [];
    const seenIds = new Set();
    for (const word of words) {
      if (merged.length >= limit) break;
      const wordData = await apiGet(path, { searchTerm: word, page: 1, limit, filter: true });
      for (const raw of wordData.data || []) {
        const card = toCardShape(raw);
        if (card.id != null && !seenIds.has(card.id)) {
          seenIds.add(card.id);
          merged.push(card);
          if (merged.length >= limit) break;
        }
      }
    }
    results = merged;
  }

  return results;
}

export async function listCategories() {
  const data = await apiGet("/api/v1-categories");
  return (data.data || []).map((c) => ({ id: c.id, name: c.name }));
}

/**
 * Fetches full product detail (needed for get_price_quote — the search/category
 * endpoints only return a pricing SUMMARY, not the full price_groups/price_breaks).
 */
export async function getProductDetail(id) {
  const data = await apiGet(`/api/single-product/${id}`);
  return data.data || null;
}

/**
 * The ONE place price quotes get computed. Always live, always from the API's
 * own margin-adjusted numbers — this is what stops the bot from hallucinating.
 */
export async function getPriceQuote({ id, quantity, decoration }) {
  const product = await getProductDetail(id);
  if (!product) return { error: "Product not found" };

  const priceGroups = product.product?.prices?.price_groups || [];
  const group = pickPriceGroup(priceGroups, decoration);
  if (!group) return { error: "No pricing available for this product" };

  const breaks = group.base_price?.price_breaks || [];
  const result = unitPriceAtQty(breaks, quantity);
  if (!result) {
    const moq = breaks.length ? Math.min(...breaks.map((b) => b.qty)) : null;
    return {
      error: "Quantity is below the minimum order quantity",
      moq,
    };
  }

  return {
    product_id: product.meta?.id ?? null,
    name: product.overview?.name || product.product?.name,
    decoration_used: group.promodata_decoration || "Unbranded",
    quantity_requested: quantity,
    quantity_priced_at: result.qty_break,
    unit_price_aud: result.unit_price,
    total_price_aud: Number((result.unit_price * quantity).toFixed(2)),
    setup_fee_aud: group.base_price?.setup || 0,
    lead_time: group.base_price?.lead_time || "Contact us to confirm",
  };
}
