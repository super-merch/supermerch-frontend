// src/redux/middleware/analyticsMiddleware.js
//
// Every "add to cart" call site in the app (PDP, deal detail page, sticky
// add-to-cart bar, sample ordering, etc.) dispatches the same
// `cart/addToCart` redux action. Rather than duplicate a trackAddToCart()
// call across every one of those components, we hook it once here — this
// middleware fires for every dispatch of that action, regardless of which
// component triggered it.

import { trackAddToCart } from "@/lib/analytics";

const norm = (value) => String(value ?? "").trim().toLowerCase();

export const analyticsMiddleware = () => (next) => (action) => {
  const result = next(action);

  if (action?.type === "cart/addToCart") {
    try {
      const payload = action.payload || {};
      const isDeal = norm(payload.itemType || payload.type) === "deal";
      const name = payload.name || payload.deal?.name || (isDeal ? "Deal" : "Product");

      trackAddToCart({
        id: payload.id,
        name,
        price: Number(payload.price || 0),
        quantity: Number(payload.quantity || payload.multiplier || 1),
        currency: "AUD",
      });
    } catch {
      // Analytics must never break the actual add-to-cart flow.
    }
  }

  return result;
};
