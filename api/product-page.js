import { readFileSync } from "node:fs";
import { join } from "node:path";

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

// Truncates to `limit` characters without cutting a word in half: backs up
// to the last whole-word boundary (space) before the limit, then appends a
// single ellipsis character. Text already at or under the limit is returned
// unchanged. Used everywhere a title/description/og/twitter string is
// hard-truncated for display -- never for unrelated slicing (e.g. category
// ID validation, canonical URL building).
const truncateAtWordBoundary = (text, limit) => {
  const value = String(text || "");
  if (value.length <= limit) return value;
  const cut = value.slice(0, Math.max(0, limit - 1));
  const lastSpace = cut.lastIndexOf(" ");
  const truncated = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${truncated.trimEnd()}\u2026`;
};

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
  // category (label) and categoryId must come from the SAME source object,
  // not from independent fallback chains -- otherwise promodata_product_type
  // could supply a name while product_type supplies an unrelated ID, and the
  // visible breadcrumb/JSON-LD would describe one category while linking to
  // another. Only an object carrying BOTH a usable type_id AND type_name
  // qualifies -- selecting on type_id alone would let a same-object
  // type_name gap silently fall back to the unrelated supplier_category
  // label while still keeping that object's ID, recreating the exact
  // mismatch this is meant to prevent. The client's /shop?category=X route
  // (see Cards.jsx) treats the value as a productTypeId sent straight to
  // the backend as product_type_ids -- a label with no matching ID from
  // the same object is not a safe link target.
  const productType = [
    categorisation?.promodata_product_type,
    categorisation?.product_type,
  ].find((item) => cleanText(item?.type_id) && cleanText(item?.type_name));
  const category = cleanText(
    productType?.type_name || categorisation?.supplier_category,
  );
  const categoryId = cleanText(productType?.type_id);
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
    categoryId,
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

const renderProductBody = ({ name, description, breadcrumbItems, image, imageAlt }) => `
<div data-ssr-content="product">
<nav aria-label="Breadcrumb">${renderBreadcrumbLinks(breadcrumbItems)}</nav>
<h1>${escapeHtml(name)}</h1>
<img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}">
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

// Reads the built SPA shell straight off disk instead of self-fetching "/"
// over HTTP. On Vercel, a request matching an actual static file (dist/
// index.html at "/") is served directly and never reaches rewrites at all —
// so as long as any function depends on fetching "/" live, "/" itself can
// never be rewritten to a function. Reading the on-disk build artifact
// removes that dependency entirely and is what makes the "/" → seo-page
// rewrite (see vercel.json) safe to add. Cached in module scope so warm
// lambda instances pay the disk read only once.
let cachedShell = null;
const getShell = () => {
  if (!cachedShell) {
    cachedShell = readFileSync(join(process.cwd(), "dist", "index.html"), "utf8");
  }
  return cachedShell;
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
    shell = getShell();
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
  const description = truncateAtWordBoundary(rawDescription, 160);
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

  // A slug is only trustworthy as a redirect target when it's what actually
  // resolved the product (not an id/ref lookup) — otherwise every historical
  // slug for a product stays permanently indexable alongside the current one.
  const requestedSlug = req.query.slug ? String(req.query.slug).trim() : "";
  const requestedId = req.query.id !== undefined ? String(req.query.id).trim() : "";
  if (requestedSlug && requestedId && identifier === requestedId) {
    const canonicalPath = `/product/${canonicalSlug}/${encodeURIComponent(String(productId))}`;
    const currentPath = `/product/${requestedSlug}/${requestedId}`;
    if (currentPath !== canonicalPath) {
      res.setHeader("Location", canonicalPath);
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      res.status(301).end();
      return;
    }
  }

  const generatedTitle = `${name} | Custom Branded | Super Merch Australia`;
  const generatedDescription =
    description ||
    truncateAtWordBoundary(
      [
        name,
        attributes.category ? `Custom branded ${attributes.category.toLowerCase()}` : "Custom branded promotional product",
        attributes.material ? `made from ${attributes.material}` : "",
        attributes.capacity ? `with ${attributes.capacity} capacity` : "",
        "from Super Merch Australia.",
      ]
        .filter(Boolean)
        .join(" "),
      160,
    );
  const seoOverride = await getSeoOverride(productId);
  const title = cleanText(seoOverride?.metaTitle) || generatedTitle;
  const metaDescription =
    truncateAtWordBoundary(cleanText(seoOverride?.metaDescription), 160) ||
    generatedDescription;
  const keywords = cleanText(seoOverride?.keywords);
  const socialTitle = cleanText(seoOverride?.ogTitle) || title;
  const socialDescription =
    truncateAtWordBoundary(cleanText(seoOverride?.ogDescription), 200) || metaDescription;
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
  // contradict each other. Category links point at /shop?category=<id>:
  // Cards.jsx treats that value as a productTypeId and sends it to the
  // backend as product_type_ids, so the URL must carry the real type_id,
  // not the human-readable category label -- the label is display text
  // only. If no type_id was resolved, the category has no safe link
  // target, so the crumb is omitted rather than publishing a broken URL.
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(attributes.category && attributes.categoryId
      ? [
          {
            label: attributes.category,
            href: `/shop?category=${encodeURIComponent(attributes.categoryId)}`,
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
    image: socialImage,
    imageAlt: socialImageAlt,
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
