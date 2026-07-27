const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://api.supermerch.com.au";
const PAGE_SIZE = 500;
const BACKEND_TIMEOUT_MS = 30000;

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatLastModified = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `<lastmod>${escapeXml(date.toISOString())}</lastmod>`;
};

export default async function handler(req, res) {
  const page = Number(req.query.page);
  if (!Number.isInteger(page) || page < 1) {
    res.status(400).send("Invalid sitemap page");
    return;
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/sitemap-products?page=${page}&limit=${PAGE_SIZE}`,
      { signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS) },
    );
    if (!response.ok) throw new Error(`Sitemap product API returned ${response.status}`);

    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new Error("Sitemap product API returned an invalid response");
    }

    const entries = payload.data
      .map((product) => {
        const id = product?.id;
        const name = product?.name;
        if (id === undefined || id === null || !name) return "";

        const productSlug = slugify(product.slug || name);
        if (!productSlug) return "";

        const path = `/product/${productSlug}/${encodeURIComponent(String(id))}`;
        const lastmod = formatLastModified(product.updatedAt);
        return `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      })
      .filter(Boolean)
      .join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`,
    );
  } catch (error) {
    console.error(`Failed to build product sitemap page ${page}:`, error);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(503).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<error>Sitemap temporarily unavailable</error>`,
    );
  }
}
