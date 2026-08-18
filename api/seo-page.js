// Shared with the client (src/utils/shopSeo.js, RouteSeo.jsx) so both sides
// agree on exactly the same category IDs -- used to decide whether a
// /shop?category=X value is a real category (self-canonical, indexable)
// or arbitrary/invalid input (canonicalize to plain /shop, noindex) --
// admin-override presence must never be used as that validity signal.
import { isValidCategoryId } from "../src/utils/categoryValidity.js";
import categoryData from "../scripts/category-finder/authoritative-category-ids.json" with { type: "json" };
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://www.supermerch.com.au";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://api.supermerch.com.au";
const DEFAULT_IMAGE = `${SITE_URL}/logo-teal.png`;

const STATIC_PAGES = {
  "/": ["cmsPage", "home", "Super Merch Australia", "Custom promotional products, branded merchandise, workwear, corporate gifts and awards for Australian organisations."],
  "/shop": ["category", "shop", "Shop Promotional Products | Super Merch Australia", "Browse custom promotional products and branded merchandise for Australian businesses, events and teams."],
  "/promotional": ["category", "promotional", "Promotional Products Australia | Super Merch", "Browse custom promotional products and branded merchandise for Australian businesses, events, teams and campaigns."],
  "/Clothing": ["category", "Clothing", "Custom Branded Clothing Australia | Super Merch", "Shop custom branded polos, shirts, jackets, workwear and apparel for Australian teams and businesses."],
  "/Headwear": ["category", "Headwear", "Custom Branded Headwear Australia | Super Merch", "Browse custom caps, hats, beanies and branded headwear for Australian organisations and events."],
  "/return-gifts": ["category", "return-gifts", "Custom Return Gifts Australia | Super Merch", "Discover practical custom return gifts and branded giveaways for celebrations, events and organisations."],
  "/24hr-production": ["category", "24hr-production", "24-Hour Promotional Products Australia | Super Merch", "Browse promotional products available with rapid production options for urgent Australian orders."],
  "/deals": ["category", "deals", "Deals and Offers | Super Merch Australia", "View current Super Merch deals on custom promotional products and branded merchandise."],
  "/hot-deals": ["category", "hot-deals", "Promotional Product Deals | Super Merch Australia", "Explore current promotional merchandise deals and value offers from Super Merch Australia."],
  "/australia-made": ["category", "australia-made", "Australian-Made Promotional Products | Super Merch", "Shop Australian-made promotional products and locally produced branded merchandise."],
  "/clearance": ["category", "clearance", "Promotional Product Clearance | Super Merch Australia", "Browse clearance promotional products and branded merchandise while stocks last."],
  "/category": ["category", "category", "Promotional Product Categories | Super Merch Australia", "Explore promotional product categories, branded merchandise, corporate gifts and custom apparel."],
  "/about": ["cmsPage", "about", "About Super Merch Australia", "Learn about Super Merch and our approach to promotional products, uniforms, corporate gifts and branded merchandise."],
  "/contact": ["cmsPage", "contact", "Contact Super Merch Australia", "Contact Super Merch for promotional products, uniforms, corporate gifts, awards and branded merchandise."],
  "/all-blogs": ["cmsPage", "all-blogs", "Promotional Products Blog | Super Merch Australia", "Read practical guides and ideas about promotional products, corporate gifts, branded apparel and merchandise."],
  "/faqs": ["cmsPage", "faqs", "Frequently Asked Questions | Super Merch Australia", "Find answers about artwork, branding, delivery, minimum quantities and ordering from Super Merch."],
  "/artwork-policy": ["cmsPage", "artwork-policy", "Artwork Policy | Super Merch Australia", "Review Super Merch artwork requirements for custom branded promotional products and apparel."],
  "/refund-policy": ["cmsPage", "refund-policy", "Refund Policy | Super Merch Australia", "Review the Super Merch refund and returns policy."],
  "/privacy": ["cmsPage", "privacy", "Privacy Policy | Super Merch Australia", "Read the Super Merch Australia privacy policy."],
  "/terms": ["cmsPage", "terms", "Terms and Conditions | Super Merch Australia", "Read the Super Merch Australia website and ordering terms and conditions."],
  "/help-center": ["cmsPage", "help-center", "Help Centre | Super Merch Australia", "Get help with Super Merch products, artwork, ordering and delivery."],
  "/pms": ["cmsPage", "pms", "PMS Colour Chart | Super Merch Australia", "Use the PMS colour chart when preparing artwork for custom branded merchandise."],
};

const cleanText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (value) => {
  const text = cleanText(value);
  return text ? text.split(/\s+/).length : 0;
};

// Same category ID lookup used by isValidCategoryId, kept here (rather than
// re-exported from categoryValidity.js) so this module can build sibling
// links without changing that file's browser-safe, validity-only surface.
const LEAVES_BY_ID = new Map(
  (categoryData.leaves || []).map((item) => [item.id, item]),
);
const LEAVES_BY_PARENT = new Map();
(categoryData.leaves || []).forEach((item) => {
  const list = LEAVES_BY_PARENT.get(item.parentId) || [];
  list.push(item);
  LEAVES_BY_PARENT.set(item.parentId, list);
});
const PARENTS_BY_ID = new Map(
  (categoryData.parents || []).map((item) => [item.id, item]),
);

// Up to N sibling category links for internal linking (audit item B2): a
// leaf links to its parent plus a few sibling leaves under the same parent;
// a parent links to a handful of its own leaf children. Real leaf/parent IDs
// only, so every link target is itself a valid, indexable category page.
const SIBLING_LINK_LIMIT = 12;
const buildSiblingCategoryLinks = (categoryId) => {
  const leaf = LEAVES_BY_ID.get(categoryId);
  if (leaf) {
    const parent = PARENTS_BY_ID.get(leaf.parentId);
    const siblings = (LEAVES_BY_PARENT.get(leaf.parentId) || []).filter(
      (item) => item.id !== categoryId,
    );
    return [
      ...(parent ? [{ label: parent.name, href: `/shop?category=${encodeURIComponent(parent.id)}` }] : []),
      ...siblings
        .slice(0, SIBLING_LINK_LIMIT)
        .map((item) => ({ label: item.name, href: `/shop?category=${encodeURIComponent(item.id)}` })),
    ];
  }
  const parent = PARENTS_BY_ID.get(categoryId);
  if (parent) {
    return (LEAVES_BY_PARENT.get(categoryId) || [])
      .slice(0, SIBLING_LINK_LIMIT)
      .map((item) => ({ label: item.name, href: `/shop?category=${encodeURIComponent(item.id)}` }));
  }
  return [];
};

// Mirrors src/utils/utils.jsx's toProductUrl()/slugify() exactly -- must
// produce the identical /product/<slug>/<id> path the client itself
// generates, or these SSR links would 301/mismatch against the real
// canonical product URL.
const slugify = (value) =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toProductUrl = (productName, id) => {
  if (!productName) return "/";
  const base = `/product/${slugify(productName)}`;
  const normalizedId = id !== undefined && id !== null ? String(id).trim() : "";
  return normalizedId ? `${base}/${encodeURIComponent(normalizedId)}` : base;
};

const PRODUCTS_PER_CATEGORY_PAGE = 24;

// Real products for a category/general listing page, for server-rendered
// internal links (audit B2 -- "likely the single biggest lever for moving
// indexation off ~1%"). Mirrors the exact endpoints Cards.jsx itself calls:
// a real leaf/parent category ID goes through product_type_ids (not the
// confusingly-named /client-products/category, which is a free-text name
// search, not a category filter); no category means the plain product feed.
const fetchCategoryProducts = async (categoryId) => {
  try {
    const url = categoryId
      ? `${BACKEND_URL}/api/params-products?product_type_ids=${encodeURIComponent(
          categoryId,
        )}&page=1&limit=${PRODUCTS_PER_CATEGORY_PAGE}`
      : `${BACKEND_URL}/api/client-products?page=1&limit=${PRODUCTS_PER_CATEGORY_PAGE}&filter=true`;
    const payload = await fetchJson(url);
    const products = Array.isArray(payload?.data) ? payload.data : [];
    return products
      .map((product) => {
        const id = product?.meta?.id;
        const name = product?.slug || product?.overview?.originalName || product?.overview?.name;
        if (!id || !name) return null;
        return { label: cleanText(name), href: toProductUrl(name, id) };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

// Real, crawlable posts for the blog index (audit B5 -- "/all-blogs" served
// zero <a href="/blogs...">  links anywhere in its raw HTML). Reuses the
// exact same list endpoint/shape the client's BlogContext.fetchBlogs() calls
// (payload.blogs, falling back to payload.data), and the same "real,
// published post" gate used when this file adds blog posts to the sitemap
// (content-sitemap.js): active, non-draft, and past the thin-content
// threshold, so every link this renders points at a post that is itself
// indexable rather than compounding the orphaned-content problem.
const fetchBlogPosts = async () => {
  try {
    const payload = await fetchJson(`${BACKEND_URL}/api/blogs/get-blogs`);
    const posts = Array.isArray(payload?.blogs)
      ? payload.blogs
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    return posts
      .filter(
        (post) =>
          post?.isActive !== false &&
          post?.status !== "draft" &&
          wordCount(post?.content) >= 300,
      )
      .map((post) => {
        const id = post?._id || post?.id;
        const label = cleanText(post?.title);
        if (!id || !label) return null;
        return { label, href: `/blogs/${encodeURIComponent(id)}` };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

// Same plain <ul><a> nav pattern as renderCatalogueLinks/renderHomeCategoryLinks
// below, applied to blog posts on the /all-blogs index.
const renderBlogListLinks = (posts) => {
  if (!posts.length) return "";
  return `<nav aria-label="Blog posts">
<ul>
${posts.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("\n")}
</ul>
</nav>`;
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

const fetchJson = async (url, timeoutMs = 8000) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) return null;
  return response.json();
};

const fetchSeoOverride = async (entityType, entityId) => {
  try {
    const payload = await fetchJson(
      `${BACKEND_URL}/api/seo-meta/by-entity/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(String(entityId))}`,
    );
    return payload?.success && payload?.data ? payload.data : null;
  } catch {
    return null;
  }
};

const resolvePage = async (path, category) => {
  if (STATIC_PAGES[path]) {
    const [entityType, entityId, title, description] = STATIC_PAGES[path];
    return {
      entityType,
      entityId: path === "/shop" && category ? category : entityId,
      title,
      description,
      image: DEFAULT_IMAGE,
      canonicalPath:
        path === "/shop" && category
          ? `/shop?category=${encodeURIComponent(category)}`
          : path,
    };
  }

  const collectionMatch = path.match(/^\/collections\/([^/]+)$/);
  if (collectionMatch) {
    const slug = decodeURIComponent(collectionMatch[1]);
    const payload = await fetchJson(
      `${BACKEND_URL}/api/public/collection/${encodeURIComponent(slug)}?page=1&limit=1`,
    );
    const collection = payload?.collection || payload?.data?.collection;
    if (!payload?.success || !collection) return null;
    return {
      entityType: "category",
      entityId: `collection-${slug}`,
      title: `${cleanText(collection.name)} | Super Merch Australia`,
      description:
        truncateAtWordBoundary(cleanText(collection.shortDescription), 160) ||
        `Browse products in our ${cleanText(collection.name)} collection.`,
      image: cleanText(collection.image) || DEFAULT_IMAGE,
    };
  }

  const dealMatch = path.match(/^\/deals\/([^/]+)$/);
  if (dealMatch) {
    const slug = decodeURIComponent(dealMatch[1]);
    const payload = await fetchJson(
      `${BACKEND_URL}/api/frontend/deal/${encodeURIComponent(slug)}`,
    );
    const deal = payload?.data;
    if (!payload?.success || !deal) return null;
    return {
      entityType: "deal",
      entityId: deal.id || deal._id || slug,
      title: `${cleanText(deal.title)} Deal | Super Merch Australia`,
      description:
        truncateAtWordBoundary(cleanText(deal.description), 160) ||
        `Explore the ${cleanText(deal.title)} promotional product deal from Super Merch Australia.`,
      image: cleanText(deal.bannerImage) || DEFAULT_IMAGE,
    };
  }

  const blogMatch = path.match(/^\/blogs\/([^/]+)$/);
  if (blogMatch) {
    const id = decodeURIComponent(blogMatch[1]);
    const payload = await fetchJson(
      `${BACKEND_URL}/api/blogs/get-blog/${encodeURIComponent(id)}`,
    );
    const blog = payload?.blog || payload?.data;
    if (!blog) return null;
    const title = cleanText(blog.metaTitle || blog.title);
    return {
      entityType: "blog",
      entityId: blog._id || id,
      title: `${title} | Super Merch Australia`,
      description:
        truncateAtWordBoundary(cleanText(blog.metaDescription || blog.shortDescription || blog.content), 160) ||
        `Read ${title} from Super Merch Australia.`,
      image:
        cleanText(blog.ogImage || blog.image?.url || blog.image || blog.images?.[0]?.url) ||
        DEFAULT_IMAGE,
      robots: wordCount(blog.content) >= 300 ? "index, follow" : "noindex, follow",
      // get-blog never returns a separate "published" timestamp -- createdAt
      // is the closest real field to it, and updatedAt (falling back to
      // createdAt when a post has never been edited) covers dateModified.
      datePublished: blog.publishedAt || blog.createdAt || null,
      dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt || null,
    };
  }

  const cmsMatch = path.match(/^\/page\/([^/]+)$/);
  if (cmsMatch) {
    const slug = decodeURIComponent(cmsMatch[1]);
    const payload = await fetchJson(
      `${BACKEND_URL}/api/cms-pages/by-slug/${encodeURIComponent(slug)}`,
    );
    const page = payload?.data || payload?.page;
    if (!page) return null;
    const title = cleanText(page.metaTitle || page.title || page.header);
    return {
      entityType: "cmsPage",
      entityId: slug,
      title: `${title} | Super Merch Australia`,
      description:
        truncateAtWordBoundary(cleanText(page.metaDescription || page.description || page.content), 160) ||
        `Learn more about ${title} from Super Merch Australia.`,
      image: cleanText(page.ogImage || page.image) || DEFAULT_IMAGE,
    };
  }

  return null;
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

const SITE_SUFFIX = / \| Super Merch Australia$/i;

// Builds the same breadcrumb trail used for both the visible <a> links and
// (where present) any future structured data — a category page sits under
// Shop, a blog post under Blog, a deal under Deals; everything else sits
// directly under Home. The homepage itself gets no breadcrumb.
const buildBreadcrumbItems = (path, entityType, displayName) => {
  if (path === "/") return [];
  const items = [{ label: "Home", href: "/" }];
  if (entityType === "category" && displayName !== "Shop") {
    items.push({ label: "Shop", href: "/shop" });
  } else if (entityType === "blog" && displayName !== "Blog") {
    items.push({ label: "Blog", href: "/all-blogs" });
  } else if (entityType === "deal" && displayName !== "Deals") {
    items.push({ label: "Deals", href: "/deals" });
  }
  items.push({ label: displayName, href: null });
  return items;
};

// Real, crawlable entry points into the catalogue from the homepage — audit
// item B1 calls for "real <a href> links to top categories/products" here,
// not just an H1 and a paragraph. These mirror the top-level STATIC_PAGES
// categories already server-rendered on their own pages, so every link
// target already has its own real SSR content behind it.
const HOME_CATEGORY_LINKS = [
  { label: "Shop All Products", href: "/shop" },
  { label: "Promotional Products", href: "/promotional" },
  { label: "Clothing", href: "/Clothing" },
  { label: "Headwear", href: "/Headwear" },
  { label: "Australia Made", href: "/australia-made" },
  { label: "Deals", href: "/deals" },
  { label: "Return Gifts", href: "/return-gifts" },
  { label: "Clearance", href: "/clearance" },
];

const renderHomeCategoryLinks = () => `
<nav aria-label="Top categories">
<ul>
${HOME_CATEGORY_LINKS.map(
  (item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`,
).join("\n")}
</ul>
</nav>`;

// Real, crawlable links from a category/shop listing page to the products
// and sibling categories it actually contains (audit B2). Rendered as plain
// <ul><a> lists, same pattern as the homepage's category nav above -- these
// are the internal link graph the audit found completely missing, with the
// XML sitemap left as the only non-JS discovery path to any product.
const renderCatalogueLinks = (products, siblingCategories) => {
  if (!products.length && !siblingCategories.length) return "";
  const productList = products.length
    ? `<nav aria-label="Products in this category">
<ul>
${products.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("\n")}
</ul>
</nav>`
    : "";
  const siblingList = siblingCategories.length
    ? `<nav aria-label="Related categories">
<ul>
${siblingCategories.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("\n")}
</ul>
</nav>`
    : "";
  return `${productList}\n${siblingList}`;
};

const renderPageBody = ({ path, displayName, description, breadcrumbItems, catalogueLinks }) => `
<div data-ssr-content="page" style="display:none">
${breadcrumbItems.length ? `<nav aria-label="Breadcrumb">${renderBreadcrumbLinks(breadcrumbItems)}</nav>\n` : ""}<h1>${escapeHtml(displayName)}</h1>
<p>${escapeHtml(description)}</p>
${path === "/" ? renderHomeCategoryLinks() : ""}
${catalogueLinks || ""}
</div>`;

// Query params that don't create a distinct, thin/duplicate variant of a
// /shop page: `category` selects the canonical category view itself, and
// the rest are already stripped when building the canonical URL below.
const BENIGN_SHOP_PARAMS = new Set([
  "category",
  "page",
  "sort",
  "view",
  "gclid",
  "fbclid",
]);

/**
 * True when /shop has facet/filter params beyond the ones above (e.g.
 * color, size, price range). Those combinations create combinatorial,
 * largely duplicate content and should be kept out of the index while the
 * canonical /shop and /shop?category=X views stay indexable. Must match
 * hasShopFilterParams() in src/utils/shopSeo.js, which drives the same
 * decision client-side.
 */
const hasShopFilterParams = (query) =>
  Object.keys(query).some((key) => {
    if (key === "path") return false;
    const normalized = key.toLowerCase();
    return !BENIGN_SHOP_PARAMS.has(normalized) && !normalized.startsWith("utm_");
  });

// Reads the built SPA shell straight off disk instead of self-fetching "/"
// over HTTP or reading dist/index.html directly. Vercel serves an exact
// static-file match (dist/index.html at "/") before ever consulting
// vercel.json's rewrites, regardless of what any function depends on --
// so the "vercel-build" script (see package.json) copies index.html here
// and deletes the original, leaving no static file at "/" for Vercel to
// intercept the "/" -> seo-page rewrite with. The copy lives outside dist
// on purpose: files in the public output are reachable as URLs, and an
// earlier dist/_shell.html left an empty indexable page served at
// /_shell.html. vercel.json's includeFiles still bundles it in. Cached in
// module scope so warm lambda instances pay the disk read only once.
let cachedShell = null;
const getShell = () => {
  if (!cachedShell) {
    cachedShell = readFileSync(
      join(process.cwd(), "server-assets", "app-shell.html"),
      "utf8",
    );
  }
  return cachedShell;
};

export default async function handler(req, res) {
  const rawPath = String(req.query.path || "/");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const category =
    path === "/shop" ? String(req.query.category || "").trim() : "";
  // Whether `category` is a real leaf/parent product-type ID, not whether
  // an admin has configured an SEO override for it -- those are unrelated.
  const isValidCategory = isValidCategoryId(category);

  let shell;
  try {
    shell = getShell();
  } catch {
    res.status(503).send("Website temporarily unavailable");
    return;
  }

  let page;
  try {
    page = await resolvePage(path, category);
  } catch {
    res.setHeader("Retry-After", "300");
    res.status(503).send("Page data temporarily unavailable");
    return;
  }

  if (!page) {
    const title = "Page Not Found | Super Merch Australia";
    const tags = `<title>${title}</title>
<meta name="description" content="The requested page could not be found.">
<meta name="robots" content="noindex, follow">`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(404).send(injectHead(shell, tags));
    return;
  }

  // Faceted/filtered /shop URLs (color, size, price, etc.) are thin,
  // largely duplicate variants of the canonical category view — keep them
  // out of the index while /shop and /shop?category=X stay indexable. Must
  // match the client-side robots decision in src/components/Common/RouteSeo.jsx.
  // A category value that isn't a real leaf/parent ID (typos, arbitrary
  // input) must never become indexable -- that would let unlimited junk
  // category URLs consume crawl budget and appear as thin/duplicate pages,
  // which is the same problem this PR exists to fix, not solve.
  if (path === "/shop") {
    page.robots =
      hasShopFilterParams(req.query) || (category && !isValidCategory)
        ? "noindex, follow"
        : "index, follow";
  }

  // An invalid /shop?category=X value must never be indexable, even if a
  // stale or mistaken admin SEO override exists for that exact entityId --
  // otherwise its canonicalUrl could win below and reintroduce the SSR/CSR
  // disagreement the validity check exists to prevent.
  const override =
    path === "/shop" && category && !isValidCategory
      ? null
      : await fetchSeoOverride(page.entityType, page.entityId);
  const title = cleanText(override?.metaTitle) || page.title;
  const description =
    truncateAtWordBoundary(cleanText(override?.metaDescription), 160) || page.description;
  const socialTitle = cleanText(override?.ogTitle) || title;
  const socialDescription =
    truncateAtWordBoundary(cleanText(override?.ogDescription), 200) || description;
  const socialImage = cleanText(override?.ogImage) || page.image;
  // A /shop?category=X view is self-canonical whenever it's a real,
  // indexable category (see the robots decision above, which already
  // excludes both faceted/filtered variants and invalid category values)
  // -- whether an admin has configured a custom SEO override for that
  // specific category is unrelated to whether the URL itself is the
  // canonical page. Collapsing to plain "/shop" here used to happen for
  // every valid category with no override (i.e. nearly all ~297 of them),
  // which told Google the real/preferred page was the generic shop listing
  // even while the robots tag said "index, follow" on this URL -- a direct
  // contradiction that actively worked against indexing the category pages
  // this endpoint exists to make crawlable. An invalid category still
  // canonicalizes to plain "/shop", since it isn't a real page of its own.
  const canonicalPath =
    path === "/shop" && category && !isValidCategory
      ? "/shop"
      : page.canonicalPath || path;
  const fallbackCanonical = `${SITE_URL}${
    canonicalPath === "/"
      ? "/"
      : canonicalPath.replace(/\/+$/, "")
  }`;
  const canonical = (() => {
    try {
      const parsed = new URL(
        cleanText(override?.canonicalUrl) || fallbackCanonical,
        SITE_URL,
      );
      parsed.protocol = "https:";
      if (parsed.hostname === "supermerch.com.au") {
        parsed.hostname = "www.supermerch.com.au";
      }
      [...parsed.searchParams.keys()].forEach((key) => {
        const normalizedKey = key.toLowerCase();
        if (
          ["page", "sort", "view", "gclid", "fbclid"].includes(normalizedKey) ||
          normalizedKey.startsWith("utm_")
        ) {
          parsed.searchParams.delete(key);
        }
      });
      parsed.hash = "";
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.replace(/\/+$/, "");
      }
      return parsed.toString();
    } catch {
      return fallbackCanonical;
    }
  })();

  const structuredData = [];
  if (path === "/") {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Super Merch",
      url: `${SITE_URL}/`,
      logo: DEFAULT_IMAGE,
      email: "Info@supermerch.com.au",
      telephone: "+61466468528",
      areaServed: "AU",
    });
  }

  if (path === "/faqs") {
    try {
      const faqPayload = await fetchJson(`${BACKEND_URL}/api/faqs/active`);
      const faqs = Array.isArray(faqPayload?.data) ? faqPayload.data : [];
      const mainEntity = faqs
        .filter((item) => cleanText(item?.question) && cleanText(item?.answer))
        .map((item) => ({
          "@type": "Question",
          name: cleanText(item.question),
          acceptedAnswer: {
            "@type": "Answer",
            text: cleanText(item.answer),
          },
        }));
      if (mainEntity.length > 0) {
        structuredData.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity,
        });
      }
    } catch {
      // FAQ content still renders client-side; omit schema if the source is down.
    }
  }

  // BlogPosting schema for individual posts (audit B5: "add proper Article
  // schema"). BlogPosting is the more specific, appropriate type for a blog
  // article vs. the generic Article/CreativeWork. Only emitted for a real
  // blog post (page.entityType === "blog" is set exclusively by the
  // blogMatch branch of resolvePage above), and skipped entirely if the
  // backend never gave us a headline/image to build it from.
  if (page.entityType === "blog" && title && socialImage) {
    const headline = title.replace(SITE_SUFFIX, "").trim() || title;
    const toIsoDate = (value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    };
    const datePublished = toIsoDate(page.datePublished);
    const dateModified = toIsoDate(page.dateModified) || datePublished;
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline,
      image: socialImage,
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
      // Matches the Organization JSON-LD emitted for the homepage above --
      // same name/logo/url, since there is no separate per-post author.
      author: {
        "@type": "Organization",
        name: "Super Merch",
        url: `${SITE_URL}/`,
      },
      publisher: {
        "@type": "Organization",
        name: "Super Merch",
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_IMAGE,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
    });
  }

  const jsonLdTags = structuredData
    .map(
      (value) =>
        `<script type="application/ld+json" data-sm-seo-jsonld="true">${JSON.stringify(value).replace(
          /</g,
          "\\u003c",
        )}</script>`,
    )
    .join("\n");

  const tags = `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${escapeHtml(page.robots || "index, follow")}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(socialTitle)}">
<meta property="og:description" content="${escapeHtml(socialDescription)}">
<meta property="og:image" content="${escapeHtml(socialImage)}">
<meta property="og:image:alt" content="${escapeHtml(title)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(socialTitle)}">
<meta name="twitter:description" content="${escapeHtml(socialDescription)}">
<meta name="twitter:image" content="${escapeHtml(socialImage)}">
<meta name="twitter:image:alt" content="${escapeHtml(title)}">
<meta name="twitter:url" content="${escapeHtml(canonical)}">
${jsonLdTags}`;

  // Real internal links from category/listing pages to their products and
  // sibling categories (audit B2). Only fetched for pages that are actually
  // indexable -- a noindex faceted/invalid-category variant gets no product
  // links, since there is nothing to gain from spending a backend call on a
  // page Google won't index anyway. STATIC_PAGES entries whose real listing
  // is "all products" (Promotional/Clothing/Headwear behave exactly like
  // plain /shop -- see src/components/shop/Cards.jsx's isTopLevel check)
  // reuse the general product feed; a real /shop?category=X leaf/parent ID
  // gets its own category-filtered feed plus sibling-category links.
  const CATALOGUE_LISTING_PATHS = new Set(["/shop", "/promotional", "/Clothing", "/Headwear"]);
  let catalogueLinks = "";
  if (CATALOGUE_LISTING_PATHS.has(path) && page.robots !== "noindex, follow") {
    const categoryForFetch = path === "/shop" && isValidCategory ? category : "";
    const products = await fetchCategoryProducts(categoryForFetch);
    const siblingCategories = categoryForFetch ? buildSiblingCategoryLinks(categoryForFetch) : [];
    catalogueLinks = renderCatalogueLinks(products, siblingCategories);
  } else if (path === "/all-blogs") {
    // Audit B5: the blog index rendered zero <a href="/blogs..."> links in
    // its raw HTML -- server-render the real post list here, same as the
    // catalogue links above, so posts are actually discoverable off the JS
    // render path. Fails gracefully (empty links, no page-level failure) if
    // the blog list endpoint is unreachable -- see fetchBlogPosts().
    const posts = await fetchBlogPosts();
    catalogueLinks = renderBlogListLinks(posts);
  }

  const displayName = title.replace(SITE_SUFFIX, "").trim() || title;
  const breadcrumbItems = buildBreadcrumbItems(path, page.entityType, displayName);
  const bodyContent = renderPageBody({
    path,
    displayName,
    description,
    breadcrumbItems,
    catalogueLinks,
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(injectBody(injectHead(shell, tags), bodyContent));
}
