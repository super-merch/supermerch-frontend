import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchJsonWithRetry } from "../../scripts/category-finder/lib/httpRetry.mjs";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

// Regression guard: a live, multi-thousand-request verification run once
// stalled for hours (near-zero CPU usage the whole time -- the unmistakable
// signature of a hung connection) because plain fetch() has no default
// timeout in Node. A single request that never resolves must be aborted
// after a bounded time, not block its caller (and therefore its concurrency
// slot in a batch job) forever.
// A real fetch() rejects with an AbortError once its signal fires -- a mock
// that just returns an eternally-pending promise WITHOUT wiring up the
// signal doesn't reproduce that (it would just hang the test itself until
// Vitest's own test-level timeout fires, which proves nothing about our
// code). This helper mocks the realistic behavior: pending until aborted,
// then rejects like a real hung connection would once the AbortController
// actually fires.
function hangingFetchThatHonorsAbort() {
  return (url, options) =>
    new Promise((resolve, reject) => {
      options?.signal?.addEventListener("abort", () => {
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
}

describe("fetchJsonWithRetry: timeout on a hanging request", () => {
  it("aborts and rejects a request that never resolves, instead of hanging forever", async () => {
    globalThis.fetch = vi.fn(hangingFetchThatHonorsAbort());
    await expect(fetchJsonWithRetry("https://example.test/hangs", [], 30)).rejects.toThrow(/timed out after 30ms/);
  });

  it("still succeeds normally for a fetch that resolves well within the timeout", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ item_count: 5 }) }));
    const result = await fetchJsonWithRetry("https://example.test/ok", [], 5000);
    expect(result).toEqual({ item_count: 5 });
  });

  it("retries after a timeout and can still succeed on a later attempt", async () => {
    let call = 0;
    const hangOnce = hangingFetchThatHonorsAbort();
    globalThis.fetch = vi.fn((url, options) => {
      call += 1;
      if (call === 1) return hangOnce(url, options); // first attempt hangs, then gets aborted
      return Promise.resolve({ ok: true, json: async () => ({ item_count: 1 }) });
    });
    const result = await fetchJsonWithRetry("https://example.test/eventually-ok", [10], 30);
    expect(result).toEqual({ item_count: 1 });
    expect(call).toBe(2);
  });

  it("still throws the original HTTP error (not a timeout error) for a fast non-2xx response", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 500 }));
    await expect(fetchJsonWithRetry("https://example.test/500", [], 5000)).rejects.toThrow(/HTTP 500/);
  });
});
