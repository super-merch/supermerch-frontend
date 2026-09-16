// Merch Mate — the agent loop, calling OpenAI directly (switched from
// NVIDIA's hosted free/shared tier, whose rate limits and reliability
// glitches this file spent a long time working around — see the retry/
// sanitization logic below, still kept as defensive belt-and-braces since a
// stronger model reduces but doesn't guarantee zero decoding glitches).
// OpenAI-style function calling — the loop shape is the same perceive ->
// reason -> act -> observe regardless of provider, just a different wire
// format from Anthropic's tool_use blocks.

import OpenAI from "openai";
import { runTool } from "./tools.js";

// A visitor hitting any fallback path (round limit, empty reply, thrown
// error) previously got a dead end — "let me get a human" with no way to
// actually reach one right now. Same phone/email the site's own footer and
// Contact page use everywhere else (Footer.jsx, CallUs.jsx) — give the
// visitor something they can act on immediately instead of just waiting.
export const FALLBACK_CONTACT_LINE =
  "In the meantime you can reach our team directly on +61 466 468 528 or Info@supermerch.com.au.";

// gpt-4o-mini — solid tool-calling support at low cost/latency. Override
// with OPENAI_MODEL if a stronger model (e.g. gpt-4o) is wanted instead.
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Constructed lazily (not at module load) so a missing OPENAI_API_KEY surfaces
// as a normal per-request error api/chat.js can catch, instead of crashing
// the whole serverless function at cold start — the OpenAI SDK throws
// synchronously in its constructor when no key is present.
// A short timeout so a hung connection fails fast into our own retry/backoff
// below, instead of sitting on the SDK's default (which surfaced as a
// straight-up 300-second stream stall during testing, with no retry
// possible until it finally gave up).
const REQUEST_TIMEOUT_MS = 30_000;

let client = null;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: REQUEST_TIMEOUT_MS });
  }
  return client;
}

export const SYSTEM_PROMPT = `
You are "Merch Mate", the AI assistant on the Super Merch website (supermerch.com.au).
Super Merch sells custom-branded merchandise and promotional products (apparel,
drinkware, bags, stationery) to Australian businesses, clubs and events.

YOUR JOB (V1):
- Help visitors find the right products and recommend options.
- Answer questions about products, decoration methods, minimums and lead times.
- Quote prices at the quantity the visitor wants.
- Scope an enquiry (quantity, sizes, colours, decoration, deadline) and, when the
  visitor is ready, capture it as a lead for the human team.

HOW YOU MUST WORK — READ CAREFULLY:
1. NEVER state a price, stock status, minimum, or lead time from memory. These
   ALWAYS come from a tool result. If you have not called a tool for it, you do
   not know it. Say you'll check, then call the tool.
2. Use "filter_products" when the visitor gives hard constraints (a category, a
   quantity, a budget). Use "search_products" for descriptive/fuzzy requests
   ("premium", "eco-friendly", "something for a winter gift"). You may use both.
3. Use "get_price_quote" whenever the visitor asks "how much" for a SPECIFIC
   product at a SPECIFIC quantity — filter/search results only show an
   indicative starting price, not a real quote at their quantity.
4. If a tool returns nothing, say so plainly and offer to adjust the brief
   (higher budget, different product) — never invent a product.
4b. Every product a tool returns has a "category" field — check it against
    what the visitor actually asked for before recommending or quoting.
    A category search can still turn up an adjacent-but-different product
    (e.g. "Pen Packaging" alongside "Metal Pens" for a "pens" request) —
    none of those are what the visitor asked for. Silently skip any result
    whose category doesn't genuinely match the product type requested, the
    same way a human salesperson would — don't mention that you filtered
    them out, just don't offer or quote them. Filter from the results you
    already have — do NOT call search_products/filter_products again just to
    try to avoid a category mismatch; one extra call rarely gets a cleaner
    result set and it burns a round you need for get_price_quote. If
    filtering leaves you with too few genuine matches from one call, say so
    and ask a follow-up rather than searching repeatedly.
5. STOP searching once you have decent results. For a vague brief ("something
   for an office party", "a nice gift"), ONE search_products call is usually
   enough — present those results and ask a follow-up question to narrow it
   down, rather than firing off several more searches with different wording
   to try to find a "better" match before replying. You have a limited number
   of tool calls per turn; running out without ever replying is a worse
   outcome for the visitor than replying with a decent first set of results.
6. Quote AT MOST 3 products in one turn, even if a search returned more —
   pick the 3 most relevant. If you do need get_price_quote for more than
   one product, call it for all of them in the SAME response (multiple tool
   calls at once) rather than one call, waiting for the result, then deciding
   to call it again for the next product — each round trip is slow, and you
   have a limited number of them per turn. Running out of turns while still
   quoting the 5th product is a worse outcome than answering well with 3.

GUARDRAILS:
- Stay on Super Merch topics. Politely decline unrelated requests.
- Do not promise delivery dates, discounts, or artwork approvals — those are for
  the human team. You may state the lead time a tool returned as a guide.
- Never ask for payment details. This is an enquiry assistant, not a checkout.
- Collect only what you need for the enquiry (privacy: keep it minimal).
- NEVER mention a tool by its internal name (get_price_quote, search_products,
  filter_products, capture_lead) or describe your own mechanics ("I'll need to
  call...", "let me run a search") to the visitor — they're implementation
  details, not something a real salesperson would ever say out loud. Just do
  it and talk about the outcome: "Let me check the exact price for that" or
  "One sec, checking stock" instead.

HANDOFF — call "capture_lead" when ANY of these happen:
- The visitor is ready to proceed, get a formal quote, or place an order.
- The visitor explicitly asks for a human, a call, or an email follow-up.
- You are stuck, the request is out of scope, or they seem frustrated.
Before calling it, make sure you have their NAME, EMAIL, AND PHONE (all three are
required — not any one of them) plus a short summary of what they want. If you're
missing any of these, ask for them together in one message before calling the tool.

TONE: warm, concise, practical. Australian business-friendly. No emojis unless
the visitor uses them. Short paragraphs. Don't overwhelm with options — 2 to 3
good recommendations beat a long list.
`.trim();

// OpenAI-style function schemas (NVIDIA's endpoint follows the same shape).
export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "filter_products",
      description:
        "Exact product search on hard constraints: category, quantity, and/or a per-unit budget. Returns real products from the live catalog with an indicative starting price and MOQ. Empty list if nothing qualifies.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "e.g. hoodie, cap, tote bag, mug, pen" },
          quantity: { type: "integer", description: "number of units the visitor wants" },
          max_unit_price: { type: "number", description: "budget per unit in AUD" },
          decoration: { type: "string", description: "e.g. embroidery, screen print, laser engraving" },
          colour: { type: "string" },
          in_stock_only: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Meaning-based product search for fuzzy/descriptive requests, e.g. 'premium and warm', 'eco-friendly gift'. Returns products ranked by relevance from the live catalog.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "the visitor's descriptive request in natural language" },
          top_k: { type: "integer", description: "how many results to return (default 6)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_price_quote",
      description:
        "Get the REAL, current unit price and total for one specific product at a specific quantity, using the product_id from a prior filter_products/search_products result. Always call this before quoting a firm number.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "integer", description: "the id field from a filter_products/search_products result" },
          quantity: { type: "integer" },
          decoration: { type: "string", description: "requested decoration method, if any" },
        },
        required: ["product_id", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Hand off to the human Super Merch team by saving the enquiry as a query (same place the site's own Contact Us form saves to). Call when the visitor is ready to proceed, wants a formal quote, asks for a human, or when you cannot help. The backend requires name, email, AND phone — all three, not just one.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          summary: { type: "string", description: "what the visitor wants: products, quantity, decoration, deadline" },
          reason: { type: "string", description: "why we're handing off, e.g. 'ready for quote', 'asked for human'" },
        },
        required: ["name", "email", "phone", "summary", "reason"],
      },
    },
  },
];

// NVIDIA's free/shared tier occasionally reports a large model as temporarily
// unavailable — observed as a 400 with body {"detail":"...DEGRADED function
// cannot be invoked"} (confirmed by curling the endpoint directly), on top of
// the more usual 429/503 "busy" responses supermerch-poc/server.js already
// retried on. Same backoff shape as that proxy, just widened to cover this.
const RETRYABLE_STATUSES = new Set([400, 429, 500, 503]);
const MAX_ATTEMPTS = 4;

// gpt-4o-mini doesn't have the "thinking"-mode latency/leak problems the
// NVIDIA nemotron model had (no chat_template_kwargs needed) — but the
// think-leak stripper below is left in place as a harmless no-op safety net
// rather than removed, on the chance a future model swap reintroduces it.

// With thinking disabled, tool-planning rounds occasionally still leak a
// fragment of chain-of-thought into `content` itself (not the
// `reasoning_content` field, which is genuinely empty) — confirmed by
// curling the endpoint directly: `content` came back as a sentence of
// reasoning ending in a literal "</think>" tag, with no matching opening tag
// (the template appears to start every response "inside" a think block and
// only sometimes remembers to close it before answering). Since we stream
// `content` straight to the chat bubble, an unfiltered leak would show the
// visitor a stray sentence of the model's internal planning. This buffers
// just enough of the start of each round to catch and strip that leak
// without adding a noticeable delay — plain replies (the common case) never
// contain "</think>" and flush after one round-trip's worth of characters.
function createThinkLeakFilter() {
  const MAX_BUFFER = 250; // margin over the ~140-char leak observed
  const CLOSE_TAG = "</think>";
  let buffer = "";
  let resolved = false;

  function resolveFrom(text) {
    resolved = true;
    buffer = "";
    return text;
  }

  return {
    // Feed one content delta; returns the text (if any) now safe to show.
    feed(chunk) {
      if (resolved) return chunk;
      buffer += chunk;
      const closeIdx = buffer.indexOf(CLOSE_TAG);
      if (closeIdx !== -1) {
        return resolveFrom(buffer.slice(closeIdx + CLOSE_TAG.length).replace(/^\s+/, ""));
      }
      if (buffer.length >= MAX_BUFFER) {
        return resolveFrom(buffer); // no leak within the margin — switch to plain passthrough
      }
      return ""; // still buffering — nothing safe to emit yet
    },
    // Call once the stream ends: a reply shorter than MAX_BUFFER never hits
    // the passthrough threshold above and would otherwise sit in the buffer
    // forever, silently dropped — this releases it (verified clean, since no
    // "</think>" ever appeared).
    flush() {
      if (resolved) return "";
      return resolveFrom(buffer);
    },
  };
}

// A second decoding glitch observed with thinking disabled (distinct from
// the truncated-fragment one above): the model sometimes emits the SAME
// opening sentence 2-3 times in a row as separate paragraphs before finally
// continuing into the real answer — e.g. "Here are a few notebook options
// we have in stock:" repeated three times, each as its own paragraph, ahead
// of the actual product list. It's not short (so the length check above
// misses it) and every character is individually valid, so this checks for
// duplicate paragraphs instead.
function hasRepeatedParagraph(text) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15); // skip short/blank fragments — not what we're guarding against
  const seen = new Set();
  for (const p of paragraphs) {
    if (seen.has(p)) return true;
    seen.add(p);
  }
  return false;
}

// A third decoding glitch, distinct from both above: the model loops on a
// short chunk WITHIN a single unbroken span instead of repeating a whole
// paragraph — observed directly: "Greatells up" followed by "ells" repeated
// back-to-back dozens of times. hasRepeatedParagraph never sees this (it's
// one paragraph, not a duplicate of another one) and it isn't short, so
// neither existing guard catches it. Any 1-20 char chunk repeating 5+ times
// consecutively is never legitimate prose — real repeated phrases (e.g. "no
// no no") don't chain identical substrings back-to-back at this length/count.
//
// Caught in testing: a plain regex here also flags legitimate markdown table
// syntax ("|---|---|", "======") — a table divider legitimately repeats a
// short punctuation run. Only flag a repeat that contains an actual letter
// or digit; real decoding degeneration always loops on a word-ish chunk,
// never pure symbols.
function hasDegenerateRepetition(text) {
  const match = text.match(/(.{1,20}?)\1{4,}/s);
  return !!match && /[a-zA-Z0-9]/.test(match[1]);
}

// A fourth decoding glitch — total noise, not a repeating pattern at all.
// Observed directly on "can you do same day delivery on 500 caps?": a reply
// that was 232 non-space characters of which 146 were bare commas, plus
// scattered stray punctuation/unicode fragments ("bar,", "ु", "β") and almost
// no real words. hasDegenerateRepetition doesn't catch this — nothing in it
// repeats consistently, it's just diffuse garbage. Real prose (checked
// against every reply collected in testing, including the heaviest
// multi-column markdown price tables) never drops below ~0.74 real
// (ASCII a-z/A-Z) letters per non-space character; this reply measured 0.21.
// 0.4 leaves comfortable margin below every legitimate case observed while
// still well above the observed glitch. Skipped for very short content —
// the length guard above already covers that case.
function hasGibberishNoise(text) {
  const nonWs = text.replace(/\s+/g, "");
  if (nonWs.length < 30) return false;
  const letters = (nonWs.match(/[a-zA-Z]/g) || []).length;
  return letters / nonWs.length < 0.4;
}

// Reads one completion via the streaming API (still requested with
// stream:true — that's what lets us validate a full round before deciding
// whether to show or retry it, see below) and returns the reassembled
// message (content + tool_calls). `onDelta` fires once per round with that
// round's full validated content — real per-token streaming was traded away
// in favour of never showing a broken reply (see the length check below).
// Tool-calling rounds naturally produce no content (the model emits
// tool_calls instead), so in practice onDelta only ever fires with
// something on the round that has the real answer.
async function callLLM(messages, onDelta, { toolChoice = "auto" } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // The SDK's own `timeout` option (set on the client) didn't catch this in
    // testing — a stream that stalls mid-response after starting normally
    // hit undici's 300-second default body timeout instead, waiting the full
    // 5 minutes before erroring. An explicit AbortController enforces a hard
    // cutoff regardless of how the stall happens.
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const stream = await getClient().chat.completions.create(
        {
          model: MODEL,
          messages,
          tools: TOOL_SCHEMAS,
          tool_choice: toolChoice,
          temperature: 0.3,
          stream: true,
        },
        { signal: controller.signal }
      );

      let content = "";
      const toolCallsAcc = [];
      const stripThinkLeak = createThinkLeakFilter();

      // Buffered locally rather than forwarded live through onDelta: with
      // thinking disabled this model occasionally cuts a "final answer"
      // round short after a stray reasoning fragment (observed: the entire
      // reply coming back as just "\nLet's\n", no tool calls, no real
      // content — a decoding glitch, not a valid short answer). Streaming
      // that straight to the chat bubble would show the visitor garbage
      // with no way to take it back once a retry produces the real answer.
      // Buffering the whole round and validating it below costs the round's
      // generation time up front (now a couple of seconds, not the 30s+ it
      // was with thinking on) in exchange for never showing a broken reply.
      let finishReason = null;
      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finishReason = choice.finish_reason;
        const delta = choice?.delta;
        if (!delta) continue;

        if (delta.content) {
          const visible = stripThinkLeak.feed(delta.content);
          if (visible) content += visible;
        }

        if (delta.tool_calls) {
          for (const tcDelta of delta.tool_calls) {
            const idx = tcDelta.index ?? 0;
            if (!toolCallsAcc[idx]) {
              toolCallsAcc[idx] = { id: tcDelta.id, type: "function", function: { name: "", arguments: "" } };
            }
            if (tcDelta.id) toolCallsAcc[idx].id = tcDelta.id;
            if (tcDelta.function?.name) toolCallsAcc[idx].function.name += tcDelta.function.name;
            if (tcDelta.function?.arguments) toolCallsAcc[idx].function.arguments += tcDelta.function.arguments;
          }
        }
      }

      content += stripThinkLeak.flush();

      // Observed with tool_choice forced to "none" on the final step (see
      // below): the model still occasionally tries to emit a tool call as
      // literal text instead of real content — a "<tool_call>" tag, or a
      // full "<function=get_price_quote><parameter>...</parameter></function>"
      // block, sometimes alongside perfectly good surrounding prose ("All
      // three pens have a MOQ of 250... <tool_call><function=get_price_quote>
      // ..."). Retrying used to be the answer for a bad reply, but retrying
      // THIS doesn't help — forced into the same tool_choice:"none" corner
      // again, the model reliably reproduces the same stuck pattern, so it
      // just burns every attempt and throws (confirmed live: 3 of 4 turns
      // failed completely this way once the leak check below was retry-only
      // instead of sanitizing). Strip the leaked tool-call syntax out and
      // keep whatever real prose surrounds it, rather than discarding the
      // whole reply over a fragment the visitor was never going to see
      // anyway (tool_choice:"none" means it can't actually run either way).
      content = content
        .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "")
        .replace(/<tool_call>[\s\S]*$/gi, "")
        .replace(/<function=[^>]*>[\s\S]*?<\/function>/gi, "")
        .trim();
      // A tool name can still surface in plain prose ("Let me try
      // search_products for that") even with no XML-ish wrapper — swap it
      // for a natural phrase rather than rejecting a reply that's otherwise
      // fine.
      const TOOL_NAME_PHRASES = {
        get_price_quote: "get a price quote",
        search_products: "search the catalog",
        filter_products: "filter the catalog",
        capture_lead: "pass this to our team",
      };
      for (const [name, phrase] of Object.entries(TOOL_NAME_PHRASES)) {
        content = content.replace(new RegExp(`\\b${name}\\b`, "gi"), phrase);
      }

      const toolCalls = toolCallsAcc.filter(Boolean);

      // A "final answer" (no tool calls) shorter than this is almost
      // certainly the truncated-fragment glitch above, not a genuine short
      // reply — the system prompt asks for at least a couple of sentences.
      // A repeated paragraph is the other known glitch. Retry the round
      // rather than hand the visitor a broken or repetitive message.
      if (toolCalls.length === 0 && content.trim().length < 20) {
        throw Object.assign(new Error(`Suspiciously short final answer: ${JSON.stringify(content)}`), {
          status: 503,
        });
      }
      // The API's own token-limit signal, when it fires — cheap to check,
      // correct whenever it does. But observed truncations didn't always
      // set this (finish_reason came back "stop" even for a reply cut off
      // mid-answer), so it's a backstop, not the primary defence below.
      if (toolCalls.length === 0 && finishReason === "length") {
        throw Object.assign(new Error(`Cut off by token limit: ${JSON.stringify(content.slice(0, 200))}`), {
          status: 503,
        });
      }
      // A genuine final answer never legitimately ends on a bare heading —
      // "**Pumpkin Shape Candles - 10 units:**" with nothing after it means
      // generation stopped mid-answer, right after naming what it was about
      // to quote, before ever stating the price (observed directly: a real
      // reply from this exact model, four price-quote tool calls completed
      // successfully, then the final round trailed off at exactly this
      // point). A properly finished reply never ends on a trailing colon.
      if (toolCalls.length === 0 && /:\**\s*$/.test(content.trim())) {
        throw Object.assign(new Error(`Trails off after a heading, no content followed: ${JSON.stringify(content.slice(-100))}`), {
          status: 503,
        });
      }
      if (toolCalls.length === 0 && hasRepeatedParagraph(content)) {
        throw Object.assign(new Error(`Repeated-paragraph glitch: ${JSON.stringify(content.slice(0, 200))}`), {
          status: 503,
        });
      }
      if (toolCalls.length === 0 && hasDegenerateRepetition(content)) {
        throw Object.assign(new Error(`Degenerate token-repetition glitch: ${JSON.stringify(content.slice(0, 200))}`), {
          status: 503,
        });
      }
      if (toolCalls.length === 0 && hasGibberishNoise(content)) {
        throw Object.assign(new Error(`Gibberish-noise glitch: ${JSON.stringify(content.slice(0, 200))}`), {
          status: 503,
        });
      }
      // A leaked tool name/tool-call block is now sanitized out above rather
      // than rejected here — retrying doesn't help when tool_choice:"none"
      // is what's causing the model to want to fake a tool call in the
      // first place (see the sanitization comment above for what broke).

      // Only ever show content from the round that has NO tool calls — the
      // real final answer. This model frequently narrates a preamble
      // ("Here are a few notebook options from our catalog:") on rounds
      // that go on to call another tool, and if that turn takes several
      // such rounds before actually finishing, forwarding each one's
      // narration produces a run of near-duplicate bubbles ahead of the
      // real answer (reproduced directly: 3 near-identical "Here are a few
      // notebook options..." bubbles from 3 separate search/filter rounds).
      // Tool-round narration is internal monologue, not the answer — drop it.
      if (content && toolCalls.length === 0) onDelta?.(content);

      return {
        message: {
          role: "assistant",
          content: content || null,
          tool_calls: toolCalls.length ? toolCalls : undefined,
        },
      };
    } catch (err) {
      lastErr = err;
      // A timeout/connection drop has no HTTP status at all (err.status is
      // undefined) — that's exactly the kind of transient hiccup we want to
      // retry too, not just the documented status codes above.
      const isRetryable = err.status === undefined || RETRYABLE_STATUSES.has(err.status);
      if (!isRetryable || attempt === MAX_ATTEMPTS) throw err;
      const wait = 800 * attempt; // 0.8s, 1.6s, 2.4s
      console.warn(`OpenAI upstream ${err.status ?? err.name ?? "error"} — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    } finally {
      clearTimeout(abortTimer);
    }
  }
  throw lastErr;
}

// Shown to the visitor while a tool call is in flight, so the widget has
// something to say during the (silent, non-streamed) tool-calling rounds
// instead of just sitting on a generic "typing" indicator.
const TOOL_STATUS_LABELS = {
  filter_products: "Searching our catalog…",
  search_products: "Searching our catalog…",
  get_price_quote: "Calculating pricing…",
  capture_lead: "Passing this to our team…",
};

// The system prompt asks the model to quote at most 3 products per turn and
// to batch multiple get_price_quote calls into one round — testing showed it
// reliably ignores both asks, quoting products one at a time, one per round,
// until it runs out of turns without ever answering (confirmed by tracing
// the actual round sequence: 9 straight get_price_quote calls, one per
// round, for a 10-product comparison). A prompt is a request; this is the
// enforcement. Once the cap is hit, further get_price_quote calls get an
// error result instead of a real one — that's the one channel the model
// reliably reacts to — pushing it to answer with what it already has.
const MAX_QUOTES_PER_TURN = 3;

// The forced-final-answer step (see isLastStep below) can still fail every
// retry — observed live: the model gets stuck trying to fake a tool call it
// isn't allowed to run, and retrying just reproduces the same stuck output
// since nothing about the situation changed. At that point the LLM genuinely
// cannot produce usable prose — but real tool results are very likely
// already sitting in `toolCalls` from earlier rounds (a completed
// get_price_quote, a product search). Build a real answer directly from
// that instead of surfacing the generic "something went wrong" with nothing
// to show for the round-trips that DID succeed.
function synthesizeFallbackReply(toolCalls) {
  const quotes = toolCalls
    .filter((tc) => tc.name === "get_price_quote" && tc.output && !tc.output.error)
    .map((tc) => tc.output);
  if (quotes.length > 0) {
    const lines = quotes.map(
      (q) => `- **${q.name}**: $${q.unit_price_aud}/unit at ${q.quantity_priced_at} units ($${q.total_price_aud} total)`
    );
    return (
      `Here's what I found for you:\n\n${lines.join("\n")}\n\n` +
      `Let me know if you'd like more options, or to move ahead with one of these. ${FALLBACK_CONTACT_LINE}`
    );
  }

  // This bypasses the LLM's own (imperfect but present) category judgement
  // entirely, so it needs its own filter — confirmed live: an unfiltered
  // dump here listed six results that were ALL "Pen Packaging" (a tin, a
  // case, a pouch, a sleeve — real category on every one), the same
  // accessory-leak bug this whole session has been fixing elsewhere, just
  // reappearing in this one code path that has no LLM judgement in the loop.
  const ACCESSORY_CATEGORY_PATTERN = /packaging|holder|folder|\bbox\b|tube|\bcase\b|\btool/i;
  // Also confirmed live: search_products("branded pens") returned a
  // "Branded Silicone Wristband", chocolates, a massage ball — the
  // underlying catalog search splits a multi-word query and merges each
  // word's matches, so a generic marketing adjective like "branded" (used
  // across nearly the whole catalog) drags in totally unrelated products
  // once "pens" itself under-matches. Require the product's own name to
  // contain one of the query's more specific words, ignoring the generic
  // ones, whenever there's a real query to check against.
  const STOPWORDS = new Set([
    "branded", "promotional", "custom", "personalised", "personalized",
    "quality", "premium", "cheap", "affordable", "bulk", "corporate",
  ]);
  // Also confirmed live: a query of "100 branded pens" left "100" as a
  // surviving "meaningful" word (3 chars, not a stopword), which then
  // matched anything with "100" in its name — "100% Cotton Carolina
  // Convention Tote", "100% Recycled Earth Friendly Fabric". A bare number
  // is a quantity, never a product-identifying word.
  const meaningfulWords = (text) =>
    (text || "")
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

  const searchResults = toolCalls
    .filter((tc) => (tc.name === "search_products" || tc.name === "filter_products") && tc.output?.products?.length)
    .flatMap((tc) => {
      const queryWords = meaningfulWords(tc.input?.query || tc.input?.category || "");
      // No unfiltered fallback here, in either direction — confirmed live
      // this was the actual bug: a call whose own query was JUST "branded"
      // (nothing left after removing the stopword) fell through to
      // "include everything", which is exactly how the wristband/chocolate
      // junk got back in. No reliable words to check against means no
      // reliable results from this call, full stop.
      if (queryWords.length === 0) return [];
      const products = tc.output.products.filter((p) => !ACCESSORY_CATEGORY_PATTERN.test(p.category || ""));
      return products.filter((p) => queryWords.some((w) => (p.name || "").toLowerCase().includes(w)));
    });
  if (searchResults.length > 0) {
    const names = [...new Set(searchResults.map((p) => p.name))].slice(0, 6);
    return (
      `I found a few options in our catalog: ${names.join(", ")}. ` +
      `Let me know which one you'd like priced and at what quantity, and I'll get you an exact quote. ${FALLBACK_CONTACT_LINE}`
    );
  }

  return `Sorry, I'm having trouble pulling that together right now. ${FALLBACK_CONTACT_LINE}`;
}

/**
 * Runs the tool-calling loop for one turn. `history` is the trimmed recent
 * conversation the client sent (Vercel functions are stateless between
 * requests, so context has to travel with each call).
 */
export async function runAgent({ userMessage, history = [], maxSteps = 9, onDelta, onStatus }) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];
  const toolCalls = []; // every tool call this turn made, for building the widget response
  let quotesUsed = 0;

  for (let step = 0; step < maxSteps; step++) {
    // Reported live (twice, same query, "100 branded pens for a conference"):
    // the model quotes products one per round instead of batching (a known,
    // documented tendency — see MAX_QUOTES_PER_TURN above), silently burns
    // through every step doing that, and the loop ends having NEVER produced
    // a real answer — the visitor gets the generic "having trouble" fallback
    // even though several successful tool results are sitting right there in
    // `messages`. Forcing tool_choice:"none" on the final step makes the API
    // return content only, no further tool_calls possible — guaranteeing a
    // real answer from whatever's already been gathered, instead of hoping
    // the model chooses to stop on its own.
    const isLastStep = step === maxSteps - 1;
    let message;
    try {
      ({ message } = await callLLM(messages, onDelta, { toolChoice: isLastStep ? "none" : "auto" }));
    } catch (err) {
      // Only the forced-final-answer step gets this fallback — every
      // earlier step failing is the existing, different "upstream is
      // struggling" path and should still surface as a real error.
      if (!isLastStep) throw err;
      return { reply: synthesizeFallbackReply(toolCalls), toolCalls, messages };
    }
    messages.push(message);

    const requestedCalls = message.tool_calls || [];
    if (requestedCalls.length === 0) {
      return { reply: message.content || "", toolCalls, messages };
    }

    // A single round can request several calls at once (e.g. quoting 4
    // products to build a comparison table) — run them concurrently rather
    // than one after another. Promise.all preserves requestedCalls' order in
    // its results regardless of which finishes first, so extractProducts()
    // (which looks at the LAST search/filter call) still sees calls in the
    // order the model made them.
    for (const tc of requestedCalls) {
      onStatus?.(TOOL_STATUS_LABELS[tc.function.name] || "Working on it…");
    }
    const results = await Promise.all(
      requestedCalls.map(async (tc) => {
        const input = JSON.parse(tc.function.arguments || "{}");
        let output;
        if (tc.function.name === "get_price_quote" && quotesUsed >= MAX_QUOTES_PER_TURN) {
          output = {
            error: `Quote limit reached (${MAX_QUOTES_PER_TURN} products per turn). Don't request more — answer now with the quotes you already have, and ask the visitor which product they'd like to focus on if they want others priced.`,
          };
        } else {
          if (tc.function.name === "get_price_quote") quotesUsed++;
          output = await runTool(tc.function.name, input);
        }
        return { tc, input, output };
      })
    );
    for (const { tc, input, output } of results) {
      toolCalls.push({ name: tc.function.name, input, output });
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(output),
      });
    }
  }

  return {
    reply: `Sorry, I'm having trouble with that one — let me get a human from the team to help. ${FALLBACK_CONTACT_LINE}`,
    toolCalls,
    messages,
    hitLimit: true,
  };
}
