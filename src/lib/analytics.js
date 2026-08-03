// src/lib/analytics.js
//
// Thin wrapper around GA4 (gtag.js), Meta Pixel, and Microsoft Clarity.
//
// Design goals:
// - Every provider is driven entirely by env vars (VITE_GA_MEASUREMENT_ID,
//   VITE_META_PIXEL_ID, VITE_CLARITY_PROJECT_ID). If a var is unset, that
//   provider is skipped entirely — no empty/invalid tags are ever injected.
// - Scripts are loaded async and appended to <head> at runtime (never
//   render-blocking), so they cannot slow down or break checkout.
// - track* helpers are always safe to call from anywhere in the app, even
//   before init runs or when a provider isn't configured — they just check
//   for the relevant global (window.gtag / window.fbq) and no-op otherwise.
// - Disabled on localhost/dev so local testing never pollutes real analytics
//   data (matches the convention the previous inline GA snippet used).

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

const isBrowser = typeof window !== "undefined";

const isLocalDev = () => {
  if (!isBrowser) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

let initialized = false;

const appendScript = (src, extraAttrs = {}) => {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  Object.entries(extraAttrs).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  document.head.appendChild(script);
  return script;
};

const initGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  // send_page_view is handled manually via trackPageView() so SPA route
  // changes (which don't trigger a real navigation) are still recorded.
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  appendScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
};

const initMetaPixel = () => {
  if (!META_PIXEL_ID) return;

  const fbq = function (...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };
  if (!window.fbq) {
    window.fbq = fbq;
  }
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = "2.0";
  window.fbq.queue = [];
  window._fbq = window._fbq || window.fbq;

  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");

  appendScript("https://connect.facebook.net/en_US/fbevents.js");
};

const initClarity = () => {
  if (!CLARITY_PROJECT_ID) return;

  window.clarity =
    window.clarity ||
    function (...args) {
      (window.clarity.q = window.clarity.q || []).push(args);
    };

  appendScript(`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`);
};

/** Call once on app startup. Safe to call multiple times (no-ops after the first). */
export const initAnalytics = () => {
  if (!isBrowser || initialized) return;
  initialized = true;

  if (isLocalDev()) return;

  initGoogleAnalytics();
  initMetaPixel();
  initClarity();
};

/** Fire on every route change (SPA navigations don't trigger a browser page load). */
export const trackPageView = (path) => {
  if (!isBrowser) return;
  if (window.gtag) {
    window.gtag("event", "page_view", { page_path: path });
  }
  if (window.fbq) {
    window.fbq("track", "PageView");
  }
};

/**
 * Fire when a shopper adds an item to their cart.
 * @param {{ id: string|number, name: string, price: number, quantity: number, currency?: string }} item
 */
export const trackAddToCart = ({ id, name, price, quantity, currency = "AUD" }) => {
  if (!isBrowser) return;
  const value = Number(price || 0) * Number(quantity || 1);

  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency,
      value,
      items: [
        {
          item_id: id,
          item_name: name,
          price: Number(price || 0),
          quantity: Number(quantity || 1),
        },
      ],
    });
  }
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [id],
      content_name: name,
      content_type: "product",
      value,
      currency,
    });
  }
};

/**
 * Fire when a shopper submits the checkout form and is about to be handed
 * off to Stripe (i.e. checkout has genuinely started).
 * @param {{ value: number, currency?: string, numItems?: number }} data
 */
export const trackCheckoutStarted = ({ value, currency = "AUD", numItems }) => {
  if (!isBrowser) return;

  if (window.gtag) {
    window.gtag("event", "begin_checkout", { currency, value: Number(value || 0) });
  }
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: Number(value || 0),
      currency,
      num_items: numItems,
    });
  }
};

/**
 * Fire once an order has been successfully created after Stripe confirms payment.
 * @param {{ transactionId: string, value: number, currency?: string }} data
 */
export const trackPurchase = ({ transactionId, value, currency = "AUD" }) => {
  if (!isBrowser) return;

  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      currency,
      value: Number(value || 0),
    });
  }
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: Number(value || 0),
      currency,
    });
  }
};
