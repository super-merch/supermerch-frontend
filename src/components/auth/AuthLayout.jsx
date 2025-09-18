import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, subtitle, linkText, linkPath, linkLabel }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-8 relative"
      style={{
        backgroundImage: `url('/authimg/authbg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
      {/* Centered Auth Form Container with card design */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 relative z-10">
        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Auth Form Content */}
        {children}

        {/* Auth Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {linkText}{" "}
            <Link to={linkPath} className="font-medium text-blue-600 hover:text-blue-500">
              {linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
