// Sends a direct email notification whenever the bot captures a lead — on
// top of (not instead of) submitting to the real backend's /api/contact/add
// (see contactApi.js), which is what keeps the lead visible in the staff
// admin "Queries" page. This is a separate, additional notification to a
// specific address, using Resend (https://resend.com — simple HTTP API,
// works well from a serverless function, generous free tier).

import { Resend } from "resend";

let resend = null;
function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Internal alert to the team (e.g. "the chatbot is failing"). Goes to
// ALERT_EMAIL if set, otherwise the same LEAD_NOTIFY_EMAIL inbox. Same Resend
// test-mode caveat as leads: until a domain is verified at resend.com, only
// the Resend account's own address can receive mail.
export async function sendAlertEmail({ subject, text }) {
  const to = process.env.ALERT_EMAIL || process.env.LEAD_NOTIFY_EMAIL;
  if (!to || !process.env.RESEND_API_KEY) {
    console.warn("Alert email skipped: ALERT_EMAIL/LEAD_NOTIFY_EMAIL or RESEND_API_KEY is not set");
    return { sent: false };
  }
  const { error } = await getResend().emails.send({
    from: process.env.LEAD_NOTIFY_FROM || "Merch Mate <onboarding@resend.dev>",
    to,
    subject,
    text,
  });
  if (error) throw new Error(`Resend rejected the email: ${error.message}`);
  return { sent: true };
}

export async function sendLeadNotification(lead) {
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!to) {
    console.warn("Lead email skipped: LEAD_NOTIFY_EMAIL is not set");
    return { sent: false };
  }

  // The Resend SDK does NOT throw on API-level failures — it resolves with
  // { data, error } either way, so a failed send has to be checked explicitly
  // or it silently looks like success.
  const { error } = await getResend().emails.send({
    from: process.env.LEAD_NOTIFY_FROM || "Merch Mate <onboarding@resend.dev>",
    to,
    subject: `New chat lead: ${lead.name} — ${lead.reason}`,
    text: [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Reason: ${lead.reason}`,
      "",
      "Summary:",
      lead.summary,
    ].join("\n"),
  });

  if (error) throw new Error(`Resend rejected the email: ${error.message}`);
  return { sent: true };
}
