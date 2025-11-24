import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import supermerch from "../../assets/supermerch.png";

const Logo = ({
  className = "",
  logoClassName = "",
  showTagline = false,
  taglineClassName = "",
  size = "default", // "small", "default", "large"
}) => {
  const sizeClasses = {
    small: {
      logo: "w-16 lg:w-20",
      tagline: "text-xs",
    },
    default: {
      logo: "w-24 lg:w-36",
      tagline: "text-sm",
    },
    large: {
      logo: "w-32 lg:w-48",
      tagline: "text-base",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <Link to="/" className={`relative z-10 ${className}`}>
      <div className="flex items-center gap-3">
        <img
          src={supermerch}
          className={`object-contain ${currentSize.logo} ${logoClassName}`}
          alt="Super Merch Logo"
        />
        {showTagline && (
          <div className="hidden sm:block">
            <div className="text-customBlue font-bold text-lg leading-tight">
              Super Merch
            </div>
            <div
              className={`text-gray-500 ${currentSize.tagline} ${taglineClassName}`}
            >
              Fresh Trends, Lasting Impressions
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

Logo.propTypes = {
  className: PropTypes.string,
  logoClassName: PropTypes.string,
  showTagline: PropTypes.bool,
  taglineClassName: PropTypes.string,
  size: PropTypes.oneOf(["small", "default", "large"]),
};

export default Logo;
