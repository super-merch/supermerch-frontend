import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const Modal = ({
  isOpen,
  onClose,
  children,
  size = "md", // "sm", "md", "lg", "xl", "full"
  variant = "default", // "default", "centered", "bottom", "fancy"
  showBackdrop = true,
  backdropClassName = "",
  className = "",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeButtonClassName = "",
  animation = "fade", // "fade", "scale", "slide", "none"
  ...props
}) => {
  // Don't render if not open
  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "max-w-full mx-4",
  };

  // Variant classes
  const variantClasses = {
    default: "items-center",
    centered: "items-center",
    bottom: "items-end sm:items-center",
    fancy: "items-center",
  };

  // Animation variants
  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    slide: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, closeOnEscape]);

  const currentAnimation = animationVariants[animation] || animationVariants.fade;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex justify-center p-4 ${showBackdrop ? "bg-black bg-opacity-50 backdrop-blur-sm" : ""} ${
        variantClasses[variant]
      } ${backdropClassName}`}
      onClick={handleBackdropClick}
      initial={currentAnimation.initial}
      animate={currentAnimation.animate}
      exit={currentAnimation.exit}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <motion.div
        className={`relative w-full ${sizeClasses[size]} ${className}`}
        initial={currentAnimation.initial}
        animate={currentAnimation.animate}
        exit={currentAnimation.exit}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors z-10 ${closeButtonClassName}`}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl", "3xl", "full"]),
  variant: PropTypes.oneOf(["default", "centered", "bottom", "fancy"]),
  showBackdrop: PropTypes.bool,
  backdropClassName: PropTypes.string,
  className: PropTypes.string,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  closeButtonClassName: PropTypes.string,
  animation: PropTypes.oneOf(["fade", "scale", "slide", "none"]),
};

export default Modal;
