import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser } from "react-icons/hi";
import PropTypes from "prop-types";

const UserActions = ({
  isAuthenticated = false,
  onLogout,
  cartQuantity = 0,
  favouriteQuantity = 0,
  className = "",
  size = "default", // "small", "default", "large"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sizeClasses = {
    small: {
      icon: "text-2xl",
      badge: "text-xs w-4 h-4",
    },
    default: {
      icon: "text-3xl",
      badge: "text-xs w-5 h-5",
    },
    large: {
      icon: "text-4xl",
      badge: "text-sm w-6 h-6",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  const toggleLogout = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative z-20 flex items-center gap-4 lg:gap-6 md:gap-6 sm:gap-4 ${className}`}>
      {/* Cart */}
      <Link to="/cart" className="relative">
        {cartQuantity > 0 && (
          <span
            className={`absolute -top-1.5 right-[75%] bg-white border border-red-500 text-red-500 rounded-full ${currentSize.badge} flex items-center justify-center`}
          >
            {cartQuantity}
          </span>
        )}
        <HiOutlineShoppingCart className={`${currentSize.icon} text-customBlue hover:text-blue-600 transition-colors`} />
      </Link>

      {/* Favourites */}
      <Link to="/favourites" className="relative">
        {favouriteQuantity > 0 && (
          <span
            className={`absolute -top-1.5 right-[35%] bg-white border border-red-500 text-red-500 rounded-full ${currentSize.badge} flex items-center justify-center`}
          >
            {favouriteQuantity}
          </span>
        )}
        <HiOutlineHeart className={`${currentSize.icon} text-customBlue hover:text-red-500 transition-colors`} />
      </Link>

      {/* User Account */}
      {!isAuthenticated ? (
        <Link to="/signup">
          <HiOutlineUser className={`${currentSize.icon} text-customBlue hover:text-blue-600 transition-colors`} />
        </Link>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <HiOutlineUser
            onClick={toggleLogout}
            className={`${currentSize.icon} cursor-pointer text-customBlue hover:text-blue-600 transition-colors`}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 bg-white border rounded shadow-lg z-50">
              <ul>
                <Link
                  onClick={() => setIsDropdownOpen(false)}
                  to="/admin"
                  className="px-4 py-2 block text-black cursor-pointer hover:bg-gray-100"
                >
                  Manage Orders
                </Link>
                <li
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="px-4 py-2 text-black cursor-pointer hover:bg-gray-100"
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

UserActions.propTypes = {
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func,
  cartQuantity: PropTypes.number,
  favouriteQuantity: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "default", "large"]),
};

export default UserActions;
