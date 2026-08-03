// src/components/Common/CookieConsentBanner.jsx
//
// Mounts the (previously dead-code) CookieModal for real and wires its
// Accept/Decline buttons to actually gate GA4/Meta Pixel/Clarity loading.
//
// Behaviour:
// - First visit (no stored decision): shows the banner. Declining or simply
//   closing it (X / backdrop / Escape) leaves analytics off — GA4/Meta
//   Pixel/Clarity never load — and does NOT persist a decision, so the
//   shopper is asked again on their next visit. Explicitly clicking
//   "Decline All" persists that choice so we stop asking.
// - Accepting persists the choice and loads the providers immediately.
// - Once a decision is stored, the banner does not show again automatically.
//   A "Cookie Preferences" link/button anywhere in the app can dispatch the
//   `openCookiePreferences` window event to reopen it (see Footer.jsx).
//
// This is a dismissible banner only — it never blocks browsing, cart, or
// checkout; it only gates the three analytics providers above.

import { useEffect, useState } from "react";
import CookieModal from "../Home/Modals/CookieModal";
import {
  getStoredConsent,
  grantAnalyticsConsent,
  declineAnalyticsConsent,
} from "@/lib/analytics";

const CookieConsentBanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // No stored decision yet -> prompt. Already decided -> stay hidden.
    if (getStoredConsent() === null) {
      setIsOpen(true);
    }
  }, []);

  // Lets any part of the app (e.g. a footer "Cookie Preferences" link)
  // reopen the banner so the shopper can change their mind later.
  useEffect(() => {
    const handleReopen = () => setIsOpen(true);
    window.addEventListener("openCookiePreferences", handleReopen);
    return () => window.removeEventListener("openCookiePreferences", handleReopen);
  }, []);

  const handleAccept = () => {
    grantAnalyticsConsent();
    setIsOpen(false);
  };

  const handleDecline = () => {
    declineAnalyticsConsent();
    setIsOpen(false);
  };

  const handleClose = () => {
    // Dismissing without an explicit choice does not persist a decision —
    // analytics stays off (default) and we'll ask again next visit.
    setIsOpen(false);
  };

  return (
    <CookieModal
      isOpen={isOpen}
      onClose={handleClose}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
};

export default CookieConsentBanner;
