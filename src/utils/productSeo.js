const SITE_URL = "https://www.supermerch.com.au";
const DEFAULT_DESCRIPTION =
  "Custom branded promotional products from Super Merch Australia, with bulk pricing and Australia-wide delivery.";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/logo-teal.png`;
const DEFAULT_SOCIAL_IMAGE_ALT = "Super Merch Australia logo";

const firstText = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() || "";

const isTrue = (value) => value === true || String(value).toLowerCase() === "true";

const CATEGORY_ROUTES = {
  clothing: "/Clothing",
  headwear: "/Headwear",
  promotional: "/promotional",
};

export const getProductCategoryBreadcrumb = (data, categories = []) => {
  const groupId = String(
    data?.product?.categorisation?.promodata_product_type?.type_group_id || "",
  ).trim();
  if (!groupId || !Array.isArray(categories)) return null;

  const exact = categories.find((entry) => String(entry?.id || "") === groupId);
  const category =
    (exact?.navGroup ? exact : null) ||
    categories.find(
      (entry) =>
        Array.isArray(entry?.allowedTypeGroupIds) &&
        entry.allowedTypeGroupIds.map(String).includes(groupId),
    );
  const navGroup = String(category?.navGroup || "").toLowerCase().trim();
  const path = CATEGORY_ROUTES[navGroup];
  if (!path) return null;

  return {
    name: firstText(category?.name, navGroup[0].toUpperCase() + navGroup.slice(1)),
    url: `${SITE_URL}${path}`,
  };
};

export const cleanSeoText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const imageUrl = (image) => {
  if (typeof image === "string") return image.trim();
  return firstText(
    image?.url,
    image?.original,
    image?.large_square,
    image?.medium_square,
    image?.small_square,
  );
};

export const getProductSeoImages = (data) => {
  const product = data?.product || {};
  const candidates = [
    data?.overview?.hero_image,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.image_data) ? product.image_data : []),
    ...(Array.isArray(product.colours?.list)
      ? product.colours.list.map((colour) => colour?.image)
      : []),
  ];
  return [...new Set(candidates.map(imageUrl).filter(Boolean))];
};

const getLowestPrice = (data) => {
  const summaryPrice = Number(data?.pricingSummary?.finalMinPrice);
  return Number.isFinite(summaryPrice) && summaryPrice > 0 ? summaryPrice : null;
};

const getAvailability = (data) => {
  const values = [
    data?.stock,
    data?.stockQty,
    data?.totalStock,
    data?.product?.stock,
    data?.product?.stockQty,
    data?.product?.totalStock,
  ];
  const explicit = values
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(Number)
    .find(Number.isFinite);
  if (explicit === undefined) return null;
  return explicit > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
};

export const buildProductSeo = ({ data, pathname, slug, categoryBreadcrumb = null }) => {
  const product = data?.product || {};
  const overview = data?.overview || {};
  const name = firstText(product.name, overview.name, overview.originalName);
  const description = cleanSeoText(
    firstText(product.description, overview.description, product.short_description),
  );
  const images = getProductSeoImages(data);
  const productId = firstText(String(data?.meta?.id || ""), overview.sku_number, product.code);
  const sku = firstText(overview.sku_number, product.code);
  const category = firstText(
    product.categorisation?.promodata_product_type?.type_name,
    product.categorisation?.product_type?.type_name,
    product.categorisation?.supplier_category,
  );
  const brand = firstText(
    typeof product.supplier_brand === "string"
      ? product.supplier_brand
      : product.supplier_brand?.name,
    product.brand?.name,
    overview.brand,
  );
  const canonicalUrl = `${SITE_URL}${pathname || `/product/${slug || ""}`}`;
  const hasProductIdentity = Boolean(data && name && productId);
  const isDiscontinued = isTrue(data?.meta?.discontinued) || isTrue(product.discontinued);
  const displayName = name || cleanSeoText(String(slug || "").replace(/-/g, " ")) || "Promotional Product";
  const imageAlt = `${displayName}${category ? ` – ${category}` : " promotional product"}`;
  const metaDescription = (description || `${displayName}. ${DEFAULT_DESCRIPTION}`).slice(0, 160);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: description || metaDescription,
    ...(images.length ? { image: images } : {}),
    ...(sku ? { sku } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(category ? { category } : {}),
    url: canonicalUrl,
  };
  const price = getLowestPrice(data);
  if (price && !isDiscontinued) {
    productSchema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "AUD",
      price: price.toFixed(2),
      ...(getAvailability(data) ? { availability: getAvailability(data) } : {}),
    };
  }

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
  ];
  if (categoryBreadcrumb?.name && categoryBreadcrumb?.url) {
    breadcrumbs.push({
      "@type": "ListItem",
      position: 3,
      name: categoryBreadcrumb.name,
      item: categoryBreadcrumb.url,
    });
  }
  breadcrumbs.push({
    "@type": "ListItem",
    position: breadcrumbs.length + 1,
    name: displayName,
    item: canonicalUrl,
  });

  return {
    entityId: productId || slug,
    imageAlt,
    fallback: {
      title: `${displayName} | Custom Branded | Super Merch Australia`,
      description: metaDescription,
      canonicalUrl,
      ogImage: images[0] || DEFAULT_SOCIAL_IMAGE,
      ogImageAlt: images[0] ? imageAlt : DEFAULT_SOCIAL_IMAGE_ALT,
      ogType: "product",
      siteName: "Super Merch",
      robots: hasProductIdentity && !isDiscontinued ? "index, follow" : "noindex, follow",
    },
    structuredData: hasProductIdentity
      ? [
          productSchema,
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs },
        ]
      : [],
  };
};
