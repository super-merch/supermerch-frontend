import { AppContext } from "@/context/AppContext";
import { useContext } from "react";

export const getProductPrice = (product, id) => {
  const { marginApi } = useContext(AppContext);

  const priceGroups = product?.product?.prices?.price_groups || [];
  const basePrice = priceGroups.find((group) => group?.base_price) || {};
  const priceBreaks = basePrice.base_price?.price_breaks || [];
  const prices = priceBreaks
    .map((breakItem) => breakItem.price)
    .filter((price) => price !== undefined);
  let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  // Convert to USD (assuming the price is in AUD, using approximate conversion rate)
  const productId = id ?? product?.meta?.id;
  const marginEntry = marginApi[productId] || {};
  const marginFlat =
    typeof marginEntry.marginFlat === "number" ? marginEntry.marginFlat : 0;
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
