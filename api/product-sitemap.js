const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "https://api.supermerch.com.au";
const PAGE_SIZE = 500;

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

const isDiscontinued = (product) =>
  product?.meta?.discontinued === true ||
  String(product?.meta?.discontinued).toLowerCase() === "true" ||
  product?.product?.discontinued === true ||
  String(product?.product?.discontinued).toLowerCase() === "true";

export default async function handler(req, res) {
  const page = Number(req.query.page);
  if (!Number.isInteger(page) || page < 1) {
    res.status(400).send("Invalid sitemap page");
    return;
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/client-products?page=${page}&limit=${PAGE_SIZE}&filter=true`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const payload = await response.json();

    const entries = (Array.isArray(payload.data) ? payload.data : [])
      .filter((product) => !isDiscontinued(product))
      .map((product) => {
        const id = product?.meta?.id;
        const name =
          product?.product?.name ||
          product?.overview?.name ||
          product?.overview?.originalName;
        if (id === undefined || id === null || !name) return "";
        const productSlug = slugify(product?.product?.slug || product?.overview?.slug || name);
        const path = `/product/${productSlug}/${encodeURIComponent(String(id))}`;
        const lastmod = product?.updatedAt
          ? `<lastmod>${escapeXml(new Date(product.updatedAt).toISOString())}</lastmod>`
          : "";
        return `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      })
      .filter(Boolean)
      .join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`,
    );
  } catch {
    res.status(503).send("Sitemap temporarily unavailable");
  }
}
