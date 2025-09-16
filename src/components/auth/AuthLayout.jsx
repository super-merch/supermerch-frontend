import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, subtitle, linkText, linkPath, linkLabel }) => {
  return (
    <div className="h-screen flex flex-col justify-start pt-4 pb-2 px-8 bg-white">
      {/* Main Content Container */}
      <div className="flex w-full max-w-6xl mx-auto mt-12">
        {/* Left Panel - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative mr-12">
          <div
            className="w-full h-full min-h-[600px] rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url('/authimg/merchlogin.webp')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "scroll",
              width: "100%",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg"></div>

            {/* Content on the left panel - moved to bottom center */}
            <div className="relative z-10 flex flex-col justify-end items-center h-full p-12 text-white">
              <div className="text-center max-w-md">
                <div className="bg-blue-900 bg-opacity-80 rounded-lg p-6 text-center">
                  <h2 className="text-2xl font-bold mb-3">Change The Quality Of Your Life</h2>
                  <p className="text-lg opacity-90">We define the new ways of comfort and style, which will uplift your spirit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <img src="/authimg/supermerch.svg" alt="Super Merch" className="h-16 w-auto" />
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
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
      </div>
    </div>
  );
};

export default AuthLayout;
