import React from "react";
import { Helmet } from "react-helmet-async";
import useSeoMeta from "../../hooks/useSeoMeta";

const SeoHelmet = ({ entityType, entityId, fallback = {} }) => {
  const { seoData } = useSeoMeta(entityType, entityId);

  const title = seoData?.metaTitle || fallback.title;
  const description = seoData?.metaDescription || fallback.description;
  const keywords = seoData?.keywords;
  const ogTitle = seoData?.ogTitle || title;
  const ogDescription = seoData?.ogDescription || description;
  const ogImage = seoData?.ogImage;
  const canonicalUrl = seoData?.canonicalUrl;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && (
        <meta property="og:description" content={ogDescription} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};

export default SeoHelmet;
