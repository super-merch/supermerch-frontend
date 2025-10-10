import React from "react";
import { FaTag, FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";
import { Logo } from "../Common";

const TopBanner = ({ onCouponClick }) => {
  const handleCouponClick = () => {
    if (onCouponClick) {
      onCouponClick();
    } else {
      // Fallback: scroll to a coupon section or show alert
      alert("Get your discount coupon now!");
    }
  };

  return (
    <div className="w-full py-2 pt-3 sm:pt-2 bg-gray-900">
      <div className="Mycontainer flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-0 px-3 md:px-0">
        {/* Left side - Super Merch Logo */}
        <div className="flex items-center order-1 min-w-0 md:min-w-fit">
          <Logo size="medium" logoClassName="brightness-0 invert" />
        </div>

        {/* Center - Promotion text */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center md:text-center gap-1 sm:gap-2 md:gap-3 px-1 md:flex-1">
          <span
            className="text-white text-xs sm:text-sm md:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
            onClick={handleCouponClick}
          >
            50% Promotion is going on
          </span>

          {/* Vertical separator */}
          <div className="w-px h-3 sm:h-4 md:h-5 bg-white opacity-60"></div>

          {/* Coupon section with icon */}
          <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCouponClick}>
            <FaTag className="hidden sm:block text-white text-xs sm:text-sm md:text-lg" />
            <span className="text-white text-xs sm:text-sm md:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap">
              Get Discount Using Coupon
            </span>
          </div>
        </div>

        {/* Right side - Social media icons */}
        <div className="flex items-center gap-3 md:gap-6 order-2 md:order-3 ml-auto shrink-0">
          <a
            href="https://www.facebook.com/share/1DztGRWqfA/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaFacebookF className="text-base sm:text-xl" />
          </a>

          <a
            href="https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaInstagram className="text-base sm:text-xl" />
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaEnvelope className="text-base sm:text-xl" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
