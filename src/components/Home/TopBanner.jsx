import React from "react";
import { FaTag, FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";
import useCmsData from "../../hooks/useCmsData";

const ICON_MAP = { FaFacebookF, FaInstagram, FaEnvelope };

const TopBanner = ({ onCouponClick }) => {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/top-banner");
  const promoText = cmsData?.points?.promoText;
  const ctaText = cmsData?.points?.ctaText;
  const socialLinks = Array.isArray(cmsData?.points?.socialLinks)
    ? cmsData.points.socialLinks
    : [];
  const showShimmer = !promoText || !ctaText;
  const handleCouponClick = () => {
    if (onCouponClick) {
      onCouponClick();
    } else {
      // Fallback: scroll to a coupon section or show alert
      alert("Get your discount coupon now!");
    }
  };

  return (
    <div
      className="w-full py-2 sm:pt-2 bg-primary"
      data-chat-offset="top-banner"
    >
      {showShimmer ? (
        <div className="Mycontainer flex items-center justify-between gap-4 animate-pulse">
          <div className="h-8 w-28 bg-white/30 rounded"></div>
          <div className="flex-1 max-w-xl">
            <div className="h-4 w-full bg-white/30 rounded mb-2"></div>
            <div className="h-4 w-1/3 bg-white/30 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-white/30"></div>
            <div className="h-7 w-7 rounded-full bg-white/30"></div>
            <div className="h-7 w-7 rounded-full bg-white/30"></div>
          </div>
        </div>
      ) : (
      <div className="Mycontainer flex flex-wrap md:flex-nowrap md:items-center justify-between gap-2 md:gap-0  md:px-0">
        {/* Center - Promotion text */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-center md:text-center md:flex-1 gap-3">
          {/* Promotion text */}
          <span
            className="flex items-center text-white text-sm md:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
            onClick={handleCouponClick}
          >
            {promoText}
          </span>

          {/* Vertical separator — desktop only */}
          <div className="hidden sm:block w-px h-4 bg-white/30"></div>

          {/* Coupon section — desktop only */}
          <div
            className="hidden sm:flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCouponClick}
          >
            <span className="underline text-white text-sm md:text-lg font-medium whitespace-nowrap">
              {ctaText}
            </span>
          </div>
        </div>

        {/* Right side - Social media icons */}
        <div className="flex items-center gap-3 md:gap-5 order-2 md:order-3 ml-auto shrink-0">
          {socialLinks.length > 0 ? (
            socialLinks.map((link, i) => {
              const IconComp = ICON_MAP[link.icon] || FaEnvelope;
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  <IconComp className="text-base sm:text-3xl" />
                </a>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default TopBanner;
