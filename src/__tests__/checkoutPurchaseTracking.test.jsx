// @vitest-environment jsdom

/**
 * src/components/checkout/Checkout.jsx — purchase-tracking must not be
 * gated by the unrelated loadUserOrder() account/order refresh call.
 *
 * Regression coverage for the HIGH-severity bug: previously
 * `trackPurchase()` ran only after `await loadUserOrder()` resolved, so a
 * failure in that unrelated refresh call silently dropped a real, paid
 * conversion. These tests exercise the actual post-Stripe-redirect flow
 * (Checkout mounts with `location.state.paymentSuccess`, which triggers
 * `handlePaymentSuccess()`):
 *
 * (d) a successful checkout still records the purchase event even when
 *     loadUserOrder() rejects.
 * (e) a failed checkout (backend rejects the order) never records a
 *     purchase event.
 */

import { cleanup, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("axios");

const trackPurchaseMock = vi.fn();
const trackCheckoutStartedMock = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackPurchase: (...args) => trackPurchaseMock(...args),
  trackCheckoutStarted: (...args) => trackCheckoutStartedMock(...args),
}));

// The step components pull in a lot of unrelated UI/markup we don't need to
// exercise the mount-time handlePaymentSuccess() effect under test.
vi.mock("../components/checkout/CheckoutSteps/CustomerStep", () => ({ default: () => null }));
vi.mock("../components/checkout/CheckoutSteps/ShippingStep", () => ({ default: () => null }));
vi.mock("../components/checkout/CheckoutSteps/BillingStep", () => ({ default: () => null }));
vi.mock("../components/checkout/CheckoutSteps/PaymentStep", () => ({ default: () => null }));
vi.mock("../components/checkout/CheckoutSteps/OrderSummarySidebar", () => ({ default: () => null }));

import Checkout from "../components/checkout/Checkout";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { ProductsContext } from "../context/ProductsContext";
import cartReducer from "../redux/slices/cartSlice";

const buildStore = () => configureStore({ reducer: { cart: cartReducer } });

const SESSION_ID = "cs_test_123";

const renderCheckout = ({ loadUserOrder }) => {
  const store = buildStore();
  return render(
    <AuthContext.Provider
      value={{
        token: null,
        setToken: vi.fn(),
        addressData: {},
        shippingAddressData: {},
        userData: null,
        loadUserOrder,
      }}
    >
      <AppContext.Provider
        value={{
          backendUrl: "https://backend.test",
          openLoginModal: false,
          setOpenLoginModal: vi.fn(),
          shippingCharges: 0,
          setupFee: 0,
          gstCharges: 0,
        }}
      >
        <ProductsContext.Provider value={{ totalDiscount: {} }}>
          <Provider store={store}>
            <MemoryRouter
              initialEntries={[
                {
                  pathname: "/checkout",
                  state: { paymentSuccess: true, sessionId: SESSION_ID },
                },
              ]}
            >
              <Checkout />
            </MemoryRouter>
          </Provider>
        </ProductsContext.Provider>
      </AppContext.Provider>
    </AuthContext.Provider>,
  );
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  trackPurchaseMock.mockClear();
  trackCheckoutStartedMock.mockClear();
  localStorage.setItem(
    "pendingCheckoutData",
    JSON.stringify({ total: 149.95, products: [] }),
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("(d) purchase tracking survives a failed order refresh", () => {
  it("records the purchase event even when loadUserOrder() rejects", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        checkout: {
          orderId: "ORD-1001",
          _id: "mongo-id-1",
          total: 149.95,
        },
      },
    });
    const loadUserOrder = vi.fn().mockRejectedValue(new Error("refresh failed"));

    renderCheckout({ loadUserOrder });

    await waitFor(() => expect(trackPurchaseMock).toHaveBeenCalledTimes(1));
    expect(trackPurchaseMock).toHaveBeenCalledWith({
      transactionId: "ORD-1001",
      value: 149.95,
      currency: "AUD",
    });

    // The refresh call still happens (for its own account-UI purpose) —
    // it just must not gate analytics, which the assertion above proves.
    await waitFor(() => expect(loadUserOrder).toHaveBeenCalledTimes(1));
  });

  it("records the purchase event when loadUserOrder() succeeds too (baseline)", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        checkout: {
          orderId: "ORD-1002",
          _id: "mongo-id-2",
          total: 75,
        },
      },
    });
    const loadUserOrder = vi.fn().mockResolvedValue(undefined);

    renderCheckout({ loadUserOrder });

    await waitFor(() => expect(trackPurchaseMock).toHaveBeenCalledTimes(1));
    expect(trackPurchaseMock).toHaveBeenCalledWith({
      transactionId: "ORD-1002",
      value: 75,
      currency: "AUD",
    });
  });
});

describe("(e) a failed checkout never records a purchase event", () => {
  it("does not call trackPurchase when the checkout API call itself rejects", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Payment declined" } },
    });
    const loadUserOrder = vi.fn().mockResolvedValue(undefined);

    renderCheckout({ loadUserOrder });

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    // Let the rejected promise's .catch() handler finish running.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(trackPurchaseMock).not.toHaveBeenCalled();
    expect(loadUserOrder).not.toHaveBeenCalled();
    // Failure path never clears the pending checkout data (only success does).
    expect(localStorage.getItem("pendingCheckoutData")).not.toBeNull();
  });
});
