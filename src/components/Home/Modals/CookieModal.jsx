import React, { useEffect } from "react";
import PropTypes from "prop-types";

const CookieModal = ({ isOpen, onClose, onAccept, onDecline }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed bg-black/30 z-40"></div>

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-700 !text-white backdrop-blur-md border-t border-gray-200 shadow-4xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Content */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-white text-base leading-relaxed mb-3">
                  We use cookies to enhance your browsing experience, provide
                  personalized content, and analyze our traffic. By continuing
                  to use our site, you consent to our use of cookies.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto">
              <button
                onClick={() => {
                  onDecline();
                  setTimeout(() => setDiscountModal(true), 500);
                }}
                className="px-6 py-3 text-white hover:text-white text-base font-medium transition-colors duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Decline All
              </button>

              <button
                onClick={() => {
                  onAccept();
                  setTimeout(() => onClose(), 500);
                }}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-base font-semibold transition-colors duration-200 shadow-lg"
              >
                Accept All
              </button>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => setDiscountModal(true), 500);
                }}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 self-center sm:self-auto"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CookieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export default CookieModal;
