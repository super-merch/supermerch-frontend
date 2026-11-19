// Classifies errors from the OpenAI call in agent.js.
//
// Some failures are "account problems": the request will fail the exact same
// way no matter how many times it's retried, because the fix is on the
// OpenAI account or the Vercel env vars, not a passing blip. Real case this
// was written for: the account ran out of credit, OpenAI answered every
// request with a 429 "insufficient_quota", and because 429 was in the retry
// list each visitor waited ~11 seconds (4 attempts + backoff) just to be
// shown the error message. Account problems now fail on the first attempt.

export const RETRYABLE_STATUSES = new Set([400, 429, 500, 503]);

// Returns a plain-English reason when the error is an account/config problem
// a person has to fix, or null when it's an ordinary (possibly transient)
// failure. Used both to skip pointless retries and to word the alert email.
export function describeAccountProblem(err) {
  if (!err) return null;
  const code = err.code ?? err.error?.code;
  if (code === "missing_api_key") {
    return "OPENAI_API_KEY is not set in the Vercel environment variables.";
  }
  if (code === "insufficient_quota") {
    return "The OpenAI account is out of credit or has hit its spending limit. Top up under Settings > Billing at platform.openai.com.";
  }
  if (err.status === 401) {
    return "OpenAI rejected the API key (wrong, revoked or expired). Check OPENAI_API_KEY in Vercel.";
  }
  if (err.status === 403) {
    return "OpenAI refused access. The key's project may not have permission to use this model.";
  }
  if (err.status === 404) {
    return "OpenAI couldn't find the model. Check OPENAI_MODEL in Vercel (default is gpt-4o-mini).";
  }
  return null;
}

export function isRetryableUpstreamError(err) {
  if (describeAccountProblem(err)) return false;
  // A timeout/connection drop has no HTTP status at all (err.status is
  // undefined) — that's exactly the kind of transient hiccup worth retrying.
  return err?.status === undefined || RETRYABLE_STATUSES.has(err.status);
}
