import { describe, expect, it } from "vitest";
import { describeAccountProblem, isRetryableUpstreamError } from "../upstreamErrors.js";

describe("isRetryableUpstreamError", () => {
  it("does not retry account problems", () => {
    expect(isRetryableUpstreamError({ status: 429, code: "insufficient_quota" })).toBe(false);
    expect(isRetryableUpstreamError({ status: 429, error: { code: "insufficient_quota" } })).toBe(false);
    expect(isRetryableUpstreamError({ code: "missing_api_key" })).toBe(false);
    expect(isRetryableUpstreamError({ status: 401 })).toBe(false);
  });

  it("still retries ordinary rate limits, server errors and network drops", () => {
    expect(isRetryableUpstreamError({ status: 429, code: "rate_limit_exceeded" })).toBe(true);
    expect(isRetryableUpstreamError({ status: 503 })).toBe(true);
    expect(isRetryableUpstreamError(new Error("socket hang up"))).toBe(true);
  });
});

describe("describeAccountProblem", () => {
  it("explains out-of-credit in plain English", () => {
    expect(describeAccountProblem({ status: 429, code: "insufficient_quota" })).toMatch(/out of credit/);
  });

  it("returns null for ordinary failures", () => {
    expect(describeAccountProblem({ status: 503 })).toBeNull();
  });
});
