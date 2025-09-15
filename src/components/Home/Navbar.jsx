import TopBanner from "./TopBanner";
import RefactoredNavbar from "./RefactoredNavbar";
import PropTypes from "prop-types";

const Navbar = ({ onCouponClick }) => {
  return (
    <>
      {/* New Top Banner */}
      <TopBanner onCouponClick={onCouponClick} />

      {/* Refactored Main Navigation */}
      <RefactoredNavbar onCouponClick={onCouponClick} />
    </>
  );
};

Navbar.propTypes = {
  onCouponClick: PropTypes.func,
};

export default Navbar;
