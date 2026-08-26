import { colornames } from "color-name-list";

/**
 * "The first price group" and "the price" are not the same thing.
 *
 * Eight catalogue products carry an empty first group — or a full ladder of
 * zeros — with the real price sitting in a later one. Every surface that read
 * the first group and found nothing concluded the product had no price and
 * showed Contact Us, even though it is perfectly sellable. Podium Kids S/S
 * Poly Polo has four empty groups before the $8.80 one.
 *
 * So: a usable break is a finite price above zero, and it counts wherever on
 * the product it happens to live.
 */
const usableBreakPrices = (product) =>
  (product?.product?.prices?.price_groups || [])
    .flatMap((group) => group?.base_price?.price_breaks || [])
    .map((priceBreak) => Number(priceBreak?.price))
    .filter((price) => Number.isFinite(price) && price > 0);

/**
 * The first base-price group that actually carries a price. Callers used
 * `find((group) => group?.base_price)`, which stops at the first group that
 * merely HAS the block — including an empty one — and then reads 0 out of it.
 */
export const getPricedBaseGroup = (product) =>
  (product?.product?.prices?.price_groups || []).find((group) =>
    (group?.base_price?.price_breaks || []).some((priceBreak) => {
      const price = Number(priceBreak?.price);
      return Number.isFinite(price) && price > 0;
    }),
  ) || null;

/** The cheapest real base price on the product, or null if it has none. */
export const getMinUsableBasePrice = (product) => {
  const prices = usableBreakPrices(product);
  return prices.length ? Math.min(...prices) : null;
};

/**
 * The single definition of "we cannot price this, ask us".
 *
 * There were four slightly different versions of this test across the cards,
 * the carousel and the two product pages, which is how the promotional page
 * came to disagree with its own quote modal. One fact, one function.
 *
 * `pricingSummary.isPriceOnApplication` is authoritative but only exists once
 * backend #86 ships; until then the break check is what actually fires.
 */
export const isProductPriceOnApplication = (product) =>
  product?.pricingSummary?.isPriceOnApplication === true ||
  getMinUsableBasePrice(product) === null;


export const getProductPrice = (product, id,isClothing) => {
  const summaryFinal = Number(product?.pricingSummary?.finalMinPrice);
  if (Number.isFinite(summaryFinal) && summaryFinal > 0) {
    return Number(summaryFinal.toFixed(2));
  }

  const priceGroups = product?.product?.prices?.price_groups || [];
  const additionalPrice =
    priceGroups.find((group) => group?.additions?.length > 0) || {};
  const firstPrintPrice = additionalPrice?.additions?.[0]?.price_breaks
  // Deliberately still ONE group's ladder, not the cheapest across all of
  // them — widening it would quietly restate prices on the 8,969 multi-group
  // products. The only change is which group: the first that actually
  // carries a price rather than the first that merely has the block.
  const basePrice = getPricedBaseGroup(product) || {};
  const priceBreaks = basePrice.base_price?.price_breaks || [];
  // Filtering to positive prices, not merely defined ones. Choosing a group
  // because it holds at least one real price does not stop `Math.min` picking
  // a zero that sits alongside it: a ladder of [0, 5.00] would classify as
  // priced and still display $0.00.
  //
  // No product is shaped that way today — measured across all 53,289, so this
  // is a provable no-op rather than a behaviour change — but the zeros in this
  // feed currently sit in their own groups by luck, not by rule.
  const prices = priceBreaks
    .map((breakItem) => Number(breakItem.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  let minPrice = prices.length > 0 ? Math.min(...prices) + ( isClothing ? 8 : (firstPrintPrice ? (firstPrintPrice[firstPrintPrice.length-1]?.price || 0) : 0)) : 0;
  let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  // Convert to USD (assuming the price is in AUD, using approximate conversion rate)

  return Number(minPrice?.toFixed(2));
};

export const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    // replace any sequence of non-alphanumeric chars with a single hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // remove leading/trailing hyphens
    .replace(/(^-|-$)/g, "");

/**
 * Generate product URL using slug only (no query parameters)
 * This creates clean, shareable URLs like /product/shirt-jacket-unisex
 */
export const toProductUrl = (productName, id) => {
  if (!productName) return "/";
  const base = `/product/${slugify(productName)}`;
  const normalizedId =
    id !== undefined && id !== null ? String(id).trim() : "";
  return normalizedId ? `${base}/${encodeURIComponent(normalizedId)}` : base;
};

export const findNearestColor = (colorName) => {
  if (!colorName || typeof colorName !== "string") {
    return null;
  }

  const normalizedColorName = colorName.toLowerCase().trim();

  // Strategy 1: Exact match (case-insensitive)
  let match = colornames.find(
    (item) => item?.name?.toLowerCase() === normalizedColorName
  );
  if (match) return match;

  // Strategy 2: Contains match (color name contains search term or vice versa)
  match = colornames.find(
    (item) =>
      item?.name?.toLowerCase().includes(normalizedColorName) ||
      normalizedColorName.includes(item?.name?.toLowerCase())
  );
  if (match) return match;

  // Strategy 3: Fuzzy match using word similarity
  // Split color name into words and find matches
  const colorWords = normalizedColorName.split(/\s+/);
  match = colornames.find((item) => {
    if (!item?.name) return false;
    const itemName = item.name.toLowerCase();
    return colorWords.some(
      (word) =>
        itemName.includes(word) ||
        (word.length > 3 &&
          itemName.includes(word.substring(0, word.length - 1)))
    );
  });
  if (match) return match;

  // Strategy 4: Find color by similarity using Levenshtein-like distance
  // Simple character overlap matching
  let bestMatch = null;
  let bestScore = 0;

  colornames.forEach((item) => {
    if (!item?.name) return;
    const itemName = item.name.toLowerCase();

    // Calculate similarity score based on common characters
    let score = 0;
    const minLength = Math.min(normalizedColorName.length, itemName.length);
    const maxLength = Math.max(normalizedColorName.length, itemName.length);

    // Count matching characters at same positions
    for (let i = 0; i < minLength; i++) {
      if (normalizedColorName[i] === itemName[i]) {
        score += 2;
      }
    }

    // Count common characters (case-insensitive)
    const colorChars = normalizedColorName.split("");
    const itemChars = itemName.split("");
    colorChars.forEach((char) => {
      if (itemChars.includes(char)) {
        score += 1;
      }
    });

    // Normalize score by length
    score = score / maxLength;

    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (bestMatch) return bestMatch;

  // Strategy 5: Try to match common color variations
  const colorVariations = {
    navy: "navy blue",
    burgundy: "burgundy",
    charcoal: "charcoal gray",
    khaki: "khaki",
    coral: "coral",
  };

  const variationMatch = colornames.find((item) => {
    const itemName = item?.name?.toLowerCase();
    const variation = colorVariations[normalizedColorName];
    return variation && itemName?.includes(variation);
  });
  if (variationMatch) return variationMatch;

  // Strategy 6: Try common color name mappings
  const commonMappings = {
    blk: "black",
    wht: "white",
    grn: "green",
    blu: "blue",
    red: "red",
    yel: "yellow",
    org: "orange",
    pur: "purple",
    pnk: "pink",
    brn: "brown",
    gry: "gray",
    gld: "gold",
    slv: "silver",
  };

  if (commonMappings[normalizedColorName]) {
    match = colornames.find(
      (item) =>
        item?.name?.toLowerCase() === commonMappings[normalizedColorName]
    );
    if (match) return match;
  }

  // Strategy 7: Fallback - return a gray color if no match found
  return { name: colorName, hex: "#9ca3af" }; // Default gray color
};

export const backgroundColor = (color) =>
  color
    .toLowerCase()
    // Blues

    .replace("navy", "#1e40af")

    // Greys/Neutrals

    .replace("grey", "#6b7280")
    .replace("gray", "#6b7280")
    .replace("charcoal", "#374151")
    .replace("carbon", "#1f2937")
    .replace("gunmetal", "#2a3439")
    .replace("slate", "#64748b")
    .replace("stone", "#78716c")
    .replace("zinc", "#71717a")
    .replace("neutral", "#737373")
    .replace("taupe", "#b8860b")

    // Greens

    .replace("mint", "#10b981")
    .replace("sage", "#9ca3af")
    .replace("kiwi", "#8fbc8f")
    .replace("khaki", "#bdb76b")
    .replace("teal", "#0d9488")
    .replace("emerald", "#10b981")

    // Reds/Pinks

    .replace("burgundy", "#7f1d1d")
    .replace("red", "#ef4444")
    .replace("pink", "#ec4899")
    .replace("coral", "#ff7f7f")
    .replace("berry", "#8b0000")
    .replace("maroon", "#7f1d1d")
    .replace("rose", "#f43f5e")
    .replace("fuchsia", "#d946ef")

    // Oranges/Yellows
    .replace("orange", "#f97316")
    .replace("yellow", "#eab308")
    .replace("mustard", "#ffdb58")
    .replace("rust", "#b7410e")
    .replace("amber", "#f59e0b")

    // Purples
    .replace("lavender", "#c084fc")
    .replace("violet", "#8b5cf6")
    .replace("indigo", "#6366f1")
    .replace("purple", "#a855f7")
    .replace("mauve", "#dda0dd")

    // Browns/Beiges
    .replace("cream", "#fef3c7")
    .replace("beige", "#f5f5dc")
    .replace("ecru", "#c2b280")
    .replace("tan", "#d2b48c")
    .replace("brown", "#92400e")

    // Other colors
    .replace("turquoise", "#06b6d4")
    .replace("aqua", "#22d3ee")
    .replace("cyan", "#06b6d4")
    .replace("lime", "#84cc16")
    .replace("white", "#ffffff")
    .replace("black", "#000000")

    .replace(" ", "") || // remove remaining spaces
  color.toLowerCase();

export const getProductCategory = (product) => {
  const productType = product?.product?.categorisation?.appa_product_type;
  if (!productType || typeof productType !== "object") {
    return null;
  }
  // Get the first key from the object
  const categories = Object.keys(productType);
  return categories.length > 0 ? categories[0] : null;
};

export const isProductCategory = (product, categoryName) => {
  const productType = product?.product?.categorisation?.appa_product_type;
  const category = getProductCategory(product);
  return category?.toLowerCase() === categoryName?.toLowerCase();
};

export const getProductSupplier = (product) => {
  const supplier = product?.supplier?.supplier;
  return supplier;
};

export const getClothingPricing = (printMethodDescription) => {
  if (!printMethodDescription || typeof printMethodDescription !== "string") {
    return { perUnitCost: 0, setupFee: 0 };
  }

  // Clean the description by removing setup cost info
  const cleanDesc = printMethodDescription
    .replace(/\s*-\s*set\s*up.*$/i, "")
    .trim()
    .toLowerCase();

  // Map of clothing print methods to their pricing
  // perUnitCost: Added to each unit price
  // setupFee: One-time setup charge
  const clothingPricingMap = {
    "pocket size front print": { perUnitCost: 8, setupFee: 29 },
    "pocket size front embroidery": { perUnitCost: 8, setupFee: 49 },
    "big print in back": { perUnitCost: 10, setupFee: 29 },
    "pocket size front + big print back": { perUnitCost: 15, setupFee: 49 },
    unbranded: { perUnitCost: 0, setupFee: 0 },
  };

  // Return the mapped pricing or default values if not found
  return clothingPricingMap[cleanDesc] || { perUnitCost: 0, setupFee: 0 };
};

export const getClothingAdditionalCost = (printMethodDescription) => {
  return getClothingPricing(printMethodDescription).perUnitCost;
};

export const is24HrProduct = (product) => {
  if (product?.supplier?.supplier === "Promo Brands") return false;

  const groups = product?.product?.prices?.price_groups ?? [];
  if (!Array.isArray(groups) || groups.length === 0) return false;

  const re = /(same\s*-?\s*day|24\s*hrs?|24\s*hours?)/i;

  return groups.some((g) => {
    // check base_price.lead_time
    if (re.test(String(g?.base_price?.lead_time ?? ""))) return true;

    // check additions[].lead_time
    if (Array.isArray(g?.additions)) {
      if (g.additions.some((a) => re.test(String(a?.lead_time ?? ""))))
        return true;
    }

    return false;
  });
};
