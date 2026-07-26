const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://api.supermerch.com.au";
const DEFAULT_IMAGE = `${SITE_URL}/logo-teal.png`;

const cleanText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value) =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const isTrue = (value) =>
  value === true || String(value).toLowerCase() === "true";

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
  const keys = [
    "description",
    "robots",
    "og:title",
    "og:description",
    "og:image",
    "og:image:alt",
    "og:url",
    "og:type",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
    "twitter:url",
  ];
  let output = keys.reduce(removeMeta, html);
  output = output.replace(/<title>[\s\S]*?<\/title>/i, "");
  output = output.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "");
  return output.replace("</head>", `${tags}\n</head>`);
};

const getIdentifier = (query) => {
  if (query.id !== undefined && String(query.id).trim()) {
    return String(query.id).trim();
  }
  if (!query.ref) return "";
  try {
    return Buffer.from(String(query.ref), "base64").toString("utf8").trim();
  } catch {
    return "";
  }
};

const getShell = async (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = host?.includes("localhost") ? "http" : "https";
  const response = await fetch(`${protocol}://${host}/`, {
    headers: { "x-seo-shell-request": "1" },
  });
  if (!response.ok) throw new Error(`Application shell returned ${response.status}`);
  return response.text();
};

const errorHead = (status) => {
  const title =
    status === 410
      ? "Product No Longer Available | Super Merch Australia"
      : "Product Not Found | Super Merch Australia";
  const description =
    status === 410
      ? "This product is no longer available."
      : "The requested product could not be found.";
  return `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="noindex, follow">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${DEFAULT_IMAGE}">
<meta property="og:image:alt" content="Super Merch Australia logo">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${DEFAULT_IMAGE}">
<meta name="twitter:image:alt" content="Super Merch Australia logo">`;
};

export default async function handler(req, res) {
  let shell;
  try {
    shell = await getShell(req);
  } catch {
    res.status(503).send("Website temporarily unavailable");
    return;
  }

  const identifier = getIdentifier(req.query);
  if (!identifier) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300");
    res.status(404).send(injectHead(shell, errorHead(404)));
    return;
  }

  let product;
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/single-product/${encodeURIComponent(identifier)}`,
    );
    if (response.status === 404) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(404).send(injectHead(shell, errorHead(404)));
      return;
    }
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const payload = await response.json();
    product = payload?.data || null;
  } catch {
    res.setHeader("Retry-After", "300");
    res.status(503).send("Product data temporarily unavailable");
    return;
  }

  if (!product) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(404).send(injectHead(shell, errorHead(404)));
    return;
  }

  const details = product.product || {};
  const overview = product.overview || {};
  const name =
    cleanText(details.name || overview.name || overview.originalName) ||
    "Promotional Product";
  const description = cleanText(
    details.description || overview.description || details.short_description,
  ).slice(0, 160);
  const productId =
    product?.meta?.id ?? overview.sku_number ?? details.code ?? identifier;
  const sku = overview.sku_number || details.code || "";
  const canonical = `${SITE_URL}/product/${slugify(name)}/${encodeURIComponent(
    String(productId),
  )}`;
  const image =
    overview.hero_image ||
    details.images?.[0] ||
    details.image_data?.[0]?.original ||
    DEFAULT_IMAGE;
  const imageAlt =
    image === DEFAULT_IMAGE
      ? "Super Merch Australia logo"
      : `${name} promotional product`;
  const brand =
    (typeof details.supplier_brand === "string"
      ? details.supplier_brand
      : details.supplier_brand?.name) ||
    details.brand?.name ||
    overview.brand ||
    "";
  const discontinued =
    isTrue(product?.meta?.discontinued) || isTrue(details.discontinued);

  if (discontinued) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    res.status(410).send(injectHead(shell, errorHead(410)));
    return;
  }

  const title = `${name} | Custom Branded | Super Merch Australia`;
  const metaDescription =
    description ||
    `${name}. Custom branded promotional products from Super Merch Australia.`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: metaDescription,
    image: image === DEFAULT_IMAGE ? undefined : [image],
    sku: sku || undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    url: canonical,
  };
  const price = Number(product?.pricingSummary?.finalMinPrice);
  if (Number.isFinite(price) && price > 0) {
    productSchema.offers = {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "AUD",
      price: price.toFixed(2),
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name, item: canonical },
    ],
  };

  const tags = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDescription)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDescription)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(metaDescription)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
<meta name="twitter:url" content="${canonical}">
<script type="application/ld+json">${escapeJson(productSchema)}</script>
<script type="application/ld+json">${escapeJson(breadcrumbSchema)}</script>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(injectHead(shell, tags));
}
