// The bot's "hands" — real implementations behind each tool schema in agent.js.
// Every product fact returned here comes from the live Super Merch catalog API
// (see catalogApi.js); nothing is invented, cached, or guessed.

import * as catalogApi from "./catalogApi.js";
import { submitLead } from "./contactApi.js";
import { sendLeadNotification } from "./email.js";

export const DEFAULT_POPULAR_QUERIES = [
  "pen",
  "water bottle",
  "tote bag",
  "hoodie",
  "notebook",
  "mug",
  "keyring",
  "usb drive",
];

// Real bug this fixed: asking "show me more options" after a recommendation
// returned the SAME products again — the underlying catalog search is
// deterministic (same query -> same top results, every time), so simply
// relying on the model to notice and avoid repeating its own earlier picks
// wasn't reliable. `excludeIds` carries every product id already shown
// earlier in this conversation (see chat.js) and is mechanically filtered
// out here — a guarantee independent of the model's own judgement, the same
// way MAX_QUOTES_PER_TURN is enforced in code rather than left to the prompt.
function withoutPreviouslyShown(products, excludeIds) {
  if (!excludeIds || excludeIds.length === 0) return { products, excludedCount: 0 };
  const exclude = new Set(excludeIds);
  const filtered = products.filter((p) => !exclude.has(p.id));
  return { products: filtered, excludedCount: products.length - filtered.length };
}

async function filter_products({ category, quantity, max_unit_price, decoration, colour, in_stock_only, limit = 10 }, { excludeIds } = {}) {
  // Real fix: `colour` used to be accepted here and then silently dropped —
  // the live API's own `colors[]` filter genuinely works (confirmed by
  // curling it directly), it just was never wired through. `decoration`
  // still can't be filtered this way — decoration/pricing only exists per
  // price_group on the full product detail, not on the search result shape.
  // `limit` used to be hardcoded to 10 with no way for the model to ask for
  // more on a "show me more options" follow-up (see withoutPreviouslyShown).
  //
  // Real bug this fixed: with a `quantity` given, the live catalog's default
  // sort order frequently front-loads high-MOQ premium variants (confirmed
  // live — "Drink Bottles" at the default `limit` of 10 returned 10 products
  // in a row with MOQ 100-500, even though 73 of the category's first 100
  // products have MOQ<=50). Filtering by quantity AFTER truncating to
  // `limit` meant the MOQ filter had nothing to find in that unlucky batch
  // and a genuinely well-stocked category came back looking completely
  // empty. Fetch a much larger raw pool whenever quantity is a real
  // constraint, so the filter below has enough candidates to actually find
  // matches in, then slice back down to the requested `limit` for display.
  const fetchLimit = quantity ? Math.max(limit, 40) : limit;
  const results = await catalogApi.searchProducts({
    category,
    minPrice: null,
    maxPrice: max_unit_price,
    colour,
    limit: fetchLimit,
  });
  let filtered = results;
  if (quantity) filtered = filtered.filter((p) => quantity >= (p.moq || 0));
  if (in_stock_only) filtered = filtered.filter((p) => p.in_stock);
  filtered = filtered.slice(0, limit);
  const { products: deduped, excludedCount } = withoutPreviouslyShown(filtered, excludeIds);
  const notes = [];
  if (decoration) notes.push("Decoration availability must be confirmed per-product via get_price_quote; this list is filtered on category/quantity/price/colour only.");
  if (excludedCount > 0) notes.push(`${excludedCount} product(s) already shown earlier in this conversation were excluded — call again with a larger top_k/limit if you need more.`);
  return { count: deduped.length, products: deduped, note: notes.length ? notes.join(" ") : undefined };
}

async function search_products({ query, top_k = 6, colour }, { excludeIds } = {}) {
  const results = await catalogApi.searchProducts({ searchTerm: query, colour, limit: top_k });
  const { products: deduped, excludedCount } = withoutPreviouslyShown(results, excludeIds);
  return {
    count: deduped.length,
    products: deduped,
    note: excludedCount > 0
      ? `${excludedCount} product(s) already shown earlier in this conversation were excluded — call again with a larger top_k if you need more.`
      : undefined,
  };
}

async function get_price_quote({ product_id, quantity, decoration }) {
  if (!product_id || !quantity) {
    return { error: "product_id and quantity are required" };
  }
  return catalogApi.getPriceQuote({ id: product_id, quantity, decoration });
}

async function capture_lead(input) {
  if (!input.name || !input.email || !input.phone) {
    return { error: "name, email, and phone are all required before capturing a lead" };
  }
  const { id } = await submitLead(input);
  // Best-effort: the lead is already safely saved via submitLead above, so an
  // email hiccup shouldn't turn a successful capture into a tool error.
  await sendLeadNotification(input).catch((err) =>
    console.error("Lead notification email failed (lead still saved):", err)
  );
  return {
    confirmed: true,
    reference: id,
    message: "Saved — the Super Merch team will follow up.",
  };
}

export async function runTool(name, input, context = {}) {
  // Any tool can throw on a bad day — the live catalog API returning a 404
  // for a product id that no longer exists (or was never real, e.g. the
  // model guessing an id for something outside the catalog), a network
  // blip, a 500. Uncaught, that exception used to propagate all the way up
  // through Promise.all in agent.js and take down the ENTIRE turn — the
  // visitor got the generic "something went wrong" fallback instead of a
  // real answer, even when only ONE of several tool calls that round
  // actually failed. Converting it into a normal {error} result here lets
  // the model react to it per its own instructions (say so, offer to
  // adjust the brief) instead of losing the whole response.
  try {
    switch (name) {
      case "filter_products":
        return await filter_products(input, context);
      case "search_products":
        return await search_products(input, context);
      case "get_price_quote":
        return await get_price_quote(input);
      case "capture_lead":
        return await capture_lead(input);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error(`Tool "${name}" threw:`, err);
    return { error: `Couldn't complete that lookup right now (${err.message || "unknown error"}). Try a different product, or let the visitor know you'll need to check with the team.` };
  }
}
