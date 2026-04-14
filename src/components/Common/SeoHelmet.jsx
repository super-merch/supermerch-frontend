import React from "react";
import { Helmet } from "react-helmet-async";
import useSeoMeta from "../../hooks/useSeoMeta";

const SeoHelmet = ({ entityType, entityId, fallback = {} }) => {
  const { seoData } = useSeoMeta(entityType, entityId);

  const title = seoData?.metaTitle || fallback.title;
  const description = seoData?.metaDescription || fallback.description;
  const keywords = seoData?.keywords || fallback.keywords;
  const ogTitle = seoData?.ogTitle || title;
  const ogDescription = seoData?.ogDescription || description;
  const ogImage = seoData?.ogImage || fallback.ogImage;
  const canonicalUrl = seoData?.canonicalUrl || fallback.canonicalUrl;
  const computedCanonical =
    canonicalUrl ||
    (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");

  const ogUrl = fallback.ogUrl || computedCanonical;
  const ogType = fallback.ogType || "website";
  const twitterCard = fallback.twitterCard || "summary_large_image";
  const siteName = fallback.siteName || "Super Merch";
  const robots = fallback.robots || "index, follow";

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {robots && <meta name="robots" content={robots} />}

      {computedCanonical && <link rel="canonical" href={computedCanonical} />}

      {ogType && <meta property="og:type" content={ogType} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && (
        <meta property="og:description" content={ogDescription} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {siteName && <meta property="og:site_name" content={siteName} />}

      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && (
        <meta name="twitter:description" content={ogDescription} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SeoHelmet;
