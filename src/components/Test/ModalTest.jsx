import React from "react";
import { useModals } from "../../hooks/useModals";
import { DiscountModal, EmailModal, CookieModal } from "../Home/Modals";

const ModalTest = () => {
  const {
    discountModal,
    emailModal,
    cookieModal,
    openDiscountModal,
    openEmailModal,
    openCookieModal,
    closeDiscountModal,
    closeEmailModal,
    closeCookieModal,
  } = useModals();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Modal Test</h2>

      <div className="space-x-4">
        <button
          onClick={openDiscountModal}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary"
        >
          Open Discount Modal
        </button>

        <button
          onClick={openEmailModal}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Open Email Modal
        </button>

        <button
          onClick={openCookieModal}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Open Cookie Modal
        </button>
      </div>

      <div className="mt-4">
        <p>Discount Modal: {discountModal ? "Open" : "Closed"}</p>
        <p>Email Modal: {emailModal ? "Open" : "Closed"}</p>
        <p>Cookie Modal: {cookieModal ? "Open" : "Closed"}</p>
      </div>

      <DiscountModal
        isOpen={discountModal}
        onClose={closeDiscountModal}
        onSubscribe={openEmailModal}
        selectedCoupon={{ discount: 20, coupen: "TEST20" }}
        coupenLoading={false}
      />

      <EmailModal
        isOpen={emailModal}
        onClose={closeEmailModal}
        onSubmit={() => console.log("Email submitted")}
        emailInput=""
        setEmailInput={() => {}}
        error=""
        loading={false}
      />

      <CookieModal
        isOpen={cookieModal}
        onClose={closeCookieModal}
        onAccept={closeCookieModal}
        onDecline={closeCookieModal}
      />
    </div>
  );
};

export default ModalTest;
