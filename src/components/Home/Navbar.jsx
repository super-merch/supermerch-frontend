import TopBanner from "./TopBanner";
import RefactoredNavbar from "./RefactoredNavbar";
import PropTypes from "prop-types";

const Navbar = ({ onCouponClick }) => {
  const handleCouponClick = () => {
    if (typeof onCouponClick === "function") {
      onCouponClick();
      return;
    }
    window.dispatchEvent(new CustomEvent("triggerDiscountModal"));
  };

  return (
    <>
      {/* New Top Banner */}
      <TopBanner onCouponClick={handleCouponClick} />
      {/* Refactored Main Navigation */}
      <RefactoredNavbar onCouponClick={handleCouponClick} />
    </>
  );
};

Navbar.propTypes = {
  onCouponClick: PropTypes.func,
};

export default Navbar;
