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
