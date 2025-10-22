import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";
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
    <div className={`relative z-20 flex items-center gap-2 ${className} `}>
      {/* Cart */}
      <Link
        to="/cart"
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {cartQuantity > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-primary text-white rounded-full ${currentSize.badge} flex items-center justify-center px-1.5 min-w-[18px] max-w-[36px]`}
          >
            <span className="text-xs font-semibold">
              {cartQuantity > 999 ? "999+" : cartQuantity}
            </span>
          </span>
        )}
        <HiOutlineShoppingCart
          className={`${currentSize.icon} text-customBlue hover:text-primary transition-colors`}
        />
      </Link>

      {/* Favourites */}
      <Link
        to="/favourites"
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {favouriteQuantity > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-white border border-red-500 text-red-500 rounded-full ${currentSize.badge} flex items-center justify-center px-1.5 min-w-[18px] max-w-[36px]`}
          >
            <span className="text-xs font-bold truncate">
              {favouriteQuantity > 999 ? "999+" : favouriteQuantity}
            </span>
          </span>
        )}
        <HiOutlineHeart
          className={`${currentSize.icon} text-customBlue hover:text-red-500 transition-colors`}
        />
      </Link>

      {/* User Account */}
      {!isAuthenticated ? (
        <Link
          to="/login"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiOutlineUser
            className={`${currentSize.icon} text-customBlue hover:text-primary transition-colors`}
          />
        </Link>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <HiOutlineUser
            onClick={toggleLogout}
            className={`${currentSize.icon} cursor-pointer text-customBlue hover:text-primary transition-colors  hover:bg-gray-100 rounded-lg`}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 bg-white border rounded-lg shadow-lg z-50">
              <ul>
                <Link
                  onClick={() => setIsDropdownOpen(false)}
                  to="/admin"
                  className="px-4 py-3 block text-black cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg"
                >
                  Manage Orders
                </Link>
                <li
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="px-4 py-3 text-black cursor-pointer hover:bg-gray-100 transition-colors rounded-b-lg"
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
