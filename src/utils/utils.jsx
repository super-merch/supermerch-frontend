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

  minPrice += marginFlat;
  maxPrice += marginFlat;

  return minPrice;
};

export const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    // replace any sequence of non-alphanumeric chars with a single hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // remove leading/trailing hyphens
    .replace(/(^-|-$)/g, "");
