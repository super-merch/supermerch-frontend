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
  it("initMetaPixel does not itself queue a PageView event on init", async () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    const analytics = await importFreshAnalytics();

    analytics.grantAnalyticsConsent();

    // The fbq stub queues calls (real fbevents.js script never actually
    // executes in jsdom), so we can inspect exactly what was queued.
    const queuedTrackPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(queuedTrackPageViews.length).toBe(0);

    const queuedInits = window.fbq.queue.filter((args) => args[0] === "init");
    expect(queuedInits.length).toBe(1);
  });

  it("trackPageView is the only thing that queues a PageView, and does so exactly once per call", async () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1234567890");
    const analytics = await importFreshAnalytics();
    analytics.grantAnalyticsConsent();

    analytics.trackPageView("/some-page");

    const queuedTrackPageViews = window.fbq.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    );
    expect(queuedTrackPageViews.length).toBe(1);
  });
});
