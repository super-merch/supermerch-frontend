// Shared retry-on-failure JSON fetch, used by both the snapshot fetcher and
// the live filter-mapping verifier -- both hit the same flaky public API and
// need the same retry behavior, just with different delay schedules (the
// snapshot fetch tolerates more retries since it's a one-time batch job; the
// verifier runs many more requests total and uses a shorter schedule).
const DEFAULT_RETRY_DELAYS_MS = [500, 1500, 4000];

// A single hung request (server accepts the connection but never responds,
// or responds only after an unbounded delay) must never be allowed to block
// a concurrency-limited batch job forever -- plain `fetch()` has NO default
// timeout in Node, so without this a single bad request silently stalls one
// worker slot indefinitely, which is exactly what happened during this
// project's exhaustive verification pass (a multi-thousand-request run that
// should take tens of minutes instead ran for hours at near-zero CPU
// utilization -- the unmistakable signature of a hung connection, not real
// work). Each attempt (including retries) gets its own fresh timeout.
const DEFAULT_TIMEOUT_MS = 20_000;

export async function fetchJsonWithRetry(url, retryDelaysMs = DEFAULT_RETRY_DELAYS_MS, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let lastError;
  for (const delay of [0, ...retryDelaysMs]) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err.name === "AbortError" ? new Error(`request timed out after ${timeoutMs}ms for ${url}`) : err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
