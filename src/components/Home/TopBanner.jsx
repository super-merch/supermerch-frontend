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
    <div className="w-full sm:py-2 py-3 sm:pt-2 bg-primary">
      <div className="Mycontainer flex flex-wrap md:flex-nowrap md:items-center justify-between gap-2 md:gap-0  md:px-0">
        {/* Left side - Super Merch Logo */}
        <div className="flex items-center order-1 min-w-0 md:min-w-fit">
          <Logo size="medium" logoClassName="brightness-0 invert" />
        </div>

        {/* Center - Promotion text */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-center md:text-center md:flex-1 gap-3">
          {/* Promotion text */}
          <span
            className="flex items-center text-white text-sm md:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
            onClick={handleCouponClick}
          >
            Free Shipping over $999
          </span>

          {/* Vertical separator */}
          <div className="hidden sm:block w-px h-4 bg-white/30"></div>

          {/* Coupon section */}
          <div
            className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCouponClick}
          >
            <span className="underline text-white text-sm md:text-lg font-medium whitespace-nowrap">
              Click here
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
            <FaFacebookF className="text-base sm:text-2xl" />
          </a>

          <a
            href="https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaInstagram className="text-base sm:text-2xl" />
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FaEnvelope className="text-base sm:text-2xl" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
