// @vitest-environment jsdom

/**
 * src/lib/analytics.js — provider loading, consent gating, and dedup guards.
 *
 * Each test dynamically re-imports the module after `vi.resetModules()` so
 * that the module-level `initialized` flag and the env-var consts (which are
 * read once at import time) are fresh for every test.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setNonLocalHostname = () => {
  Object.defineProperty(window, "location", {
    value: new URL("https://www.supermerch.com.au/"),
    writable: true,
    configurable: true,
  });
};

const importFreshAnalytics = () => import("../lib/analytics.js");

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.head.innerHTML = "";
  delete window.gtag;
  delete window.fbq;
  delete window._fbq;
  delete window.clarity;
  delete window.dataLayer;
  setNonLocalHostname();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("(a) no env vars configured", () => {
  it("injects no script tags at all, even once consent is granted", async () => {
    const analytics = await importFreshAnalytics();

    analytics.grantAnalyticsConsent();

    expect(document.querySelectorAll("script").length).toBe(0);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq).toBeUndefined();
    expect(window.clarity).toBeUndefined();
  });

  it("initAnalytics() on startup is also a no-op with no env vars", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_ACCEPTED);

    analytics.initAnalytics();

    expect(document.querySelectorAll("script").length).toBe(0);
  });
});

describe("(b) each provider initializes exactly once", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "abcdef");
  });

  it("survives repeated grantAnalyticsConsent() calls (e.g. re-renders)", async () => {
    const analytics = await importFreshAnalytics();

    analytics.grantAnalyticsConsent();
    analytics.grantAnalyticsConsent();
    analytics.grantAnalyticsConsent();

    expect(document.querySelectorAll('script[src*="googletagmanager.com"]').length).toBe(1);
    expect(document.querySelectorAll('script[src*="connect.facebook.net"]').length).toBe(1);
    expect(document.querySelectorAll('script[src*="clarity.ms"]').length).toBe(1);
  });

  it("survives a mix of initAnalytics() and grantAnalyticsConsent() calls", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_ACCEPTED);

    analytics.initAnalytics(); // startup, consent already on file
    analytics.initAnalytics(); // e.g. StrictMode double-invoke
    analytics.grantAnalyticsConsent(); // shopper re-clicks Accept via preferences link

    expect(document.querySelectorAll('script[src*="googletagmanager.com"]').length).toBe(1);
    expect(document.querySelectorAll('script[src*="connect.facebook.net"]').length).toBe(1);
    expect(document.querySelectorAll('script[src*="clarity.ms"]').length).toBe(1);
  });
});

describe("(f) declining consent prevents all three providers from loading", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "abcdef");
  });

  it("declineAnalyticsConsent() never injects any script", async () => {
    const analytics = await importFreshAnalytics();

    analytics.declineAnalyticsConsent();

    expect(document.querySelectorAll("script").length).toBe(0);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq).toBeUndefined();
    expect(window.clarity).toBeUndefined();
    expect(localStorage.getItem(analytics.CONSENT_STORAGE_KEY)).toBe(
      analytics.CONSENT_DECLINED,
    );
  });

  it("a stored decline from a previous visit keeps initAnalytics() a no-op on startup", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_DECLINED);

    analytics.initAnalytics();

    expect(document.querySelectorAll("script").length).toBe(0);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq).toBeUndefined();
    expect(window.clarity).toBeUndefined();
  });

  it("a stored accept from a previous visit loads providers automatically on startup", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_ACCEPTED);

    analytics.initAnalytics();

    expect(document.querySelectorAll('script[src*="googletagmanager.com"]').length).toBe(1);
    expect(window.gtag).toBeTypeOf("function");
  });
});

describe("Meta Pixel initial PageView de-duplication", () => {
  it("initMetaPixel does not itself queue a PageView event separate from the fix-#2 auto-fire", async () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    const analytics = await importFreshAnalytics();

    analytics.grantAnalyticsConsent();

    // grantAnalyticsConsent() itself auto-fires exactly one PageView for the
    // current page now (fix #2, tested in detail below) — initMetaPixel must
    // not add a *second* one on top of that.
    const queuedTrackPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(queuedTrackPageViews.length).toBe(1);

    const queuedInits = window.fbq.queue.filter((args) => args[0] === "init");
    expect(queuedInits.length).toBe(1);
  });

  it("trackPageView queues exactly one further PageView per explicit call", async () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    const analytics = await importFreshAnalytics();
    analytics.grantAnalyticsConsent(); // auto-fires 1 PageView (fix #2)

    analytics.trackPageView("/some-page");

    const queuedTrackPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(queuedTrackPageViews.length).toBe(2); // 1 auto-fired + 1 explicit
  });
});

describe("(g) consent lifecycle — entry-page pageview, live decline, forced reload", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "abcdef");
  });

  it("first visit -> Accept fires exactly one page_view/PageView for the current page", async () => {
    const analytics = await importFreshAnalytics();

    // Simulates App.jsx's route-tracking effect firing on initial mount,
    // before any consent decision exists — must be a silent no-op (fix 1b),
    // since nothing has loaded yet and consent isn't "accepted".
    analytics.trackPageView("/entry-page");

    analytics.grantAnalyticsConsent(); // shopper clicks "Accept All"

    const gaPageViews = window.dataLayer.filter(
      (args) => args[0] === "event" && args[1] === "page_view",
    );
    const metaPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(gaPageViews.length).toBe(1);
    expect(metaPageViews.length).toBe(1);
  });

  it("returning visitor with stored acceptance gets exactly one page view on startup, not two", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_ACCEPTED);

    analytics.initAnalytics(); // main.jsx, module-load time — loads providers
    analytics.trackPageView("/entry-page"); // App.jsx's normal mount effect

    const gaPageViews = window.dataLayer.filter(
      (args) => args[0] === "event" && args[1] === "page_view",
    );
    const metaPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    // Must be exactly one — initAnalytics() itself must NOT auto-fire a
    // pageview (that would double-count alongside App.jsx's own effect).
    expect(gaPageViews.length).toBe(1);
    expect(metaPageViews.length).toBe(1);
  });

  it("re-affirming Accept via preferences (already loaded at startup) does not add an extra pageview", async () => {
    const analytics = await importFreshAnalytics();
    localStorage.setItem(analytics.CONSENT_STORAGE_KEY, analytics.CONSENT_ACCEPTED);

    analytics.initAnalytics(); // startup already loaded providers
    analytics.grantAnalyticsConsent(); // shopper re-clicks Accept in preferences

    const metaPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(metaPageViews.length).toBe(0);
  });

  it("Accept -> later Decline makes every track* helper an immediate no-op, without a reload", async () => {
    const analytics = await importFreshAnalytics();
    analytics.grantAnalyticsConsent();

    // Sanity check: tracking works while consent is accepted.
    window.dataLayer.length = 0;
    window.fbq.queue.length = 0;
    analytics.trackAddToCart({ id: 1, name: "Mug", price: 10, quantity: 1 });
    expect(
      window.dataLayer.some((args) => args[0] === "event" && args[1] === "add_to_cart"),
    ).toBe(true);

    // Stub reload so declining doesn't try to actually navigate jsdom.
    window.location.reload = vi.fn();
    analytics.declineAnalyticsConsent();

    window.dataLayer.length = 0;
    window.fbq.queue.length = 0;
    analytics.trackPageView("/somewhere");
    analytics.trackAddToCart({ id: 1, name: "Mug", price: 10, quantity: 1 });
    analytics.trackCheckoutStarted({ value: 10 });
    analytics.trackPurchase({ transactionId: "t1", value: 10 });

    // Every helper checked hasAnalyticsConsent() up front and no-op'd —
    // nothing new was pushed to gtag's dataLayer or fbq's queue, even
    // though window.gtag/window.fbq are still technically defined.
    expect(window.dataLayer.length).toBe(0);
    expect(window.fbq.queue.length).toBe(0);
    expect(analytics.hasAnalyticsConsent()).toBe(false);
  });

  it("Accept -> Decline triggers a full page reload when providers were already loaded", async () => {
    const analytics = await importFreshAnalytics();
    analytics.grantAnalyticsConsent();

    const reloadSpy = vi.fn();
    window.location.reload = reloadSpy;

    analytics.declineAnalyticsConsent();

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(analytics.CONSENT_STORAGE_KEY)).toBe(
      analytics.CONSENT_DECLINED,
    );
  });

  it("declining before providers ever loaded does not attempt a reload", async () => {
    const analytics = await importFreshAnalytics();

    const reloadSpy = vi.fn();
    window.location.reload = reloadSpy;

    analytics.declineAnalyticsConsent();

    expect(reloadSpy).not.toHaveBeenCalled();
  });
});
