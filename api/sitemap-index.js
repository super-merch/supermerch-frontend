const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "https://api.supermerch.com.au";
const PAGE_SIZE = 500;

const xml = (value) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n${value}`;

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/client-products?page=1&limit=${PAGE_SIZE}&filter=true`,
    );
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const payload = await response.json();
    const totalPages = Math.max(
      1,
      Number(payload.total_pages) ||
        Math.ceil(Number(payload.item_count || payload.pagination?.totalCount || 0) / PAGE_SIZE),
    );

    const productMaps = Array.from(
      { length: totalPages },
      (_, index) =>
        `  <sitemap><loc>${SITE_URL}/sitemaps/products-${index + 1}.xml</loc></sitemap>`,
    ).join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(
      xml(
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_URL}/sitemap-static.xml</loc></sitemap>\n${productMaps}\n</sitemapindex>`,
      ),
    );
  } catch (error) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(503).send(xml(`<error>Sitemap temporarily unavailable</error>`));
  }
}
