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

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
        cleanText(collection.shortDescription).slice(0, 160) ||
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
        cleanText(deal.description).slice(0, 160) ||
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
        cleanText(blog.metaDescription || blog.shortDescription || blog.content).slice(0, 160) ||
        `Read ${title} from Super Merch Australia.`,
      image:
        cleanText(blog.ogImage || blog.image?.url || blog.image || blog.images?.[0]?.url) ||
        DEFAULT_IMAGE,
      robots: wordCount(blog.content) >= 300 ? "index, follow" : "noindex, follow",
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
        cleanText(page.metaDescription || page.description || page.content).slice(0, 160) ||
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

export default async function handler(req, res) {
  const rawPath = String(req.query.path || "/");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const category =
    path === "/shop" ? String(req.query.category || "").trim() : "";

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

  const override = await fetchSeoOverride(page.entityType, page.entityId);
  const title = cleanText(override?.metaTitle) || page.title;
  const description =
    cleanText(override?.metaDescription).slice(0, 160) || page.description;
  const socialTitle = cleanText(override?.ogTitle) || title;
  const socialDescription =
    cleanText(override?.ogDescription).slice(0, 200) || description;
  const socialImage = cleanText(override?.ogImage) || page.image;
  const canonicalPath =
    path === "/shop" && category && !override ? "/shop" : page.canonicalPath;
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

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(injectHead(shell, tags));
}
