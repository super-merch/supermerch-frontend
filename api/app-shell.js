import { readFileSync } from "node:fs";
import { join } from "node:path";

// Client-only routes that are real pages (see src/App.jsx) but aren't in the
// SEO-critical rewrite list in vercel.json, so they land on this catch-all.
// None of these are meant to rank, so they get a shell + noindex, not a 404.
const REAL_APP_ROUTES = [
  /^\/quote\/respond\/[^/]+$/,
  /^\/favourites$/,
  /^\/search$/,
  /^\/success$/,
  /^\/cancel$/,
  /^\/cart$/,
  /^\/checkout$/,
  /^\/upload-artwork$/,
  /^\/mail-offer$/,
  /^\/track-order$/,
  /^\/signup$/,
  /^\/login$/,
  /^\/my-account$/,
];

const isRealAppRoute = (path) => REAL_APP_ROUTES.some((pattern) => pattern.test(path));

// Every known, correctly-cased path this catch-all could plausibly see a
// case-variant typo of (e.g. "/clothing" for "/Clothing"). Mirrors the
// vercel.json SEO-page rewrite list plus the REAL_APP_ROUTES literals above.
// Dynamic-segment routes (/quote/respond/:id) are excluded
// -- there's no single "correct" casing to redirect an arbitrary slug to.
const KNOWN_CANONICAL_PATHS = [
  "/shop", "/promotional", "/Clothing", "/Headwear", "/return-gifts",
  "/24hr-production", "/deals", "/hot-deals", "/australia-made", "/clearance",
  "/category", "/about", "/contact", "/all-blogs", "/faqs", "/artwork-policy",
  "/refund-policy", "/privacy", "/terms", "/help-center", "/pms",
  "/favourites", "/search", "/success", "/cancel", "/cart", "/checkout",
  "/upload-artwork", "/mail-offer", "/track-order", "/signup", "/login",
  "/my-account",
];

// A case-insensitive match against a known real path that isn't an exact
// (case-sensitive) match is a case-variant typo -- redirect it rather than
// 404 it, since it's clearly the same intended page (audit item B4/#11).
const findCaseVariant = (path) => {
  const lower = path.toLowerCase();
  return KNOWN_CANONICAL_PATHS.find(
    (known) => known !== path && known.toLowerCase() === lower,
  );
};

const removeMeta = (html, key) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(
    new RegExp(
      `<meta\\s+[^>]*(?:name|property)=["']${escaped}["'][^>]*>\\s*`,
      "gi",
    ),
    "",
  );
};

const injectHead = (html, tags) => {
  const keys = ["robots", "og:url"];
  let output = keys.reduce(removeMeta, html);
  output = output.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "");
  return output.replace("</head>", `${tags}\n</head>`);
};

// Reads the built SPA shell straight off disk instead of self-fetching "/"
// over HTTP or reading dist/index.html directly. Vercel serves an exact
// static-file match (dist/index.html at "/") before ever consulting
// vercel.json's rewrites, regardless of what any function depends on --
// so the "vercel-build" script (see package.json) copies index.html to
// this filename and deletes the original, leaving no static file at "/"
// for Vercel to intercept the "/" -> seo-page rewrite with. Cached in
// module scope so warm lambda instances pay the disk read only once.
let cachedShell = null;
const getShell = () => {
  if (!cachedShell) {
    cachedShell = readFileSync(join(process.cwd(), "dist", "_shell.html"), "utf8");
  }
  return cachedShell;
};

export default async function handler(req, res) {
  const rawPath = String(req.query.path || "/");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  const caseVariant = findCaseVariant(path);
  if (caseVariant) {
    res.setHeader("Location", caseVariant);
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(301).end();
    return;
  }

  let shell;
  try {
    shell = getShell();
  } catch {
    res.status(503).send("Website temporarily unavailable");
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (isRealAppRoute(path)) {
    // A genuine page, just not one with server-rendered SEO metadata of its
    // own. Serve the shell, but don't let it carry the homepage's canonical
    // and indexing signal — that was the "duplicate canonical" bug.
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(injectHead(shell, `<meta name="robots" content="noindex, follow">`));
    return;
  }

  // Anything else reaching this catch-all is not a real route: a typo, a
  // case variant with no known canonical match, a guessed URL. Serve a real
  // 404 (not the homepage) so crawlers don't index it as duplicate homepage
  // content; client-side JS still mounts and shows the app's own NotFound
  // page for real visitors.
  res.setHeader("Cache-Control", "public, s-maxage=300");
  res.status(404).send(injectHead(shell, `<meta name="robots" content="noindex, follow">`));
}
