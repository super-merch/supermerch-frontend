import React from "react";
import logo from "../../../public/supermerch-white.png";

const LoadingOverlay = ({
  title = "Loading",
  subtitle = "Please wait while we process your request...",
  showBrand = true,
  variant = "default", // default, minimal, product
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          background: "bg-gray-900/80 backdrop-blur-sm",
          spinner: "w-8 h-8 border-2 border-gray-300 border-t-white",
          text: "text-white",
        };
      case "product":
        return {
          background: "bg-white",
          spinner: "w-20 h-20 border-4 border-gray-200 border-t-blue-600",
          text: "text-gray-900",
        };
      default:
        return {
          background: "bg-white",
          spinner: "w-16 h-16 border-4 border-gray-200 border-t-blue-600",
          text: "text-gray-900",
        };
    }
  };

  const styles = getVariantStyles();

  if (variant === "product") {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>

        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Logo/Brand */}
          {showBrand && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  <img src={logo} alt="SuperMerch" className="w-10 h-10" />
                </span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">SuperMerch</h1>
                <p className="text-sm text-gray-600">Loading your product...</p>
              </div>
            </div>
          )}

          {/* Main loading spinner */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            {/* Inner pulse */}
            <div className="absolute inset-2 w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-600 max-w-sm">{subtitle}</p>
          </div>

          {/* Progress indicator */}
          <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>

          {/* Loading dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          {/* Bottom text */}
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>This should only take a moment...</p>
          </div>
        </div>

        {/* Prevent any interaction */}
        <div
          className="absolute inset-0 z-20"
          style={{ pointerEvents: "all" }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 ${styles.background} z-[9999] flex items-center justify-center`}
    >
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Brand */}
          {showBrand && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                SuperMerch
              </span>
            </div>
          )}

          {/* Loading Spinner */}
          <div className="relative">
            <div
              className={`${styles.spinner} rounded-full animate-spin`}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
              {title}
            </h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Prevent any interaction */}
      <div
        className="absolute inset-0 z-20"
        style={{ pointerEvents: "all" }}
      ></div>
    </div>
  );
};

export default LoadingOverlay;
