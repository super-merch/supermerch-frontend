/**
 * Corporate Gifting Brief — one question per screen.
 *
 * Self-contained: no Tailwind, no UI library, no new dependencies.
 * Submissions POST into the existing Google Form, so answers keep landing in
 * "Corporate Gifting Brief - Responses" in the info@supermerch.com.au Drive.
 *
 * Routed at /corporate-gifting-brief.
 *
 * Fraunces and Karla are loaded globally in index.html rather than here,
 * since the app already loads its base font (Figtree) that way.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScSBInnD9hgicM4FHVfCXJyyYEd8XRBiiUEOZ2x4_XYfbXR0Q/formResponse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    t: "With or without alcohol?",
    o: ["With alcohol", "Without alcohol", "A mix, some of each", "Depends on the recipient, let us discuss"],
  },
  {
    k: "branding",
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
    t: "All in one go, or stored and released over time?",
    h: "We can hold your stock and ship it as you need it.",
    o: ["All in one go", "Store them and release in batches as we need them", "Not sure, tell me how storage works"],
  },
  {
    k: "delivery",
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
  {
    k: "details",
    t: "Last one. How do we reach you?",
    fields: [
      { k: "name", l: "Your name", type: "text", req: true },
      { k: "company", l: "Company", type: "text", req: true },
      { k: "email", l: "Email", type: "email", req: true },
      { k: "phone", l: "Best contact number", type: "tel" },
    ],
  },
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
  --line:#DCE5E2;--focus:#00796B;
  background:var(--paper);color:var(--ink);min-height:100vh;
  font-family:Karla,-apple-system,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.sgb *{box-sizing:border-box}
.sgb-wrap{max-width:720px;margin:0 auto;padding-block:28px 64px;padding-left:20px;padding-right:20px}
.sgb-mast{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.sgb-mark{width:34px;height:34px;flex-shrink:0}
.sgb-brand b{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:19px;display:block;letter-spacing:-.01em}
.sgb-brand span{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.sgb-prog{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.sgb-track{flex:1;height:3px;background:var(--line);border-radius:99px;overflow:hidden}
.sgb-fill{height:100%;background:var(--teal);transition:width .45s cubic-bezier(.4,0,.2,1)}
.sgb-count{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);
  font-variant-numeric:tabular-nums;white-space:nowrap}
.sgb-card{background:var(--card);border:1px solid var(--line);border-radius:3px;padding:34px 34px 30px;
  box-shadow:0 1px 2px rgba(13,42,39,.05),0 12px 34px -18px rgba(13,42,39,.3)}
.sgb-eyebrow{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:12px}
.sgb-card h1{font-family:Fraunces,Georgia,serif;font-weight:400;font-size:30px;line-height:1.22;margin:0;
  letter-spacing:-.015em;text-wrap:balance}
.sgb-hint{color:var(--soft);font-size:14.5px;margin:10px 0 0;line-height:1.55}
.sgb-opts{display:flex;flex-direction:column;gap:7px;margin-top:24px}
.sgb-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:transparent;
  border:1px solid var(--line);border-radius:2px;padding:13px 15px;font:inherit;font-size:15px;color:var(--ink);
  cursor:pointer;transition:border-color .14s,background .14s}
.sgb-opt:hover{border-color:var(--teal);background:var(--wash)}
.sgb-opt:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.sgb-opt[aria-pressed="true"]{border-color:var(--teal);background:var(--wash)}
.sgb-box{width:17px;height:17px;border:1.5px solid var(--line);flex-shrink:0;display:grid;place-items:center;transition:all .14s}
.sgb-box.round{border-radius:99px}
.sgb-opt[aria-pressed="true"] .sgb-box{background:var(--teal);border-color:var(--teal)}
.sgb-tick{width:10px;height:10px;opacity:0;transition:opacity .12s}
.sgb-opt[aria-pressed="true"] .sgb-tick{opacity:1}
.sgb-key{margin-left:auto;font-size:11px;color:var(--soft);opacity:.7;font-variant-numeric:tabular-nums}
.sgb-field{margin-top:20px}
.sgb-field label{display:block;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);margin-bottom:2px}
.sgb input,.sgb textarea{width:100%;font:inherit;font-size:15.5px;color:var(--ink);background:transparent;
  border:0;border-bottom:1.5px solid var(--line);padding:11px 2px;border-radius:0;transition:border-color .15s}
.sgb input:focus,.sgb textarea:focus{outline:none;border-bottom-color:var(--teal)}
.sgb textarea{border:1px solid var(--line);padding:12px;min-height:110px;resize:vertical;line-height:1.55}
.sgb-nav{display:flex;align-items:center;gap:12px;margin-top:28px;flex-wrap:wrap}
.sgb-next{background:var(--teal);color:#fff;border:0;border-radius:2px;padding:12px 26px;font:inherit;
  font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;display:inline-block}
.sgb-next:hover{background:var(--focus)}
.sgb-next:disabled{opacity:.35;cursor:not-allowed}
.sgb-back{background:none;border:0;color:var(--soft);font:inherit;font-size:14px;cursor:pointer;padding:12px 4px;
  text-decoration:underline;text-underline-offset:3px}
.sgb-enter{margin-left:auto;font-size:11.5px;color:var(--soft)}
.sgb-enter kbd{font-family:inherit;border:1px solid var(--line);border-radius:2px;padding:1px 5px;font-size:10.5px}
.sgb-sum{margin-top:22px;border-top:1px solid var(--line)}
.sgb-row{display:flex;gap:18px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14.5px}
.sgb-row dt{flex:0 0 40%;color:var(--soft);margin:0}
.sgb-row dd{margin:0;flex:1}
.sgb-foot{margin-top:26px;font-size:12.5px;color:var(--soft);text-align:center;line-height:1.7}
.sgb-foot a{color:var(--teal)}
.sgb-err{color:#C0392B;font-size:13px;margin-top:14px}
@media (max-width:560px){
  .sgb-card{padding:26px 20px 24px}
  .sgb-card h1{font-size:25px}
  .sgb-row{flex-direction:column;gap:2px}
  .sgb-row dt{flex:none}
  .sgb-key{display:none}
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

export default function CorporateGiftingBrief() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [details, setDetails] = useState({ name: "", company: "", email: "", phone: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pickTimeoutRef = useRef(null);

  const q = QUESTIONS[step];

  const submit = useCallback(async () => {
    const fd = new FormData();
    Object.keys(LABELS).forEach((k) => {
      const v = answers[k];
      if (!v || (Array.isArray(v) && !v.length)) return;
      if (k === "when") {
        const [y, m, d] = String(v).split("-");
        if (y && m && d) {
          fd.append(`entry.${ENTRY.when}_year`, y);
          fd.append(`entry.${ENTRY.when}_month`, String(Number(m)));
          fd.append(`entry.${ENTRY.when}_day`, String(Number(d)));
        }
        return;
      }
      if (Array.isArray(v)) v.forEach((one) => fd.append(`entry.${ENTRY[k]}`, one));
      else fd.append(`entry.${ENTRY[k]}`, v);
    });
    ["name", "company", "email", "phone"].forEach((k) => {
      if (details[k]) fd.append(`entry.${ENTRY[k]}`, details[k]);
    });
    // Google Forms sends no CORS headers, so a resolved fetch is opaque and
    // does not prove Google accepted the data. A REJECTED fetch, though, does
    // prove the request never left the browser (offline, DNS failure, an
    // extension or proxy blocking it) - worth surfacing rather than swallowing.
    await fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body: fd });
  }, [answers, details]);

  const advance = useCallback(() => {
    if (pickTimeoutRef.current) {
      clearTimeout(pickTimeoutRef.current);
      pickTimeoutRef.current = null;
    }
    setError("");
    if (q.fields) {
      const missing = q.fields.find((f) => f.req && !details[f.k].trim());
      if (missing) {
        setError(`${missing.l} is needed so we can send your quote.`);
        return;
      }
      const emailField = q.fields.find((f) => f.type === "email");
      if (emailField && details[emailField.k].trim() && !EMAIL_RE.test(details[emailField.k].trim())) {
        setError("Enter a valid email address.");
        return;
      }
      if (submitting) return;
      setSubmitting(true);
      submit()
        .then(() => {
          setDone(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(() => {
          setSubmitting(false);
          setError("Something went wrong sending your brief. Check your connection and try again.");
        });
      return;
    }
    if (q.o) {
      const v = answers[q.k];
      if (!v || (Array.isArray(v) && !v.length)) return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q, answers, details, submit, submitting]);

  const pick = (opt) => {
    setAnswers((prev) => {
      if (q.multi) {
        const list = prev[q.k] || [];
        return { ...prev, [q.k]: list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt] };
      }
      return { ...prev, [q.k]: opt };
    });
    if (!q.multi) {
      if (pickTimeoutRef.current) clearTimeout(pickTimeoutRef.current);
      pickTimeoutRef.current = setTimeout(() => {
        pickTimeoutRef.current = null;
        setStep((s) => Math.min(s + 1, QUESTIONS.length - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 180);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (done) return;
      const active = document.activeElement;
      const tag = active && active.tagName;
      const onOption = active && active.classList && active.classList.contains("sgb-opt");
      // An option button handles its own Enter-to-click activation natively;
      // hijacking it here (as this used to) silently ate that keypress
      // whenever nothing was selected yet, since advance() has nothing to do.
      if (e.key === "Enter" && tag !== "TEXTAREA" && !onOption) { e.preventDefault(); advance(); }
      if (q.o && /^[1-9]$/.test(e.key) && tag !== "INPUT" && tag !== "TEXTAREA") {
        const opt = q.o[Number(e.key) - 1];
        if (opt) pick(opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pct = done ? 100 : (step / QUESTIONS.length) * 100 + 8;

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

        <div className="sgb-prog">
          <div className="sgb-track"><div className="sgb-fill" style={{ width: `${pct}%` }} /></div>
          <div className="sgb-count">
            {done ? "Complete" : `${String(step + 1).padStart(2, "0")} / ${QUESTIONS.length}`}
          </div>
        </div>

        <div className="sgb-card">
          {done ? (
            <>
              <div className="sgb-eyebrow">Brief received</div>
              <h1>Thanks{details.name ? `, ${details.name.split(" ")[0]}` : ""}. We have your brief.</h1>
              <p className="sgb-hint">
                We come back within one business day with two or three gift concepts, pricing and lead times.
              </p>
              <dl className="sgb-sum">
                {Object.keys(LABELS).map((k) => {
                  const v = answers[k];
                  if (!v || (Array.isArray(v) && !v.length)) return null;
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
              <div className="sgb-eyebrow">Question {step + 1}</div>
              <h1>{q.t}</h1>
              {q.h ? <p className="sgb-hint">{q.h}</p> : null}

              {q.o ? (
                <div className="sgb-opts">
                  {q.o.map((opt, n) => {
                    const on = q.multi ? (answers[q.k] || []).includes(opt) : answers[q.k] === opt;
                    return (
                      <button type="button" key={opt} className="sgb-opt" aria-pressed={on} onClick={() => pick(opt)}>
                        <span className={`sgb-box${q.multi ? "" : " round"}`}><Tick /></span>
                        {opt}
                        <span className="sgb-key">{n + 1}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {q.date ? (
                <div className="sgb-field">
                  <label htmlFor="sgb-date">Date needed</label>
                  <input id="sgb-date" type="date" value={answers.when || ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, when: e.target.value }))} />
                </div>
              ) : null}

              {q.area ? (
                <div className="sgb-field">
                  <textarea value={answers.notes || ""} placeholder="Optional, but it helps us quote accurately."
                    onChange={(e) => setAnswers((p) => ({ ...p, notes: e.target.value }))} />
                </div>
              ) : null}

              {q.fields
                ? q.fields.map((f) => (
                    <div className="sgb-field" key={f.k}>
                      <label htmlFor={`sgb-${f.k}`}>{f.l}{f.req ? " *" : ""}</label>
                      <input id={`sgb-${f.k}`} type={f.type} value={details[f.k]}
                        onChange={(e) => setDetails((p) => ({ ...p, [f.k]: e.target.value }))} />
                    </div>
                  ))
                : null}

              {error ? <p className="sgb-err">{error}</p> : null}

              <div className="sgb-nav">
                {step > 0 ? (
                  <button type="button" className="sgb-back" onClick={() => { setError(""); setStep((s) => s - 1); }}>Back</button>
                ) : null}
                <button type="button" className="sgb-next" onClick={advance} disabled={submitting}>
                  {submitting ? "Sending…" : step === QUESTIONS.length - 1 ? "Send my brief" : "Next"}
                </button>
                <span className="sgb-enter">Press <kbd>Enter</kbd> to continue</span>
              </div>
            </>
          )}
        </div>

        <p className="sgb-foot">
          Two minutes, one question at a time. Nothing is sent until the last step.
          <br />Super Merch &middot; Sydney, Australia &middot;{" "}
          <a href="mailto:info@supermerch.com.au">info@supermerch.com.au</a>
        </p>
      </div>
    </div>
  );
}
