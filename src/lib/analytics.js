// src/lib/analytics.js
//
// Thin wrapper around GA4 (gtag.js), Meta Pixel, and Microsoft Clarity.
//
// Design goals:
// - Every provider is driven entirely by env vars (VITE_GA_MEASUREMENT_ID,
//   VITE_META_PIXEL_ID, VITE_CLARITY_PROJECT_ID). If a var is unset, that
//   provider is skipped entirely — no empty/invalid tags are ever injected.
// - Scripts are loaded async and appended to <head> at runtime (never
//   render-blocking), so they never break checkout — though loading them
//   still consumes bandwidth/CPU, so they are gated on consent (below).
// - track* helpers are always safe to call from anywhere in the app, even
//   before init runs or when a provider isn't configured — they check
//   hasAnalyticsConsent() first (so they stop firing the instant consent is
//   withdrawn, without relying on window.gtag/window.fbq happening to be
//   gone) and then check for the relevant global before calling it.
// - Disabled on localhost/dev so local testing never pollutes real analytics
//   data (matches the convention the previous inline GA snippet used).
// - Gated on cookie consent: none of GA4/Meta Pixel/Clarity load until the
//   shopper explicitly accepts via the cookie banner (see CookieConsentBanner).
//   Declining (or not yet deciding) means the scripts are never injected.
// - Withdrawing consent after providers already loaded can't un-inject
//   scripts or kill in-flight listeners from JS alone, so declineAnalyticsConsent()
//   forces a full page reload in that case — the next load starts fresh,
//   initAnalytics() sees the stored "declined" value, and nothing loads at all.

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

const isBrowser = typeof window !== "undefined";

const isLocalDev = () => {
  if (!isBrowser) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

/** localStorage key holding the shopper's cookie-consent decision. */
export const CONSENT_STORAGE_KEY = "sm_analytics_consent";
export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_DECLINED = "declined";

/** Returns "accepted" | "declined" | null (no decision made yet). */
export const getStoredConsent = () => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const hasAnalyticsConsent = () => getStoredConsent() === CONSENT_ACCEPTED;

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
  // Do NOT fire an initial "PageView" here. App.jsx's route-tracking effect
  // (trackPageView, below) already fires once on initial mount and once per
  // subsequent navigation — it is the single source of truth for PageView
  // events. Firing one here too double-counts every hard-loaded page.

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

/**
 * Actually injects the provider scripts. Guarded so it only ever runs once
 * per page load no matter how many times it's called (consent grant,
 * startup check, re-renders, etc).
 *
 * @returns {boolean} true iff THIS call is the one that transitioned
 *   providers from not-loaded to loaded this session; false if they were
 *   already loaded (or this isn't a browser). Callers use this to detect
 *   the transition without needing a second module-level flag.
 */
const loadProviders = () => {
  if (!isBrowser || initialized) return false;
  initialized = true;

  if (isLocalDev()) return true;

  initGoogleAnalytics();
  initMetaPixel();
  initClarity();
  return true;
};

/**
 * Call once on app startup. Only loads GA4/Meta Pixel/Clarity if the shopper
 * already accepted analytics cookies on a previous visit — otherwise this is
 * a no-op and nothing is injected until `grantAnalyticsConsent()` runs.
 * Safe to call multiple times (no-ops after the first successful load).
 */
export const initAnalytics = () => {
  if (!isBrowser) return;
  if (!hasAnalyticsConsent()) return;
  loadProviders();
};

/**
 * Call when the shopper accepts the cookie banner. Persists the decision so
 * future visits don't re-prompt, and loads the providers for the first time
 * (no-ops if they're already loaded).
 *
 * If this call is what actually transitions providers from not-loaded to
 * loaded (i.e. a first-time accept, not a re-affirming click from a
 * returning visitor whose providers were already loaded at startup), we
 * also emit one page_view/PageView for the page the shopper is already on.
 * Without this, App.jsx's route-tracking effect already ran (and no-op'd,
 * since there was no consent yet) before this moment, so GA4/Meta would
 * otherwise never see a pageview for the entry page — only for whatever
 * page the shopper navigates to next.
 */
export const grantAnalyticsConsent = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_ACCEPTED);
  } catch {
    // localStorage unavailable (private browsing, etc.) — consent won't
    // persist across reloads, but scripts still load for this session.
  }
  const justLoaded = loadProviders();
  if (justLoaded) {
    trackPageView(`${window.location.pathname}${window.location.search}`);
  }
};

/**
 * Call when the shopper declines the cookie banner (including re-opening
 * Cookie Preferences later and declining after having previously accepted).
 * Persists the decision so GA4/Meta Pixel/Clarity are never loaded on this
 * device/browser again — and, critically, if providers were ALREADY loaded
 * this session (scripts injected, globals defined, listeners attached),
 * flipping localStorage alone can't stop any of that from JS. So in that
 * case we force a full page reload immediately: on the next load,
 * initAnalytics() sees the freshly stored "declined" value and never calls
 * loadProviders() at all, so nothing loads and nothing keeps tracking.
 */
export const declineAnalyticsConsent = () => {
  if (!isBrowser) return;
  const providersWereLoaded = initialized;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_DECLINED);
  } catch {
    // localStorage unavailable — nothing to persist, but we also never
    // call loadProviders(), so analytics still doesn't load this session.
  }
  if (providersWereLoaded) {
    window.location.reload();
  }
};

/** Test-only: allows test suites to reset the module-level init guard. */
export const __resetAnalyticsForTests = () => {
  initialized = false;
};

/** Fire on every route change (SPA navigations don't trigger a browser page load). */
export const trackPageView = (path) => {
  if (!isBrowser) return;
  if (!hasAnalyticsConsent()) return;
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
  if (!hasAnalyticsConsent()) return;
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
  if (!hasAnalyticsConsent()) return;

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
  if (!hasAnalyticsConsent()) return;

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
