import { useEffect } from "react";
import PropTypes from "prop-types";
import useSeoMeta from "../../hooks/useSeoMeta";

const SITE_URL = "https://www.supermerch.com.au";

/**
 * Force every canonical / og:url onto the one canonical host.
 *
 * The site is served from www.supermerch.com.au and the apex domain only
 * redirects to it. A canonical pointing at the apex tells Google to index a
 * URL that redirects, which is what caused the July 2026 indexing failure.
 * Many seo-meta records still store apex URLs, so we normalise here rather
 * than trusting the stored value.
 */
const toCanonicalUrl = (value, pathname) => {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/");

  let url =
    value && String(value).trim() ? String(value).trim() : `${SITE_URL}${path}`;

  // Make relative values absolute.
  if (url.startsWith("/")) url = `${SITE_URL}${url}`;

  try {
    const parsed = new URL(url);
    parsed.protocol = "https:";
    if (parsed.hostname === "supermerch.com.au") {
      parsed.hostname = "www.supermerch.com.au";
    }
    // Canonicals should be clean: no query string, no fragment.
    parsed.search = "";
    parsed.hash = "";
    // Strip a trailing slash except on the root.
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return `${SITE_URL}${path}`;
  }
};

/**
 * Create or update a meta tag.
 *
 * index.html ships some tags as property= and some as name=. We reuse
 * whichever already exists so we update the static tag instead of appending
 * a duplicate beside it.
 */
const setMeta = (attr, key, content) => {
  if (typeof document === "undefined") return;

  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    const other = attr === "name" ? "property" : "name";
    el = document.head.querySelector(`meta[${other}="${key}"]`);
  }

  if (!content) {
    // Only remove tags this component created; leave the static ones alone.
    if (el && el.dataset.smSeo === "true") el.remove();
    return;
  }

  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.dataset.smSeo = "true";
    document.head.appendChild(el);
  }

  el.setAttribute("content", content);
};

const setCanonical = (href) => {
  if (typeof document === "undefined" || !href) return;

  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/**
 * Applies per-page SEO tags directly to <head>.
 *
 * This previously rendered <Helmet> from react-helmet-async. The component
 * was mounting correctly (the seo-meta request fired on every route) but
 * Helmet never wrote anything to the document, so every page kept the static
 * tags from index.html and served the homepage title, description and
 * canonical. Writing the tags in an effect is deterministic, needs no
 * provider, and drops the dependency.
 *
 * Props are unchanged, so no call site needs editing.
 */
const SeoHelmet = ({
  entityType,
  entityId,
  fallback = {},
  structuredData = [],
  forceCanonicalUrl,
}) => {
  const { seoData } = useSeoMeta(entityType, entityId);

  const title = seoData?.metaTitle || fallback.title || "";
  const description = seoData?.metaDescription || fallback.description || "";
  const keywords = seoData?.keywords || fallback.keywords || "";
  const ogTitle = seoData?.ogTitle || title;
  const ogDescription = seoData?.ogDescription || description;
  const ogImage = seoData?.ogImage || fallback.ogImage || "";
  const ogType = fallback.ogType || "website";
  const siteName = fallback.siteName || "Super Merch";
  const robots = fallback.robots || "index, follow";
  const canonical = toCanonicalUrl(
    forceCanonicalUrl || seoData?.canonicalUrl || fallback.canonicalUrl
  );

  useEffect(() => {
    if (title) document.title = title;

    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "robots", robots);

    setCanonical(canonical);

    setMeta("property", "og:title", ogTitle);
    setMeta("property", "og:description", ogDescription);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", siteName);

    setMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", ogTitle);
    setMeta("name", "twitter:description", ogDescription);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:url", canonical);

    document.head.querySelectorAll('script[data-sm-seo-jsonld="true"]').forEach((node) => node.remove());
    structuredData.filter(Boolean).forEach((value) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.smSeoJsonld = "true";
      script.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    });

    return () => {
      document.head.querySelectorAll('script[data-sm-seo-jsonld="true"]').forEach((node) => node.remove());
    };
  }, [
    title,
    description,
    keywords,
    robots,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    siteName,
    structuredData,
  ]);

  return null;
};

SeoHelmet.propTypes = {
  entityType: PropTypes.string,
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fallback: PropTypes.object,
  structuredData: PropTypes.arrayOf(PropTypes.object),
  forceCanonicalUrl: PropTypes.string,
};

export default SeoHelmet;
