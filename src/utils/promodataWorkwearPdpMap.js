import { getCategoryMeta } from "@/utils/categoryMeta";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const SIZE_SKIP = new Set(["FRE", "FREE", "ONE SIZE"]);

function normalizeSizeToken(sz) {
  if (sz == null) return "";
  if (typeof sz === "string") return sz.trim();
  return String(sz.name ?? sz.size ?? sz.label ?? sz.code ?? "").trim();
}

function dedupeSizesPreserve(list) {
  const seen = new Set();
  const out = [];
  for (const s of list) {
    const n = String(s).trim();
    if (!n || SIZE_SKIP.has(n.toUpperCase())) continue;
    const k = n.toUpperCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(n);
  }
  return out;
}

function sizesFromColourEntry(entry) {
  if (!entry) return [];
  let raw = entry.sizes;
  if (!Array.isArray(raw) && Array.isArray(entry.available_sizes)) {
    raw = entry.available_sizes;
  }
  if (!Array.isArray(raw)) return [];
  return dedupeSizesPreserve(raw.map(normalizeSizeToken).filter(Boolean));
}

function sizesFromProductRoot(product) {
  if (!product || typeof product !== "object") return [];
  const raw = product.sizes || product.available_sizes || product.size_options;
  if (!Array.isArray(raw)) return [];
  return dedupeSizesPreserve(raw.map(normalizeSizeToken).filter(Boolean));
}

function unionSizesFromAllColourEntries(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const entry of list) {
    for (const s of sizesFromColourEntry(entry)) {
      const k = s.toUpperCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

/** Sizes from product details / description (no colour.list merge). */
function extractSizesFromDetailsAndDescription(productData) {
  const details = productData?.product?.details || [];
  const sizeDetail = details.find((d) => {
    const n = String(d?.name || "").toLowerCase().trim();
    return (
      ["sizing", "sizes", "size", "product sizes"].includes(n) ||
      n === "product size" ||
      (n.includes("size") && !n.includes("case") && !n.includes("box"))
    );
  });
  const detailString = sizeDetail?.detail || "";

  let headerSizes = String(detailString)
    .split("\n")[0]
    .split(/[|,;:]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (headerSizes.length === 1 && headerSizes[0].includes(",")) {
    headerSizes = headerSizes[0].split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (headerSizes.length > 0) {
    return dedupeSizesPreserve(headerSizes);
  }

  const description = productData?.product?.description || "";
  const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);
  if (!sizesMatch) return [];

  const sizesString = sizesMatch[1].trim();
  if (sizesString.includes(" - ")) {
    const [start, end] = sizesString.split(" - ").map((s) => s.trim());
    const startIndex = SIZE_ORDER.indexOf(start);
    const endIndex = SIZE_ORDER.indexOf(end);
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      return SIZE_ORDER.slice(startIndex, endIndex + 1);
    }
    return dedupeSizesPreserve([sizesString]);
  }

  return dedupeSizesPreserve(
    sizesString
      .split(/[|,;:]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * All sizes we can infer for the product (colour rows first — PromoData V2
 * often stores sizes on `product.colours.list[].sizes`).
 */
export function extractSizesFromProduct(productData) {
  const product = productData?.product || {};
  const fromColours = unionSizesFromAllColourEntries(product.colours?.list);
  if (fromColours.length > 0) return fromColours;
  const fromRoot = sizesFromProductRoot(product);
  if (fromRoot.length > 0) return fromRoot;
  return extractSizesFromDetailsAndDescription(productData);
}

/**
 * Prefer sizes on the selected colour row; fall back to global extraction.
 */
export function extractSizesForSelectedColor(singleProduct, selectedColorId) {
  const list = singleProduct?.product?.colours?.list;
  const m = /^c(\d+)$/.exec(String(selectedColorId || ""));
  if (m && Array.isArray(list)) {
    const entry = list[Number(m[1])];
    const fromColour = sizesFromColourEntry(entry);
    if (fromColour.length > 0) return fromColour;
  }
  return extractSizesFromProduct(singleProduct);
}

function resolveImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return (
    image.url ||
    image.original ||
    image.large_square ||
    image.medium_square ||
    image.small_square ||
    ""
  );
}

function normalizedImageList(singleProduct) {
  const product = singleProduct?.product || {};
  const primary = Array.isArray(product?.images)
    ? product.images.map(resolveImageUrl).filter(Boolean)
    : [];

  const fallback = Array.isArray(product?.image_data)
    ? product.image_data.map((img) => resolveImageUrl(img?.original || img)).filter(Boolean)
    : [];

  const colorImages = Array.isArray(product?.colours?.list)
    ? product.colours.list.map((colorObj) => resolveImageUrl(colorObj?.image)).filter(Boolean)
    : [];

  const heroImage = resolveImageUrl(singleProduct?.overview?.hero_image);

  return Array.from(new Set([...primary, ...fallback, ...colorImages, ...(heroImage ? [heroImage] : [])]));
}

function buildPriceTiers(singleProduct) {
  const priceGroups = singleProduct?.product?.prices?.price_groups || [];
  const base = priceGroups.find((g) => g?.base_price)?.base_price;
  const breaks = [...(base?.price_breaks || [])].sort((a, b) => a.qty - b.qty);
  if (!breaks.length) {
    return [{ minQuantity: 1, maxQuantity: null, unitPrice: 0 }];
  }
  return breaks.map((b, i) => {
    const next = breaks[i + 1];
    return {
      minQuantity: b.qty,
      maxQuantity: next ? next.qty - 1 : null,
      unitPrice: Number(b.price) || 0,
    };
  });
}

function normalizeHexString(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/^#[0-9a-fA-F]{3,8}$/i.test(s)) return s;
  if (/^[0-9a-fA-F]{6}$/i.test(s) || /^[0-9a-fA-F]{3}$/i.test(s)) return `#${s}`;
  return null;
}

/** PromoData colour rows may carry swatch[], hexCode, etc. */
function hexesFromColourRow(c) {
  if (!c || typeof c !== "object") {
    return { primaryHexCode: null, secondaryHexCode: null };
  }
  const direct =
    normalizeHexString(c.hexCode) ||
    normalizeHexString(c.hex) ||
    normalizeHexString(c.primaryHex) ||
    normalizeHexString(c.primary_hex) ||
    normalizeHexString(c.color_hex);
  const directSecond =
    normalizeHexString(c.secondaryHexCode) ||
    normalizeHexString(c.secondary_hex);
  if (direct) {
    return {
      primaryHexCode: direct,
      secondaryHexCode:
        directSecond && directSecond !== direct ? directSecond : null,
    };
  }
  const sw = c.swatch;
  if (Array.isArray(sw) && sw.length) {
    const p = normalizeHexString(sw[0]);
    const s = normalizeHexString(sw[1]);
    if (p) {
      return {
        primaryHexCode: p,
        secondaryHexCode: s && s !== p ? s : null,
      };
    }
  }
  return { primaryHexCode: null, secondaryHexCode: null };
}

function colorList(singleProduct) {
  const list = singleProduct?.product?.colours?.list;
  if (!Array.isArray(list) || !list.length) return [];
  return list.map((c, idx) => {
    const { primaryHexCode, secondaryHexCode } = hexesFromColourRow(c);
    return {
      id: `c${idx}`,
      name: c.name || (Array.isArray(c.colours) ? c.colours.join(" / ") : `Color ${idx + 1}`),
      primaryHexCode,
      secondaryHexCode,
      _raw: c,
    };
  });
}

/**
 * Maps PromoData `single-product` payload + v1 categories to the shape consumed by
 * Workwear-style PDP components (gallery, ProductInfo, tabs).
 */
export function mapSingleProductToWorkwearModel(singleProduct, v1categories = []) {
  const product = singleProduct?.product || {};
  const productId = singleProduct?.meta?.id || "";
  const overview = singleProduct?.overview || {};
  const categoryGroupId = product?.categorisation?.promodata_product_type?.type_group_id || "";
  const catMeta = getCategoryMeta(categoryGroupId, v1categories);
  const images = normalizedImageList(singleProduct);
  const colors = colorList(singleProduct);
  const tiers = buildPriceTiers(singleProduct);
  const materials = Array.isArray(product?.materials)
    ? product.materials
    : [];
  const details = product?.details || [];
  const fabricDetail = details.find((d) => String(d?.name || "").toLowerCase().includes("fabric"));
  const originDetail = details.find((d) => String(d?.name || "").toLowerCase().includes("origin"));
  const commodityDetail = details.find((d) =>
    String(d?.name || "").toLowerCase().includes("commodity"),
  );

  const slug =
    String(product?.name || "product")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "product";

  return {
    id: productId,
    slug,
    name: product.name || overview.name || "Product",
    productCode: product.code || overview.sku_number || String(productId),
    primaryImage: { imageUrl: images[0] || "" },
    availableColors: colors,
    priceTiers: tiers,
    mainCategory: {
      name: catMeta?.name || catMeta?.label || "Products",
      slug: catMeta?.slug || catMeta?.id || "all",
    },
    materials,
    materialDescription: product.description_plain || "",
    description: product.description || "",
    features: (() => {
      const raw = product.description || "";
      return String(raw)
        .split(/\n+/)
        .map((s) => s.replace(/^[\s\-*•]+/, "").trim())
        .filter(Boolean)
        .slice(0, 20);
    })(),
    fabricWeight: fabricDetail?.detail || "N/A",
    countryOfOrigin: originDetail?.detail || "N/A",
    commodityCode: commodityDetail?.detail || "N/A",
    brand: null,
    brandSlug: null,
    brandLogo: null,
    rating: 0,
    reviews: 0,
    isNew: false,
    isClearance: Boolean(singleProduct?.clearanceInfo?.isActive),
    isFeatured: false,
    isBestSelling: false,
    isFasterDispatch: false,
    isVatFree: false,
    inStock: true,
    totalStock: 999,
    specialTags: singleProduct?.specialTags || [],
    customizationMethods: [],
  };
}

/** Max units per size in the clothing PDP UI (no live stock gate on sizes). */
const CLOTHING_PDP_SIZE_LINE_CAP = 999_999;

export function buildColorVariants(singleProduct, selectedColorId, sizes, _stockTotal = null) {
  const product = singleProduct?.product || {};
  const productId = singleProduct?.meta?.id || "";
  const colors = colorList(singleProduct);
  const images = normalizedImageList(singleProduct);
  const colorEntry = colors.find((c) => c.id === selectedColorId) || colors[0];
  const raw = colorEntry?._raw;
  const hero = resolveImageUrl(raw?.image);
  const urls = Array.from(new Set([hero, ...images].filter(Boolean)));
  const imageObjs = urls.map((url) => ({ url }));

  const sizesWithStock = sizes.map((name, idx) => ({
    size: { id: idx + 1, name: String(name) },
    variantId: `${productId}-${colorEntry?.id || "c0"}-${name}`,
    sku: singleProduct?.overview?.sku_number || product.code || String(productId),
    priceAdjustment: 0,
    stock: CLOTHING_PDP_SIZE_LINE_CAP,
    stockQty: CLOTHING_PDP_SIZE_LINE_CAP,
    isAvailable: true,
  }));

  return {
    images: imageObjs.length ? imageObjs : [{ url: images[0] || "" }],
    sizesWithStock,
  };
}

export function getDefaultPrintMethod(singleProduct) {
  const priceGroups = singleProduct?.product?.prices?.price_groups || [];
  const basePriceData = priceGroups.find((group) => group?.base_price)?.base_price;
  if (!basePriceData) return null;
  return {
    ...basePriceData,
    type: "base",
  };
}

export function getPriceForQuantity(quantity, priceBreaks) {
  if (!priceBreaks?.length) return 0;
  const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (quantity >= sorted[i].qty) return sorted[i].price;
  }
  return sorted[0]?.price || 0;
}
