import React from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight, MdHome } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";

const NavigateAbout = () => {
  return (
    <section className="bg-gradient-to-r from-gray-50 to-white py-6 border-b border-gray-100">
      <div className="Mycontainer">
        <nav
          className="flex items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            to={"/"}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-200 group"
          >
            <MdHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Home</span>
          </Link>

          <MdKeyboardArrowRight className="text-gray-400 w-4 h-4" />

          <div className="flex items-center gap-2 text-primary">
            <FaUserFriends className="w-4 h-4" />
            <span className="font-semibold">About Us</span>
          </div>
        </nav>

        {/* Page Title */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">About SuperMerch</h1>
          <p className="text-gray-600 mt-1">
            Discover our story, values, and commitment to excellence
          </p>
        </div>
      </div>
    </section>
  );
};

export default NavigateAbout;
