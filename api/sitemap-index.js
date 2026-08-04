const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://api.supermerch.com.au";
const PAGE_SIZE = 500;
const BACKEND_TIMEOUT_MS = 30000;

const xml = (value) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n${value}`;

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/sitemap-products?page=1&limit=${PAGE_SIZE}`,
      { signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS) },
    );
    if (!response.ok) throw new Error(`Sitemap product API returned ${response.status}`);

    const payload = await response.json();
    if (!payload?.success || !payload?.pagination) {
      throw new Error("Sitemap product API returned an invalid response");
    }

    const totalPages = Math.max(
      1,
      Number(payload.pagination.totalPages) ||
        Math.ceil(Number(payload.pagination.totalCount || 0) / PAGE_SIZE),
    );

    // Audit B9: the index previously shipped with zero <lastmod> tags on any
    // of its 67 entries. A real per-shard freshness value isn't cheaply
    // available here without an extra backend call per shard (66 of them),
    // and a live sample showed every product's updatedAt identical within a
    // page anyway (a bulk-sync timestamp, not a real per-item change time) --
    // so a per-shard max wouldn't be meaningful even if fetched. Using the
    // index's own generation time is the honest, cheap option: it's still a
    // real, monotonically-refreshing value crawlers can use to know the
    // index itself was recently regenerated, which is what this cache's
    // s-maxage already implies.
    const generatedAt = new Date().toISOString();

    const productMaps = Array.from(
      { length: totalPages },
      (_, index) =>
        `  <sitemap><loc>${SITE_URL}/sitemaps/products-${index + 1}.xml</loc><lastmod>${generatedAt}</lastmod></sitemap>`,
    ).join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).send(
      xml(
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_URL}/sitemap-static.xml</loc><lastmod>${generatedAt}</lastmod></sitemap>\n${productMaps}\n</sitemapindex>`,
      ),
    );
  } catch (error) {
    console.error("Failed to build sitemap index:", error);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(503).send(xml(`<error>Sitemap temporarily unavailable</error>`));
  }
}
