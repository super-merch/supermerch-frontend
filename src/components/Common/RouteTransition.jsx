import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import LoadingBar from "./LoadingBar";
import { useState, useEffect } from "react";

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Show loading bar on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Define different animations for different routes
  const getPageVariants = (pathname) => {
    // Home page - slide up with scale
    if (pathname === "/") {
      return {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 1.02 },
        transition: { duration: 0.2, ease: "easeOut" },
      };
    }

    // Product pages - zoom in effect
    if (pathname.includes("/product/")) {
      return {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 1.05, y: -10 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
    }

    // Admin pages - slide from left
    if (pathname.includes("/admin")) {
      return {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
    }

    // Shop/Category pages - slide up
    if (pathname.includes("/shop") || pathname.includes("/category") || pathname.includes("/Clothing") || pathname.includes("/Headwear")) {
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2, ease: "easeOut" },
      };
    }

    // Auth pages - fade with slight scale
    if (pathname.includes("/login") || pathname.includes("/signup")) {
      return {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.02 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
    }

    // Cart/Checkout pages - slide from right
    if (pathname.includes("/cart") || pathname.includes("/checkout")) {
      return {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2, ease: "easeOut" },
      };
    }

    // Default animation - fade with slide
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.2, ease: "easeOut" },
    };
  };

  const pageVariants = getPageVariants(location.pathname);

  return (
    <>
      <LoadingBar isVisible={isLoading} color="blue" />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={pageVariants.initial}
          animate={pageVariants.animate}
          exit={pageVariants.exit}
          transition={pageVariants.transition}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default RouteTransition;
