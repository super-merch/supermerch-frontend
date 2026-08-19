import { useContext, useEffect, useState, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const SitePopups = () => {
  const { backendUrl } = useContext(AppContext);
  const [popups, setPopups] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const navigate = useNavigate();

  // Email-gate state (for coupon popups)
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [revealedCoupon, setRevealedCoupon] = useState(null);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/popups/active`);
        if (!res.ok) return;
        const json = await res.json();
        setPopups(json.data || []);
      } catch {
        // Silent
      }
    };
    fetchPopups();
  }, [backendUrl]);

  const shouldShow = useCallback((popup) => {
    const key = `popup_seen_${popup._id}`;
    const lastSeen = localStorage.getItem(key);

    if (popup.displayFrequency === "ONCE" && lastSeen) return false;
    if (popup.displayFrequency === "ONCE_PER_DAY" && lastSeen) {
      const seenDate = new Date(parseInt(lastSeen)).toDateString();
      if (seenDate === new Date().toDateString()) return false;
    }
    return true;
  }, []);

  const markSeen = useCallback((popup) => {
    localStorage.setItem(`popup_seen_${popup._id}`, String(Date.now()));
  }, []);

  const closePopup = useCallback(() => {
    if (activePopup) markSeen(activePopup);
    setActivePopup(null);
    setEmailInput("");
    setEmailError("");
    setEmailLoading(false);
    setRevealedCoupon(null);
    setAlreadySubscribed(false);
    setAgreedToTerms(false);
  }, [activePopup, markSeen]);

  const handleEmailSubmit = useCallback(async (e) => {
    e.preventDefault();
    setEmailError("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!emailPattern.test(emailInput.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!agreedToTerms) {
      setEmailError("Please agree to the terms and conditions");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/subscription/request-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.duplicate) {
        setAlreadySubscribed(true);
      } else if (data.success) {
        setRevealedCoupon(data.couponCode || activePopup?.couponCode);
      } else {
        setEmailError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setEmailError("Connection failed. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  }, [emailInput, backendUrl, activePopup]);

  // Allow header/top-banner CTA to open an admin-managed pop-up immediately.
  useEffect(() => {
    const handleManualTrigger = () => {
      if (!Array.isArray(popups) || popups.length === 0) return;

      const candidate =
        popups.find((p) => p.couponCode && p.isActive) ||
        popups.find((p) => p.type === "FIRST_VISIT" && p.isActive) ||
        popups.find((p) => p.type === "TIMED" && p.isActive) ||
        popups.find((p) => p.isActive);

      if (candidate) {
        setActivePopup(candidate);
      }
    };

    window.addEventListener("triggerDiscountModal", handleManualTrigger);
    return () => {
      window.removeEventListener("triggerDiscountModal", handleManualTrigger);
    };
  }, [popups]);

  // Handle FIRST_VISIT popups
  useEffect(() => {
    if (activePopup) return;
    const firstVisit = popups.find((p) => p.type === "FIRST_VISIT" && shouldShow(p));
    if (firstVisit) {
      const timer = setTimeout(() => setActivePopup(firstVisit), (firstVisit.delaySeconds || 3) * 1000);
      return () => clearTimeout(timer);
    }
  }, [popups, activePopup, shouldShow]);

  // Handle TIMED popups
  useEffect(() => {
    if (activePopup) return;
    const timed = popups.find((p) => p.type === "TIMED" && shouldShow(p));
    if (timed) {
      const timer = setTimeout(() => setActivePopup(timed), (timed.delaySeconds || 10) * 1000);
      return () => clearTimeout(timer);
    }
  }, [popups, activePopup, shouldShow]);

  // Handle EXIT_INTENT popups
  useEffect(() => {
    if (activePopup) return;
    const exitIntent = popups.find((p) => p.type === "EXIT_INTENT" && shouldShow(p));
    if (!exitIntent) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setActivePopup(exitIntent);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [popups, activePopup, shouldShow]);

  if (!activePopup) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={closePopup}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-[90%] mx-4 overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
        >
          <IoClose className="w-5 h-5 text-gray-600" />
        </button>

        {/* Image */}
        {activePopup.imageUrl && (
          <div className="w-full">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.heading || ""}
              className="w-full h-auto max-h-[250px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center">
          {activePopup.heading && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{activePopup.heading}</h2>
          )}
          {activePopup.description && (
            <p className="text-sm text-gray-600 mb-4">{activePopup.description}</p>
          )}

          {/* Coupon email-gate */}
          {activePopup.couponCode ? (
            alreadySubscribed ? (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                This email is already in our system. Check your inbox for your coupon code.
              </div>
            ) : revealedCoupon ? (
              <div className="mb-4 px-4 py-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Your coupon code</p>
                <p className="text-xl font-bold text-primary tracking-wider">{revealedCoupon}</p>
                <p className="text-xs text-gray-400 mt-1">A copy has been sent to your email.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="mb-4 text-left" noValidate>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Enter your email to reveal the code
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  disabled={emailLoading}
                />
                <label className="flex items-start gap-2 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); setEmailError(""); }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary cursor-pointer"
                    disabled={emailLoading}
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      terms and conditions
                    </a>{" "}
                    and consent to receive marketing emails.
                  </span>
                </label>
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full mt-3 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors duration-200 text-sm disabled:opacity-60"
                >
                  {emailLoading ? "Checking…" : "Get My Coupon"}
                </button>
              </form>
            )
          ) : null}

          {/* CTA Button (only shown after coupon revealed or when no coupon gate) */}
          {activePopup.ctaText && (!activePopup.couponCode || revealedCoupon || alreadySubscribed) && (
            <button
              onClick={() => {
                closePopup();
                if (activePopup.ctaLink) navigate(activePopup.ctaLink);
              }}
              className="w-full mt-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors duration-200 text-sm"
            >
              {activePopup.ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitePopups;
