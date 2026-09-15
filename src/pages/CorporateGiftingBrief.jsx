/**
 * Corporate Gifting Brief — single page.
 *
 * Self-contained: no Tailwind, no UI library, no new dependencies. Everything
 * is visible at once with one Submit button, rather than the earlier
 * one-question-per-screen wizard — simpler, and removes a whole category of
 * step-navigation bugs (auto-advance races, Back-button state, keyboard
 * shortcuts) that came with the stepped version.
 *
 * Submissions go through api/submit-corporate-gifting-brief.js, which POSTs
 * into the existing Google Form server-side, so answers keep landing in
 * "Corporate Gifting Brief - Responses" in the info@supermerch.com.au Drive.
 *
 * Routed at /corporate-gifting-brief.
 *
 * Fraunces and Karla are loaded globally in index.html rather than here,
 * since the app already loads its base font (Figtree) that way.
 */

import { useState, useCallback, useRef } from "react";

/* Google Form field ids. Do not change these unless the form's questions are rebuilt. */
const ENTRY = {
  who: "1464033638",
  occasion: "233889335",
  qty: "6239281",
  when: "1428149388", // date: posts as _year / _month / _day
  budget: "656417830",
  style: "678025945",
  alcohol: "1231267793",
  branding: "1034274497",
  release: "1356304719",
  delivery: "1785021701",
  notes: "1792888202",
  name: "1299654412",
  company: "484658489",
  email: "1427361862",
  phone: "1847302746",
};

const QUESTIONS = [
  {
    k: "who",
    req: true,
    t: "Who is going to receive these gifts?",
    h: "Tick all that apply.",
    multi: true,
    o: [
      "Clients or customers",
      "Our staff and team",
      "Prospects we are trying to win",
      "Partners, suppliers or referrers",
      "VIPs and executives",
      "Event or conference attendees",
    ],
  },
  {
    k: "occasion",
    req: true,
    t: "What is the occasion?",
    h: "Tick all that apply.",
    multi: true,
    o: [
      "Christmas or end of year",
      "Client thank you or appreciation",
      "Welcome pack, new client or new staff",
      "Work anniversary or milestone",
      "Conference, event or trade show",
      "No specific occasion, ongoing gifting",
    ],
  },
  {
    k: "qty",
    req: true,
    t: "Roughly how many gifts do you need?",
    h: "A ballpark is fine. Larger runs unlock better pricing.",
    o: ["1 to 24", "25 to 49", "50 to 99", "100 to 249", "250 to 499", "500 or more", "Not sure yet"],
  },
  {
    k: "when",
    t: "When do you need them by?",
    h: "Branded and custom gifts usually need three to four weeks. Leave it blank if your date is flexible.",
    date: true,
  },
  {
    k: "budget",
    req: true,
    t: "What budget per gift do you have in mind?",
    h: "Per gift, excluding GST and delivery.",
    o: [
      "Up to $99",
      "$100 to $149",
      "$150 to $249",
      "$250 to $499",
      "$500 to $799",
      "$800 to $1,499",
      "$1,500 and above",
      "Not sure, show me what is possible",
    ],
  },
  {
    k: "style",
    req: true,
    t: "What kind of gifting are you looking for?",
    h: "Tick anything that appeals and we will narrow it down.",
    multi: true,
    o: [
      "Gourmet hampers and food",
      "Wine, beer and spirits",
      "Drinkware, barware and glassware",
      "Tech and gadgets",
      "Apparel and accessories",
      "Luxury and executive gifts",
      "Not sure, recommend something for me",
    ],
  },
  {
    k: "alcohol",
    req: true,
    t: "With or without alcohol?",
    o: ["With alcohol", "Without alcohol", "A mix, some of each", "Depends on the recipient, let us discuss"],
  },
  {
    k: "branding",
    req: true,
    t: "How would you like it branded?",
    o: [
      "Our logo on the gift itself",
      "Branded packaging or branded ribbon",
      "Unbranded gift with a branded card or note",
      "Fully custom and bespoke",
      "No branding at all",
      "Not sure, recommend what works",
    ],
  },
  {
    k: "release",
    req: true,
    t: "All in one go, or stored and released over time?",
    h: "We can hold your stock and ship it as you need it.",
    o: ["All in one go", "Store them and release in batches as we need them", "Not sure, tell me how storage works"],
  },
  {
    k: "delivery",
    req: true,
    t: "Where should the gifts be delivered?",
    o: [
      "Ship directly to each recipient, we will supply the addresses",
      "Deliver everything to us in one bulk shipment",
      "A mix of both",
      "Not sure yet",
    ],
  },
  {
    k: "notes",
    t: "Anything else we should know?",
    h: "Dietary, cultural or company restrictions, a theme you have in mind, or what has worked before.",
    area: true,
  },
];

const CONTACT_FIELDS = [
  { k: "name", l: "Your name", type: "text", req: true },
  { k: "company", l: "Company", type: "text", req: true },
  { k: "email", l: "Email", type: "email", req: true },
  { k: "phone", l: "Best contact number", type: "tel" },
];

const LABELS = {
  who: "Recipients",
  occasion: "Occasion",
  qty: "Quantity",
  when: "Needed by",
  budget: "Budget per gift",
  style: "Gift style",
  alcohol: "Alcohol",
  branding: "Branding",
  release: "Release",
  delivery: "Delivery",
  notes: "Notes",
};

const CSS = `
.sgb{--paper:#FAF7F2;--card:#FFF;--ink:#0D2A27;--soft:#5B716D;--teal:#009688;--wash:#E9F4F1;
  --line:#DCE5E2;--focus:#00796B;--err:#C0392B;
  background:var(--paper);color:var(--ink);min-height:100vh;
  font-family:Karla,-apple-system,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.sgb *{box-sizing:border-box}
.sgb-wrap{max-width:720px;margin:0 auto;padding-block:28px 64px;padding-left:20px;padding-right:20px}
.sgb-mast{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.sgb-mark{width:34px;height:34px;flex-shrink:0}
.sgb-brand b{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:19px;display:block;letter-spacing:-.01em}
.sgb-brand span{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.sgb-card{background:var(--card);border:1px solid var(--line);border-radius:3px;padding:36px 34px;
  box-shadow:0 1px 2px rgba(13,42,39,.05),0 12px 34px -18px rgba(13,42,39,.3)}
.sgb-eyebrow{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:10px}
.sgb-card h1{font-family:Fraunces,Georgia,serif;font-weight:400;font-size:30px;line-height:1.22;margin:0 0 8px;
  letter-spacing:-.015em;text-wrap:balance}
.sgb-intro{color:var(--soft);font-size:14.5px;line-height:1.55;margin:0}
.sgb-q{padding-block:26px;border-bottom:1px solid var(--line)}
.sgb-q:first-of-type{padding-top:30px}
.sgb-qlabel{display:block;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:17px;line-height:1.4;margin:0}
.sgb-hint{color:var(--soft);font-size:13.5px;margin:6px 0 0;line-height:1.5}
.sgb-q-missing .sgb-qlabel{color:var(--err)}
.sgb-q-missing{border-left:2px solid var(--err);margin-left:-16px;padding-left:14px}
.sgb-opts{display:flex;flex-direction:column;gap:7px;margin-top:16px}
.sgb-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:transparent;
  border:1px solid var(--line);border-radius:2px;padding:12px 15px;font:inherit;font-size:15px;color:var(--ink);
  cursor:pointer;transition:border-color .14s,background .14s}
.sgb-opt:hover{border-color:var(--teal);background:var(--wash)}
.sgb-opt:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.sgb-opt[aria-pressed="true"]{border-color:var(--teal);background:var(--wash)}
.sgb-box{width:17px;height:17px;border:1.5px solid var(--line);flex-shrink:0;display:grid;place-items:center;transition:all .14s}
.sgb-box.round{border-radius:99px}
.sgb-opt[aria-pressed="true"] .sgb-box{background:var(--teal);border-color:var(--teal)}
.sgb-tick{width:10px;height:10px;opacity:0;transition:opacity .12s}
.sgb-opt[aria-pressed="true"] .sgb-tick{opacity:1}
.sgb-field{margin-top:16px;max-width:320px}
.sgb-field label{display:block;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);margin-bottom:2px}
.sgb input,.sgb textarea{width:100%;font:inherit;font-size:15.5px;color:var(--ink);background:transparent;
  border:0;border-bottom:1.5px solid var(--line);padding:11px 2px;border-radius:0;transition:border-color .15s}
.sgb input:focus,.sgb textarea:focus{outline:none;border-bottom-color:var(--teal)}
.sgb textarea{border:1px solid var(--line);padding:12px;min-height:100px;resize:vertical;line-height:1.55;max-width:none}
.sgb-contact .sgb-field{max-width:none}
.sgb-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
.sgb-next{background:var(--teal);color:#fff;border:0;border-radius:2px;padding:14px 30px;font:inherit;
  font-weight:700;font-size:15.5px;cursor:pointer;display:inline-block;margin-top:28px}
.sgb-next:hover{background:var(--focus)}
.sgb-next:disabled{opacity:.35;cursor:not-allowed}
.sgb-sum{margin-top:22px;border-top:1px solid var(--line)}
.sgb-row{display:flex;gap:18px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14.5px}
.sgb-row dt{flex:0 0 40%;color:var(--soft);margin:0}
.sgb-row dd{margin:0;flex:1}
.sgb-foot{margin-top:26px;font-size:12.5px;color:var(--soft);text-align:center;line-height:1.7}
.sgb-foot a{color:var(--teal)}
.sgb-err{color:var(--err);font-size:14px;margin-top:24px;padding:12px 14px;background:#FBEAEA;border-radius:2px}
@media (max-width:560px){
  .sgb-card{padding:28px 20px}
  .sgb-card h1{font-size:25px}
  .sgb-row{flex-direction:column;gap:2px}
  .sgb-row dt{flex:none}
  .sgb-contact-grid{grid-template-columns:1fr}
  .sgb-q-missing{margin-left:-12px;padding-left:10px}
}
@media (prefers-reduced-motion:reduce){.sgb *{transition:none!important}}
`;

const Tick = () => (
  <svg className="sgb-tick" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M1.6 6.2 4.4 9 10.4 3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Mark = () => (
  <svg className="sgb-mark" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M46 46V4C22.8 4 4 22.8 4 46h42z" fill="#009688" />
    <path d="M54 46h42C96 22.8 77.2 4 54 4v42z" fill="#009688" opacity=".72" />
    <path d="M46 54H4c0 23.2 18.8 42 42 42V54z" fill="#009688" opacity=".72" />
    <path d="M54 54v42c23.2 0 42-18.8 42-42H54z" fill="#009688" />
  </svg>
);

const isEmpty = (v) => !v || (Array.isArray(v) && !v.length);

export default function CorporateGiftingBrief() {
  const [answers, setAnswers] = useState({});
  const [details, setDetails] = useState({ name: "", company: "", email: "", phone: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const emailInputRef = useRef(null);
  const sectionRefs = useRef({});

  const toggle = (qKey, opt, multi) => {
    setAnswers((prev) => {
      if (multi) {
        const list = prev[qKey] || [];
        return { ...prev, [qKey]: list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt] };
      }
      return { ...prev, [qKey]: opt };
    });
  };

  const submit = useCallback(async () => {
    const fields = {};
    Object.keys(LABELS).forEach((k) => {
      const v = answers[k];
      if (isEmpty(v)) return;
      if (k === "when") {
        const [y, m, d] = String(v).split("-");
        if (y && m && d) {
          fields[`${ENTRY.when}_year`] = y;
          fields[`${ENTRY.when}_month`] = String(Number(m));
          fields[`${ENTRY.when}_day`] = String(Number(d));
        }
        return;
      }
      fields[ENTRY[k]] = v;
    });
    ["name", "company", "email", "phone"].forEach((k) => {
      const v = details[k].trim();
      if (v) fields[ENTRY[k]] = v;
    });
    // Submitted server-side (api/submit-corporate-gifting-brief.js) rather
    // than posted directly to Google from here: the live Google Form is
    // paginated (12 pages), and a raw browser POST has no way to obtain the
    // session token Google requires for anything past page 1 - it would
    // silently record only the first answer while still reporting "sent".
    // The server fetches a fresh token and can read Google's real response,
    // so a failure here is a genuine failure, not a guess.
    const res = await fetch("/api/submit-corporate-gifting-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `submit_failed_${res.status}`);
    }
  }, [answers, details]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAttempted(true);

    const missingQuestion = QUESTIONS.find((q) => q.req && isEmpty(answers[q.k]));
    const missingContact = CONTACT_FIELDS.find((f) => f.req && !details[f.k].trim());
    const firstMissingKey = missingQuestion?.k || missingContact?.k;
    if (firstMissingKey) {
      setError("Please fill in the highlighted fields before sending.");
      sectionRefs.current[firstMissingKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (emailInputRef.current && !emailInputRef.current.checkValidity()) {
      setError("Enter a valid email address.");
      sectionRefs.current.email?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await submit();
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitting(false);
      setError("Something went wrong sending your brief. Check your connection and try again.");
    }
  };

  return (
    <div className="sgb">
      <style>{CSS}</style>
      <div className="sgb-wrap">
        <div className="sgb-mast">
          <Mark />
          <div className="sgb-brand">
            <b>Super Merch</b>
            <span>Corporate Gifting</span>
          </div>
        </div>

        <div className="sgb-card">
          {done ? (
            <>
              <div className="sgb-eyebrow">Brief received</div>
              <h1>Thanks{details.name ? `, ${details.name.split(" ")[0]}` : ""}. We have your brief.</h1>
              <p className="sgb-intro">
                We come back within one business day with two or three gift concepts, pricing and lead times.
              </p>
              <dl className="sgb-sum">
                {Object.keys(LABELS).map((k) => {
                  const v = answers[k];
                  if (isEmpty(v)) return null;
                  return (
                    <div className="sgb-row" key={k}>
                      <dt>{LABELS[k]}</dt>
                      <dd>{Array.isArray(v) ? v.join(", ") : v}</dd>
                    </div>
                  );
                })}
                <div className="sgb-row">
                  <dt>Contact</dt>
                  <dd>
                    {details.name}{details.company ? `, ${details.company}` : ""}
                    <br />{details.email}{details.phone ? <><br />{details.phone}</> : null}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <div className="sgb-eyebrow">Corporate Gifting Brief</div>
              <h1>Tell us what you need</h1>
              <p className="sgb-intro">
                Answer the questions below and we will come back with tailored gift concepts, pricing and lead times.
                Fields marked * are required.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {QUESTIONS.map((q) => {
                  const missing = attempted && q.req && isEmpty(answers[q.k]);
                  return (
                    <div
                      key={q.k}
                      className={`sgb-q${missing ? " sgb-q-missing" : ""}`}
                      ref={(el) => { sectionRefs.current[q.k] = el; }}
                    >
                      <label className="sgb-qlabel">{q.t}{q.req ? " *" : ""}</label>
                      {q.h ? <p className="sgb-hint">{q.h}</p> : null}

                      {q.o ? (
                        <div className="sgb-opts">
                          {q.o.map((opt) => {
                            const on = q.multi ? (answers[q.k] || []).includes(opt) : answers[q.k] === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                className="sgb-opt"
                                aria-pressed={on}
                                onClick={() => toggle(q.k, opt, q.multi)}
                              >
                                <span className={`sgb-box${q.multi ? "" : " round"}`}><Tick /></span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {q.date ? (
                        <div className="sgb-field">
                          <input
                            type="date"
                            aria-label={q.t}
                            value={answers.when || ""}
                            onChange={(e) => setAnswers((p) => ({ ...p, when: e.target.value }))}
                          />
                        </div>
                      ) : null}

                      {q.area ? (
                        <div className="sgb-field">
                          <textarea
                            value={answers.notes || ""}
                            placeholder="Optional, but it helps us quote accurately."
                            onChange={(e) => setAnswers((p) => ({ ...p, notes: e.target.value }))}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                <div
                  className={`sgb-q sgb-contact${attempted && CONTACT_FIELDS.some((f) => f.req && !details[f.k].trim()) ? " sgb-q-missing" : ""}`}
                >
                  <label className="sgb-qlabel">How do we reach you?</label>
                  <div className="sgb-contact-grid">
                    {CONTACT_FIELDS.map((f) => (
                      <div className="sgb-field" key={f.k} ref={(el) => { sectionRefs.current[f.k] = el; }}>
                        <label htmlFor={`sgb-${f.k}`}>{f.l}{f.req ? " *" : ""}</label>
                        <input
                          id={`sgb-${f.k}`}
                          type={f.type}
                          value={details[f.k]}
                          ref={f.type === "email" ? emailInputRef : undefined}
                          onChange={(e) => setDetails((p) => ({ ...p, [f.k]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {error ? <p className="sgb-err">{error}</p> : null}

                <button type="submit" className="sgb-next" disabled={submitting}>
                  {submitting ? "Sending…" : "Send my brief"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="sgb-foot">
          Nothing is sent until you click &ldquo;Send my brief.&rdquo;
          <br />Super Merch &middot; Sydney, Australia &middot;{" "}
          <a href="mailto:info@supermerch.com.au">info@supermerch.com.au</a>
        </p>
      </div>
    </div>
  );
}
