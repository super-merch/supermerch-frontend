const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://api.supermerch.com.au";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/promotional",
  "/Clothing",
  "/Headwear",
  "/australia-made",
  "/24hr-production",
  "/return-gifts",
  "/deals",
  "/hot-deals",
  "/clearance",
  "/category",
  "/all-blogs",
  "/about",
  "/contact",
  "/faqs",
  "/artwork-policy",
  "/refund-policy",
  "/privacy",
  "/terms",
  "/help-center",
  "/pms",
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fetchJson = async (url) => {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const normaliseRows = (payload, keys) => {
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const lastModified = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `<lastmod>${escapeXml(date.toISOString())}</lastmod>`;
};

export default async function handler(_req, res) {
  const [collectionPayload, blogPayload, dealPayload] = await Promise.all([
    fetchJson(`${BACKEND_URL}/api/public/collections`),
    fetchJson(`${BACKEND_URL}/api/blogs/get-blogs`),
    fetchJson(`${BACKEND_URL}/api/frontend/deals`),
  ]);

  const entries = STATIC_PATHS.map((path) => ({
    path,
    changefreq: ["/deals", "/hot-deals", "/clearance"].includes(path)
      ? "daily"
      : "weekly",
    priority: path === "/" ? "1.0" : "0.7",
  }));

  const collections = normaliseRows(collectionPayload, ["data", "collections"]);
  for (const collection of collections) {
    if (!collection?.slug || collection?.isActive === false) continue;
    entries.push({
      path: `/collections/${encodeURIComponent(collection.slug)}`,
      updatedAt: collection.updatedAt,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  const blogs = normaliseRows(blogPayload, ["data", "blogs"]);
  for (const blog of blogs) {
    const identifier = blog?._id || blog?.id;
    if (!identifier || blog?.isActive === false || blog?.status === "draft") continue;
    entries.push({
      path: `/blogs/${encodeURIComponent(identifier)}`,
      updatedAt: blog.updatedAt || blog.publishedAt,
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  const deals = normaliseRows(dealPayload, ["data", "deals"]);
  for (const deal of deals) {
    if (!deal?.slug || deal?.isActive === false) continue;
    entries.push({
      path: `/deals/${encodeURIComponent(deal.slug)}`,
      updatedAt: deal.updatedAt,
      changefreq: "daily",
      priority: "0.7",
    });
  }

  const seen = new Set();
  const urls = entries
    .filter(({ path }) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    })
    .map(
      ({ path, updatedAt, changefreq, priority }) =>
        `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastModified(
          updatedAt,
        )}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
  );
}
