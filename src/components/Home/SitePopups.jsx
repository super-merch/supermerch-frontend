import { useContext, useEffect, useState, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const SitePopups = () => {
  const { backendUrl } = useContext(AppContext);
  const [popups, setPopups] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const navigate = useNavigate();

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
  }, [activePopup, markSeen]);

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

          {/* Coupon Code */}
          {activePopup.couponCode && (
            <div className="mb-4 px-4 py-2 bg-gray-100 rounded-lg inline-block">
              <p className="text-xs text-gray-500 mb-1">Use code</p>
              <p className="text-lg font-bold text-primary tracking-wider">{activePopup.couponCode}</p>
            </div>
          )}

          {/* CTA Button */}
          {activePopup.ctaText && (
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
