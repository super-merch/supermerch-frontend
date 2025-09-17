import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const AnimatedRoute = ({ children, animationType = "fade", duration = 0.2 }) => {
  const location = useLocation();

  // Animation variants based on route
  const getRouteAnimation = (pathname) => {
    // Different animations for different types of pages
    if (pathname.includes("/product/")) {
      return {
        initial: { opacity: 0, scale: 0.98, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 1.02, y: -10 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
    }

    if (pathname.includes("/admin")) {
      return {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
    }

    if (pathname === "/" || pathname.includes("/shop") || pathname.includes("/category")) {
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2, ease: "easeOut" },
      };
    }

    // Default animation
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration, ease: "easeOut" },
    };
  };

  const animation = getRouteAnimation(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

AnimatedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  animationType: PropTypes.string,
  duration: PropTypes.number,
};

export default AnimatedRoute;
