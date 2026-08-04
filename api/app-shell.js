// Client-only routes that are real pages (see src/App.jsx) but aren't in the
// SEO-critical rewrite list in vercel.json, so they land on this catch-all.
// None of these are meant to rank, so they get a shell + noindex, not a 404.
const REAL_APP_ROUTES = [
  /^\/occasions\/[^/]+$/,
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

export default async function handler(req, res) {
  const rawPath = String(req.query.path || "/");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  let shell;
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const protocol = host?.includes("localhost") ? "http" : "https";
    const response = await fetch(`${protocol}://${host}/`, {
      headers: { "x-seo-shell-request": "1" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Application shell unavailable");
    shell = await response.text();
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
  // case variant, a guessed URL. Serve a real 404 (not the homepage) so
  // crawlers don't index it as duplicate homepage content; client-side JS
  // still mounts and shows the app's own NotFound page for real visitors.
  res.setHeader("Cache-Control", "public, s-maxage=300");
  res.status(404).send(injectHead(shell, `<meta name="robots" content="noindex, follow">`));
}
