import TopBanner from "./TopBanner";
import RefactoredNavbar from "./RefactoredNavbar";
import PropTypes from "prop-types";
import { DiscountModal, EmailModal } from "./Modals";
import { useModals } from "@/hooks/useModals";
import { useCoupons } from "@/hooks/useCoupons";
import { useEmailSubscription } from "@/hooks/useEmailSubscription";

const Navbar = ({}) => {
  const {
    discountModal,
    closeDiscountModal,
    emailModal,
    closeEmailModal,
    setDiscountModal,
    openEmailModal,
  } = useModals();
  const { selectedCoupon, coupenLoading } = useCoupons();
  const { emailInput, setEmailInput, loading, error, handleSubmit, resetForm } =
    useEmailSubscription();
  const handleEmailSubmit = async () => {
    if (selectedCoupon) {
      const result = await handleSubmit(
        selectedCoupon.coupen,
        selectedCoupon.discount
      );
      if (result?.success) {
        closeEmailModal();
        resetForm();
      }
    }
  };
  const onCouponClick = () => {
    setDiscountModal(true);
  };

  const handleDiscountSubscribe = () => {
    closeDiscountModal();
    openEmailModal();
  };

  return (
    <>
      {/* New Top Banner */}
      <TopBanner onCouponClick={onCouponClick} />
      {/* Refactored Main Navigation */}
      <RefactoredNavbar onCouponClick={onCouponClick} />
      <DiscountModal
        isOpen={discountModal}
        onClose={closeDiscountModal}
        onSubscribe={handleDiscountSubscribe}
        selectedCoupon={selectedCoupon}
        coupenLoading={coupenLoading}
      />{" "}
      <EmailModal
        isOpen={emailModal}
        onClose={closeEmailModal}
        onSubmit={handleEmailSubmit}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        error={error}
        loading={loading}
      />
    </>
  );
};

Navbar.propTypes = {
  onCouponClick: PropTypes.func,
};

export default Navbar;
