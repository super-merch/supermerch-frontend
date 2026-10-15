// Server-side submission for the Corporate Gifting Brief page
// (src/pages/CorporateGiftingBrief.jsx).
//
// Why this exists: the Google Form behind that page is built as 12 separate
// pages (one per question). Google only accepts answers past page 1 when the
// request carries a session token (`fbzx`) and a page-visit record
// (`pageHistory`) that a real browser gets by navigating the form normally.
// A raw POST straight from the browser -- which is what this page used to do
// -- has neither, so Google silently records only the first answer and
// discards the rest, while the fetch() itself still "succeeds" (mode:
// no-cors gives an opaque response either way). Doing the submission here
// instead means we can fetch a fresh, valid `fbzx` server-side (no CORS
// restriction on a server) and also read Google's real response, so the
// page can finally report genuine success or failure.
//
// If the Google Form's page breaks are ever removed (see
// Corporate_Gifting_Brief README), this endpoint keeps working unchanged --
// pageHistory "0" alone is harmless on a single-page form.

const VIEWFORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScSBInnD9hgicM4FHVfCXJyyYEd8XRBiiUEOZ2x4_XYfbXR0Q/viewform";
const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScSBInnD9hgicM4FHVfCXJyyYEd8XRBiiUEOZ2x4_XYfbXR0Q/formResponse";

// The form has 12 pages (indices 0-11); pageHistory records every page a
// respondent visited before submitting. Mirrors the actual number of
// sections in the live form -- update this if a page is added or removed.
const PAGE_HISTORY = "0,1,2,3,4,5,6,7,8,9,10,11";

// Every entry.<id> this form can legitimately receive. Anything outside
// this set from the request body is dropped rather than forwarded, so this
// endpoint can never become an open relay for arbitrary POST data.
const ALLOWED_ENTRY_IDS = new Set([
  "1464033638", "233889335", "6239281",
  "1428149388_year", "1428149388_month", "1428149388_day",
  "656417830", "678025945", "1231267793", "1034274497",
  "1356304719", "1785021701", "1792888202",
  "1299654412", "484658489", "1427361862", "1847302746",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "method_not_allowed" });
    return;
  }

  const fields = req.body && typeof req.body === "object" ? req.body.fields : null;
  if (!fields || typeof fields !== "object") {
    res.status(400).json({ success: false, error: "missing_fields" });
    return;
  }

  let fbzx;
  try {
    const viewform = await fetch(VIEWFORM_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SuperMerchGiftingBrief/1.0)" },
    }).then((r) => r.text());
    const match = viewform.match(/name="fbzx"\s+value="([^"]+)"/);
    fbzx = match && match[1];
  } catch {
    fbzx = null;
  }
  if (!fbzx) {
    res.status(502).json({ success: false, error: "form_unavailable" });
    return;
  }

  const body = new URLSearchParams();
  for (const [entryId, value] of Object.entries(fields)) {
    if (!ALLOWED_ENTRY_IDS.has(entryId)) continue;
    if (Array.isArray(value)) {
      value.forEach((one) => {
        if (one) body.append(`entry.${entryId}`, String(one));
      });
    } else if (value !== undefined && value !== null && value !== "") {
      body.append(`entry.${entryId}`, String(value));
    }
  }
  body.append("fbzx", fbzx);
  body.append("pageHistory", PAGE_HISTORY);
  body.append("submissionTimestamp", "-1");

  try {
    const submitRes = await fetch(FORM_ACTION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    // Google redirects to a "formResponse" confirmation page on success
    // (fetch follows redirects by default) and returns 200 for that page;
    // a malformed/rejected submission surfaces as a non-200 status.
    if (!submitRes.ok) {
      res.status(502).json({ success: false, error: "form_rejected", status: submitRes.status });
      return;
    }
    res.status(200).json({ success: true });
  } catch {
    res.status(502).json({ success: false, error: "network" });
  }
}
