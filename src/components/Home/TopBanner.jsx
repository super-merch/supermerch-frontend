import React from "react";
import { FaTag, FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";
import { Logo } from "../Common";

const TopBanner = ({ onCouponClick }) => {
  const handleCouponClick = () => {
    if (onCouponClick) {
      onCouponClick();
    } else {
      // Fallback: scroll to a coupon section or show alert
      console.log("Coupon clicked!");
      alert("Get your discount coupon now!");
    }
  };

  return (
    <div className="w-full py-2 flex items-center justify-between" style={{ backgroundColor: "#1976D2" }}>
      <div className="Mycontainer flex items-center justify-between">
        {/* Left side - Super Merch Logo */}
        <div className="flex items-center">
          <Logo size="small" logoClassName="brightness-0 invert" />
        </div>

        {/* Center - Promotion text */}
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCouponClick}>
            50% Promotion is going on
          </span>

          {/* Vertical separator */}
          <div className="w-px h-5 bg-white opacity-60"></div>

          {/* Coupon section with icon */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCouponClick}>
            <FaTag className="text-white text-sm" />
            <span className="text-white text-sm font-medium">Get Discount Using Coupon</span>
          </div>
        </div>

        {/* Right side - Social media icons */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.facebook.com/share/1DztGRWqfA/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaFacebookF className="text-lg" />
          </a>

          <a
            href="https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaInstagram className="text-lg" />
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaEnvelope className="text-lg" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
