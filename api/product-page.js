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

const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const imageUrl = (image) => {
  if (typeof image === "string") return image.trim();
  return cleanText(
    image?.url ||
      image?.original ||
      image?.large_square ||
      image?.medium_square ||
      image?.small_square,
  );
};

const detailValue = (details, names) => {
  const accepted = new Set(names.map((name) => name.toLowerCase()));
  return cleanText(
    (Array.isArray(details) ? details : []).find((item) =>
      accepted.has(cleanText(item?.name).toLowerCase()),
    )?.detail,
  );
};

const productAttributes = (details) => {
  const categorisation = details.categorisation || {};
  const category = cleanText(
    categorisation?.promodata_product_type?.type_name ||
      categorisation?.product_type?.type_name ||
      categorisation?.supplier_category,
  );
  const material =
    detailValue(details.details, ["Material", "Materials"]) ||
    cleanText(
      (categorisation.promodata_attributes || [])
        .find((value) => /^material\s*:/i.test(String(value)))
        ?.replace(/^material\s*:/i, ""),
    );
  const color = cleanText(
    (details.colours?.list || [])
      .flatMap((item) => item?.colours || item?.name || [])
      .filter(Boolean)
      .slice(0, 8)
      .join(", "),
  );
  return {
    category,
    material,
    color,
    capacity: detailValue(details.details, ["Capacity", "Volume"]),
    branding: detailValue(details.details, [
      "Branding Options",
      "Decoration Options",
      "Branding",
    ]),
  };
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

// Renders real, crawlable breadcrumb links as plain <a> tags. The final
// (current-page) crumb has no href, matching how visible breadcrumbs render
// elsewhere on the site.
const renderBreadcrumbLinks = (items) =>
  items
    .map((item) =>
      item.href
        ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
        : `<span>${escapeHtml(item.label)}</span>`,
    )
    .join(' <span aria-hidden="true">/</span> ');

/**
 * Injects a small, real, crawlable content block directly into the SPA's
 * mount point (#root) — an H1, a description paragraph, and breadcrumb
 * links — instead of only <head> meta tags. main.jsx mounts React with
 * createRoot() (not hydrateRoot()), so React fully replaces #root's
 * contents on mount rather than diffing against them: there is no
 * hydration to mismatch, and once JS runs this markup is simply discarded
 * in favour of the real client-rendered page.
 */
const injectBody = (html, bodyHtml) =>
  html.replace(
    /<div id=["']root["']><\/div>/,
    `<div id="root">${bodyHtml}</div>`,
  );

const renderProductBody = ({ name, description, breadcrumbItems }) => `
<div data-ssr-content="product">
<nav aria-label="Breadcrumb">${renderBreadcrumbLinks(breadcrumbItems)}</nav>
<h1>${escapeHtml(name)}</h1>
<p>${escapeHtml(description)}</p>
</div>`;

const getIdentifier = (query) => {
  if (query.id !== undefined && String(query.id).trim()) {
    return String(query.id).trim();
  }
  const slug = query.slug ? String(query.slug).trim() : "";
  if (!query.ref) return slug;
  try {
    return Buffer.from(String(query.ref), "base64").toString("utf8").trim() || slug;
  } catch {
    return slug;
  }
};

const getSeoOverride = async (entityId) => {
  try {
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/seo-meta/by-entity/product/${encodeURIComponent(
        String(entityId),
      )}`,
    );
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.success && payload?.data ? payload.data : null;
  } catch {
    // SEO overrides are optional. Product-derived metadata remains the safe fallback.
    return null;
  }
};

const getShell = async (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = host?.includes("localhost") ? "http" : "https";
  const response = await fetchWithTimeout(`${protocol}://${host}/`, {
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
    const response = await fetchWithTimeout(
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
  const rawDescription = cleanText(
    details.description || overview.description || details.short_description,
  );
  const description = rawDescription.slice(0, 160);
  const productId =
    product?.meta?.id ?? overview.sku_number ?? details.code ?? identifier;
  const sku = overview.sku_number || details.code || "";
  const canonicalSlug = slugify(details.slug || overview.slug || name);
  const canonical = `${SITE_URL}/product/${canonicalSlug}/${encodeURIComponent(
    String(productId),
  )}`;
  const image =
    [
      overview.hero_image,
      ...(Array.isArray(details.images) ? details.images : []),
      ...(Array.isArray(details.image_data) ? details.image_data : []),
    ]
      .map(imageUrl)
      .find(Boolean) || DEFAULT_IMAGE;
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
  const attributes = productAttributes(details);

  if (discontinued) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    res.status(410).send(injectHead(shell, errorHead(410)));
    return;
  }

  const generatedTitle = `${name} | Custom Branded | Super Merch Australia`;
  const generatedDescription =
    description ||
    [
      name,
      attributes.category ? `Custom branded ${attributes.category.toLowerCase()}` : "Custom branded promotional product",
      attributes.material ? `made from ${attributes.material}` : "",
      attributes.capacity ? `with ${attributes.capacity} capacity` : "",
      "from Super Merch Australia.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 160);
  const seoOverride = await getSeoOverride(productId);
  const title = cleanText(seoOverride?.metaTitle) || generatedTitle;
  const metaDescription =
    cleanText(seoOverride?.metaDescription).slice(0, 160) ||
    generatedDescription;
  const keywords = cleanText(seoOverride?.keywords);
  const socialTitle = cleanText(seoOverride?.ogTitle) || title;
  const socialDescription =
    cleanText(seoOverride?.ogDescription).slice(0, 200) || metaDescription;
  const socialImage = cleanText(seoOverride?.ogImage) || image;
  const socialImageAlt =
    socialImage === image ? imageAlt : `${name} promotional product`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: metaDescription,
    image: image === DEFAULT_IMAGE ? undefined : [image],
    sku: sku || undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    category: attributes.category || undefined,
    material: attributes.material || undefined,
    color: attributes.color || undefined,
    mpn: details.code || undefined,
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

  // Real breadcrumb trail — reused for both the visible <a> links injected
  // into #root and the BreadcrumbList JSON-LD below, so the two never
  // contradict each other. Category links point at /shop?category=X, the
  // same route the SEO layer for /shop already treats as that category's
  // canonical page (see api/seo-page.js).
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(attributes.category
      ? [
          {
            label: attributes.category,
            href: `/shop?category=${encodeURIComponent(attributes.category)}`,
          },
        ]
      : []),
    { label: name, href: null },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : canonical,
    })),
  };

  const bodyContent = renderProductBody({
    name,
    description: rawDescription.slice(0, 500) || metaDescription,
    breadcrumbItems,
  });

  const tags = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDescription)}">
${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ""}
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(socialTitle)}">
<meta property="og:description" content="${escapeHtml(socialDescription)}">
<meta property="og:image" content="${escapeHtml(socialImage)}">
<meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(socialTitle)}">
<meta name="twitter:description" content="${escapeHtml(socialDescription)}">
<meta name="twitter:image" content="${escapeHtml(socialImage)}">
<meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}">
<meta name="twitter:url" content="${canonical}">
<script type="application/ld+json" data-sm-seo-jsonld="true">${escapeJson(productSchema)}</script>
<script type="application/ld+json" data-sm-seo-jsonld="true">${escapeJson(breadcrumbSchema)}</script>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(injectBody(injectHead(shell, tags), bodyContent));
}
