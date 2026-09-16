// Submits chatbot leads through the REAL backend's existing contact-query
// endpoint (POST /api/contact/add -> the `UserQuery` collection) instead of a
// separate database. This means a captured lead:
//   - shows up in the staff "Queries" admin page for free
//   - triggers the existing admin email / in-app notification, already wired
//     to the same pushNotification toggle every other query uses
// No new database, no new email service, no leads invisible to staff.
//
// Route is public (no auth middleware applied in routes/contactRouter.js),
// and every field below is `required: true` on the UserQuery schema.

const API_BASE = process.env.SUPERMERCH_API_BASE || "https://api.supermerch.com.au";

export async function submitLead({ name, email, phone, reason, summary }) {
  const res = await fetch(`${API_BASE}/api/contact/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name || "Website visitor",
      email: email || "",
      phone: phone || "",
      title: `Chatbot enquiry — ${reason || "general"}`,
      message: summary,
      type: "customer", // matches the site's own contact form's two allowed values (customer/merchant)
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`contact/add responded ${res.status}`);
  }
  const data = await res.json();
  return { id: data.data?._id || null };
}
