// Emails the team when the chatbot fails to answer a visitor.
//
// Why: when the OpenAI account ran out of credit, every visitor got "Sorry,
// something went wrong" for a long stretch and nobody on the team knew —
// the only trace was in Vercel's logs. Now the first failure sends an email
// saying what broke (in plain English for account problems) so it gets fixed
// quickly.
//
// Throttled to one email per ALERT_COOLDOWN_MS so an outage doesn't send one
// email per visitor. The throttle lives in memory, so it's per warm
// serverless instance: during a long outage you may get a few emails per
// cooldown window (one per instance), not hundreds.

import { sendAlertEmail } from "./email.js";
import { describeAccountProblem } from "./upstreamErrors.js";

export const ALERT_COOLDOWN_MS = 30 * 60 * 1000;
// The visitor's stream stays open until this finishes (Vercel can freeze the
// function once the response ends), so never let a slow email hold it long.
const SEND_TIMEOUT_MS = 4000;

let lastAlertAt = 0;

export function resetAlertThrottleForTests() {
  lastAlertAt = 0;
}

export function buildFailureAlert(err, { query, sessionId } = {}) {
  const accountProblem = describeAccountProblem(err);
  const subject = accountProblem
    ? "Super AI chatbot is down: needs action"
    : "Super AI chatbot failed to answer a visitor";
  const text = [
    accountProblem
      ? `The chatbot can't answer anyone until this is fixed:\n${accountProblem}`
      : "The chatbot failed to answer a visitor. If this keeps happening, check the Vercel logs for \"chat agent error\".",
    "",
    "Technical details:",
    `Status: ${err?.status ?? "none"}`,
    `Code: ${err?.code ?? err?.error?.code ?? "none"}`,
    `Message: ${String(err?.message ?? err).slice(0, 500)}`,
    `Visitor question: ${query ? String(query).slice(0, 200) : "(unknown)"}`,
    `Session: ${sessionId || "(none)"}`,
    `Time: ${new Date().toISOString()}`,
    "",
    `More failures in the next ${ALERT_COOLDOWN_MS / 60000} minutes won't send another email.`,
  ].join("\n");
  return { subject, text };
}

// Never throws — an alert failing must not change what the visitor sees.
export async function notifyChatFailure(err, context = {}) {
  const now = Date.now();
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return { sent: false, reason: "throttled" };
  // Claimed before sending, so two failures at once don't both email.
  lastAlertAt = now;
  try {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("alert email timed out")), SEND_TIMEOUT_MS);
    });
    const result = await Promise.race([sendAlertEmail(buildFailureAlert(err, context)), timeout]).finally(() =>
      clearTimeout(timer)
    );
    return result;
  } catch (alertErr) {
    console.error("Failure alert email could not be sent:", alertErr);
    return { sent: false, reason: "error" };
  }
}
