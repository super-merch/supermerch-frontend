// @vitest-environment jsdom

/**
 * src/redux/middleware/analyticsMiddleware.js
 *
 * Proves that dispatching the real, shared `cart/addToCart` redux action
 * (the same action creator every add-to-cart call site in the app uses)
 * results in exactly one trackAddToCart() call with the correct product
 * id/name/price/quantity mapped from the action payload.
 */

import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trackAddToCartMock = vi.fn();

vi.mock("../lib/analytics", () => ({
  trackAddToCart: (...args) => trackAddToCartMock(...args),
}));

import cartReducer, { addToCart } from "../redux/slices/cartSlice";
import { analyticsMiddleware } from "../redux/middleware/analyticsMiddleware";

const buildStore = () =>
  configureStore({
    reducer: { cart: cartReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(analyticsMiddleware),
  });

beforeEach(() => {
  trackAddToCartMock.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("(g) analyticsMiddleware add-to-cart payload", () => {
  it("fires exactly once with correct id/name/price/quantity for a regular product", () => {
    const store = buildStore();

    store.dispatch(
      addToCart({
        id: "prod-42",
        name: "Custom Tote Bag",
        price: 12.5,
        quantity: 3,
        userEmail: "shopper@example.com",
      }),
    );

    expect(trackAddToCartMock).toHaveBeenCalledTimes(1);
    expect(trackAddToCartMock).toHaveBeenCalledWith({
      id: "prod-42",
      name: "Custom Tote Bag",
      price: 12.5,
      quantity: 3,
      currency: "AUD",
    });
  });

  it("falls back to the deal name and multiplier-as-quantity for a deal line item", () => {
    const store = buildStore();

    store.dispatch(
      addToCart({
        id: "deal-7",
        itemType: "deal",
        deal: { name: "3-Piece Starter Pack" },
        price: 49.99,
        multiplier: 2,
        userEmail: "shopper@example.com",
      }),
    );

    expect(trackAddToCartMock).toHaveBeenCalledTimes(1);
    expect(trackAddToCartMock).toHaveBeenCalledWith({
      id: "deal-7",
      name: "3-Piece Starter Pack",
      price: 49.99,
      quantity: 2,
      currency: "AUD",
    });
  });

  it("does not fire trackAddToCart for unrelated cart actions", () => {
    const store = buildStore();

    store.dispatch({ type: "cart/removeFromCart", payload: { id: "prod-42" } });

    expect(trackAddToCartMock).not.toHaveBeenCalled();
  });

  it("fires once per dispatch across multiple add-to-cart calls (no duplication, no missed calls)", () => {
    const store = buildStore();

    store.dispatch(addToCart({ id: "a", name: "Pen", price: 1, quantity: 10 }));
    store.dispatch(addToCart({ id: "b", name: "Mug", price: 8, quantity: 1 }));

    expect(trackAddToCartMock).toHaveBeenCalledTimes(2);
    expect(trackAddToCartMock).toHaveBeenNthCalledWith(1, {
      id: "a",
      name: "Pen",
      price: 1,
      quantity: 10,
      currency: "AUD",
    });
    expect(trackAddToCartMock).toHaveBeenNthCalledWith(2, {
      id: "b",
      name: "Mug",
      price: 8,
      quantity: 1,
      currency: "AUD",
    });
  });
});
