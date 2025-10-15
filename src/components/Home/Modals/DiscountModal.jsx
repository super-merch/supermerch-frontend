import React, { useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const DiscountModal = ({
  isOpen,
  onClose,
  onSubscribe,
  selectedCoupon,
  coupenLoading,
}) => {
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
    <motion.div
      className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="flex w-[90%] md:max-w-[30%] sm:w-full text-gray-800 justify-center bg-white rounded-lg relative"
        initial={{ opacity: 0.2, z: 50 }}
        animate={{ opacity: 1, z: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute" />
          <div className="relative w-full max-w-md mx-4">
            <div className="absolute -inset-2 -z-10 rotate-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-indigo-500 opacity-30 blur-2xl" />
            <div className="relative rounded-lg bg-white p-4 shadow-2xl ring-1 ring-slate-100">
              <button
                className="absolute max-sm:top-[0] right-[20px] top-4 text-lg font-semibold cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  Celebrate Savings
                </h3>
                <p className="mt-1 text-slate-600">Your reward is ready</p>
                <div
                  className={`mt-5 ${
                    coupenLoading
                      ? "text-xl font-semibold"
                      : "text-5xl font-extrabold"
                  } text-slate-900`}
                >
                  {coupenLoading
                    ? "Loading..."
                    : `${selectedCoupon?.discount ?? 0} % OFF`}
                </div>
                <button
                  onClick={onSubscribe}
                  className="mt-6 inline-flex w-max items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-800 transition-colors"
                >
                  Subscribe & Redeem
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  Limited time offer.
                </p>
                <p className="mt-1 italic text-xs text-slate-500">
                  * Terms & conditions applies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

DiscountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubscribe: PropTypes.func.isRequired,
  selectedCoupon: PropTypes.object,
  coupenLoading: PropTypes.bool,
};

export default DiscountModal;
