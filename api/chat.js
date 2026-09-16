// POST /api/chat — Vercel serverless function behind the ChatWidget.
//
// Contract (must match src/components/Chat/ChatWidget.jsx exactly):
//   in:  { query: string, history?: Array<{role, text}> }, header X-Session-Id
//   out: text/event-stream — zero or more `data: {"type":"status","text":"..."}`
//        events while a tool call is in flight (e.g. "Searching our
//        catalog…"), then a run of `data: {"type":"delta","text":"..."}`
//        events as the final answer streams token-by-token, then one
//        `data: {"type":"done", message, items, extras, popular_queries,
//        similar_queries, display_limit}\n\n` with the complete payload.
//   (Validation errors on the request itself still return plain JSON, since
//   those happen before any streaming starts.)

import { runAgent, FALLBACK_CONTACT_LINE } from "./lib/agent.js";
import { DEFAULT_POPULAR_QUERIES } from "./lib/tools.js";

const MAX_QUERY_LENGTH = 500;
const MAX_HISTORY_TURNS = 8; // trims what the client sends, if it sends more

function extractProducts(toolCalls, replyText) {
  const searchCalls = toolCalls.filter((c) => c.name === "filter_products" || c.name === "search_products");
  if (searchCalls.length === 0) return [];
  const normalizedReply = (replyText || "").toLowerCase();

  const scoreCall = (call) => {
    const products = call.output?.products || [];
    const named = products.filter((p) => p.name && normalizedReply.includes(p.name.toLowerCase()));
    return { call, products, named, score: named.length };
  };

  // More than one search can happen in a turn — e.g. a plain search followed
  // by a narrower fallback for a different angle of the same question.
  // Blindly using the LAST call's results broke down exactly like that:
  // "candle" then "eco-friendly candle" (the second only matching unrelated
  // eco-friendly bags), reply text about the candles, product cards showing
  // the bags. Score each call by how many of ITS products are actually named
  // in the final reply, and use whichever call the reply is actually about —
  // falling back to the last call only when no call's products are named at
  // all (the model paraphrased rather than quoting names).
  const scored = searchCalls.map(scoreCall);
  const maxScore = Math.max(...scored.map((s) => s.score));
  const winner = maxScore > 0 ? scored.find((s) => s.score === maxScore) : scored[scored.length - 1];

  // Within the winning call, only show cards for products the reply actually
  // names — never fall back to the raw unfiltered list. Real bug this fixed
  // (confirmed live twice): a "pens"/"water bottle" search also returns
  // packaging/accessories for that item (a "Pen Presentation Tube", a "Drink
  // Bottle Gift Tube") — the model correctly declines to recommend those,
  // but a $/table-based fallback here still showed every raw result
  // whenever the reply merely MENTIONED a dollar figure — including the
  // visitor's own stated budget ("pens under $20") with zero products
  // actually named, which still displayed all 10 accessories the model had
  // just explicitly said were not real pens. A card for a product the model
  // never recommended is worse than no card at all — if nothing is named,
  // show nothing.
  return winner.named;
}

function toWidgetItem(p) {
  return {
    id: p.id,
    name: p.name,
    image: p.image,
    price: p.price,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sessionId = req.headers["x-session-id"] || null;
  const { query, history } = req.body || {};

  if (typeof query !== "string" || !query.trim()) {
    res.status(400).json({ error: "query is required" });
    return;
  }
  const trimmedQuery = query.slice(0, MAX_QUERY_LENGTH);

  // The widget's own `history` array is display state (role/text/items/...),
  // not Anthropic message format — only forward the last few turns as plain
  // role/content pairs so the model has short-term context, nothing more.
  const trimmedHistory = Array.isArray(history)
    ? history
        .slice(-MAX_HISTORY_TURNS)
        .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.text === "string")
        .map((h) => ({ role: h.role, content: h.text }))
    : [];

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const { reply, toolCalls, hitLimit } = await runAgent({
      userMessage: trimmedQuery,
      history: trimmedHistory,
      sessionId,
      onDelta: (text) => sendEvent({ type: "delta", text }),
      onStatus: (text) => sendEvent({ type: "status", text }),
    });

    const products = extractProducts(toolCalls, reply);
    const items = products.slice(0, 20).map(toWidgetItem);

    sendEvent({
      type: "done",
      message: reply || `Sorry, I couldn't come up with a reply for that. ${FALLBACK_CONTACT_LINE}`,
      items,
      extras: [],
      popular_queries: items.length === 0 ? DEFAULT_POPULAR_QUERIES : [],
      similar_queries: [],
      display_limit: 10,
      hit_limit: hitLimit || undefined,
    });
  } catch (err) {
    console.error("chat agent error:", err);
    sendEvent({
      type: "done",
      message: `Sorry, something went wrong on our end. Please try again. ${FALLBACK_CONTACT_LINE}`,
      items: [],
      extras: [],
      popular_queries: DEFAULT_POPULAR_QUERIES,
      similar_queries: [],
      display_limit: 10,
    });
  } finally {
    res.end();
  }
}
