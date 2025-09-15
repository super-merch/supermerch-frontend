import React from "react";
import { DiscountModal, EmailModal, CookieModal } from "./Modals";
import { useEmailSubscription } from "../../hooks/useEmailSubscription";
import { useCoupons } from "../../hooks/useCoupons";
import PropTypes from "prop-types";

const HomeModals = ({ discountModal, emailModal, cookieModal, closeDiscountModal, closeEmailModal, closeCookieModal, openEmailModal }) => {
  const { selectedCoupon, coupenLoading } = useCoupons();
  const { emailInput, setEmailInput, loading, error, handleSubmit, resetForm } = useEmailSubscription();

  const handleDiscountSubscribe = () => {
    console.log("Discount subscribe clicked");
    closeDiscountModal();
    openEmailModal();
  };

  const handleEmailSubmit = async () => {
    console.log("Email submit clicked");
    if (selectedCoupon) {
      const result = await handleSubmit(selectedCoupon.coupen, selectedCoupon.discount);
      if (result?.success) {
        console.log("Email submitted successfully, closing modal");
        closeEmailModal();
        resetForm();
      }
    }
  };

  const handleCookieAccept = () => {
    closeCookieModal();
  };

  const handleCookieDecline = () => {
    closeCookieModal();
  };

  return (
    <>
      <DiscountModal
        isOpen={discountModal}
        onClose={closeDiscountModal}
        onSubscribe={handleDiscountSubscribe}
        selectedCoupon={selectedCoupon}
        coupenLoading={coupenLoading}
      />

      <EmailModal
        isOpen={emailModal}
        onClose={closeEmailModal}
        onSubmit={handleEmailSubmit}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        error={error}
        loading={loading}
      />

      <CookieModal isOpen={cookieModal} onClose={closeCookieModal} onAccept={handleCookieAccept} onDecline={handleCookieDecline} />
    </>
  );
};

HomeModals.propTypes = {
  discountModal: PropTypes.bool.isRequired,
  emailModal: PropTypes.bool.isRequired,
  cookieModal: PropTypes.bool.isRequired,
  closeDiscountModal: PropTypes.func.isRequired,
  closeEmailModal: PropTypes.func.isRequired,
  closeCookieModal: PropTypes.func.isRequired,
  openEmailModal: PropTypes.func.isRequired,
};

export default HomeModals;
