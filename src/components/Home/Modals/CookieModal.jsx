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
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-base font-medium text-gray-900">🍪 Cookies</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors" aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-gray-600 text-sm mb-4">We use cookies to improve your experience. Accept to continue or decline to opt out.</p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Accept
            </button>
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
