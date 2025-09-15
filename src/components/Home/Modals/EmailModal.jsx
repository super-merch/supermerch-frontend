import React, { useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const EmailModal = ({ isOpen, onClose, onSubmit, emailInput, setEmailInput, error, loading }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log("Backdrop clicked, closing modal");
      onClose();
    }
  };

  const handleCloseClick = () => {
    console.log("Close button clicked, closing modal");
    onClose();
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
    <motion.div
      className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl p-6 relative"
        initial={{ opacity: 0.3, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.3, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <button
          className="absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
          onClick={handleCloseClick}
          aria-label="Close modal"
          style={{ zIndex: 9999 }}
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">Enter your email</h2>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCloseClick}
            className="px-4 py-2 rounded bg-gray-200 font-medium hover:bg-gray-300 transition-colors"
            style={{ zIndex: 9999 }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ zIndex: 9999 }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

EmailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  emailInput: PropTypes.string.isRequired,
  setEmailInput: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

export default EmailModal;
