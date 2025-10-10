import { useState, useCallback } from "react";

export const useModals = () => {
  const [discountModal, setDiscountModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [cookieModal, setCookieModal] = useState(false);

  const openDiscountModal = useCallback(() => setDiscountModal(true), []);
  const closeDiscountModal = useCallback(() => setDiscountModal(false), []);

  const openEmailModal = useCallback(() => setEmailModal(true), []);
  const closeEmailModal = useCallback(() => setEmailModal(false), []);

  const openCookieModal = useCallback(() => setCookieModal(true), []);
  const closeCookieModal = useCallback(() => setCookieModal(false), []);

  const closeAllModals = useCallback(() => {
    setDiscountModal(false);
    setEmailModal(false);
    setCookieModal(false);
  }, []);

  return {
    // Modal states
    discountModal,
    emailModal,
    cookieModal,

    // Discount modal controls
    openDiscountModal,
    closeDiscountModal,

    // Email modal controls
    openEmailModal,
    closeEmailModal,

    // Cookie modal controls
    openCookieModal,
    closeCookieModal,

    // Utility
    closeAllModals,

    setDiscountModal,
    setEmailModal,
    setCookieModal,
  };
};
