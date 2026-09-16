# Merch Mate bot — setup checklist

What this is: a Vercel serverless function (`api/chat.js`) that answers the
existing `ChatWidget.jsx` on the storefront. It calls OpenAI directly (moved
off NVIDIA's free/shared tier — see "History: NVIDIA outage" below for why)
with tools that hit the *real* Super Merch product API for catalog/pricing,
submits captured leads straight into the real backend's existing
`UserQuery`/"Queries" system, and separately emails each captured lead
directly to a configured address.

## Why this exists

The widget was already deployed calling `https://api.supermerch.com.au/ai/api/chat`,
which currently 502s (nginx route with nothing running behind it — confirmed
via the `supermerch-backend` source: there's no `/ai` route or chatbot code
anywhere in that repo, so it's a stale/orphaned nginx config, not something
this change needs to clean up on that side). This change points the widget at
this repo's own `/api/chat` instead, so it ships on the same Vercel
deployment with no extra server to stand up.

## What you need to provide (as Vercel env vars, Project Settings -> Environment Variables — never commit these)

1. **`OPENAI_API_KEY`** — a standard OpenAI API key. `OPENAI_MODEL` (default
   `gpt-4o-mini`) has a sane default — only set it if you want a different
   model. **Function/tool calling depends on the model** — if you swap
   `OPENAI_MODEL`, confirm the replacement actually supports the `tools`
   parameter. `agent.js`'s `callLLM` retries automatically on
   400/429/500/503 (same pattern `supermerch-poc/server.js` used for "model
   busy" 429/503s, widened to also cover 400) — so brief
   blips self-heal without erroring to the visitor. See the outage note below.
2. **`RESEND_API_KEY`** — from https://resend.com. Without this set, the
   lead-notification email is silently skipped — the lead still saves via
   `/api/contact/add`, it just won't also land in an inbox. **This Resend
   account is registered to `ankit@supermerch.com.au`, and its unverified
   test mode only allows sending TO that same address** — sending to any
   other recipient 403s until a domain is verified at resend.com/domains and
   `LEAD_NOTIFY_FROM` is changed to an address on that domain (e.g.
   `bot@supermerch.com.au`). Confirmed by testing directly against the API.
3. **`LEAD_NOTIFY_EMAIL`** — where captured leads get emailed directly.
   Currently `ankit@supermerch.com.au` in `.env.local` (the only address that
   works without domain verification, per the point above).
4. Leave **`VITE_BOT_API_URL`** unset/empty in Vercel — the widget then calls
   same-origin `/api/chat`. **Do not** leave it pointing at
   `api.supermerch.com.au/ai` (that's the dead route).

## History: NVIDIA outage hit during testing (why this now uses OpenAI)

While testing, every model we tried (`nvidia/nemotron-3-ultra-550b-a55b`,
`openai/gpt-oss-20b`, `nvidia/nemotron-3-nano-30b-a3b`) returned the identical
400 `"DEGRADED function cannot be invoked"` (each with a different internal
Function ID) — confirmed by curling `integrate.api.nvidia.com` directly,
bypassing our code entirely. That's NVIDIA's hosted-inference platform
reporting a broad outage at the time, not a bug in this integration, not the
wrong model choice, and not something retrying more aggressively would fix
(the built-in retry already tried 3x with backoff and got the same result
every time). The earlier "30 hoodies" test — full tool-calling loop, real
quote, real product cards — proved the whole pipeline works correctly when
NVIDIA's service is actually up. If `/api/chat` starts erroring in a way that
looks like this, check https://build.nvidia.com or NVIDIA's status
communications before assuming something here is broken.

## What's already handled in code

- `api/lib/catalogApi.js` — calls the live `api.supermerch.com.au` product API
  for search/category/pricing. No catalog mirror, no staleness.
- `api/lib/contactApi.js` — posts captured leads to the real backend's public
  `POST /api/contact/add` (the same endpoint the site's own Contact Us form
  uses, backed by the `UserQuery` model). This means a chatbot lead:
  - shows up in the staff "Queries" admin page immediately, no new UI needed
  - triggers whatever admin email / in-app notification is already configured
    for queries (via that backend's `pushNotification` toggle) — nothing new
    to set up on the notification side
  - requires **name, email, AND phone** — the backend schema marks all three
    `required: true`, so the agent is instructed to collect all three before
    calling `capture_lead` (not "name + one of email/phone")
- `api/lib/email.js` — additionally emails the full lead (name/email/phone/
  summary/reason) directly to `LEAD_NOTIFY_EMAIL` via Resend, right after the
  `/api/contact/add` save. This is on top of, not instead of, that save —
  the lead still shows up in the admin Queries page either way. Best-effort:
  if Resend isn't configured or the send fails, `capture_lead` still succeeds
  and logs the email error, since the lead itself already saved.
- `api/lib/agent.js` — OpenAI tool-calling loop (system prompt + 4 tools:
  filter_products, search_products, get_price_quote, capture_lead).
- `api/chat.js` — glues it together and matches `ChatWidget.jsx`'s exact
  request/response contract.

## Not yet built (fast-follow, doesn't block launch)

- **Semantic/vector search.** `search_products` currently uses the live
  catalog's keyword search endpoint, same as the storefront's own search bar —
  real data, not hallucinated, but not true meaning-based matching yet.
- **Rate limiting.** No visitor cap yet (fine for now, given no login exists).
  Worth adding before traffic scales, to bound LLM cost per session.

## A note on `pricingSummary.finalMinPrice`

`catalogApi.js` reads `pricingSummary.finalMinPrice` from live API responses —
confirmed present by directly curling `api.supermerch.com.au` today. That
field does **not** exist in the `supermerch-backend` zip's
`allProductsController.js` (margin/discount math there produces
`marginInfo`/`discountInfo` on the raw `price_groups` tree instead). That zip
snapshot is evidently older than what's actually deployed — worth confirming
you're looking at the latest backend code if you go digging in that repo, but
it doesn't block anything here since the chatbot only ever talks to the live
HTTP API, never the backend source directly.

## Testing locally before deploying

```bash
npm install
npm run dev        # Vite frontend
npm run dev:api    # local API dev server (needs .env.local)
```

`npm run dev:api` reads `.env.local` (git-ignored) — fill in `OPENAI_API_KEY`
there first. This avoids needing `vercel dev`/a Vercel login just to test.
Every local request still calls the real OpenAI API and real product/contact
APIs, so it costs real usage and can create real query records — don't spam it.

**If another session/device has a dev server already running in this same
folder**, both `npm run dev` (5173) and `npm run dev:api` (8787) may need a
different port to avoid colliding with it — see `PORT`/`API_PORT` in
`scripts/dev-api-server.js` and Vite's `--port` flag.
