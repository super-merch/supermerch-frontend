import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

const TransitionWrapper = ({ children, type = "fade", duration = 0.2, delay = 0, showLoadingBar = true }) => {
  // Different animation types
  const getVariants = (animationType) => {
    const variants = {
      fade: {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 },
      },
      slideUp: {
        initial: { opacity: 0, y: 30 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -30 },
      },
      slideDown: {
        initial: { opacity: 0, y: -30 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: 30 },
      },
      slideLeft: {
        initial: { opacity: 0, x: 30 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -30 },
      },
      slideRight: {
        initial: { opacity: 0, x: -30 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 30 },
      },
      scale: {
        initial: { opacity: 0, scale: 0.9 },
        in: { opacity: 1, scale: 1 },
        out: { opacity: 0, scale: 1.1 },
      },
      flip: {
        initial: { opacity: 0, rotateY: -90 },
        in: { opacity: 1, rotateY: 0 },
        out: { opacity: 0, rotateY: 90 },
      },
    };
    return variants[animationType] || variants.fade;
  };

  const transition = {
    type: "tween",
    ease: "easeInOut",
    duration,
    delay,
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={getVariants(type)} transition={transition} className="w-full">
      {children}
    </motion.div>
  );
};

TransitionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["fade", "slideUp", "slideDown", "slideLeft", "slideRight", "scale", "flip"]),
  duration: PropTypes.number,
  delay: PropTypes.number,
  showLoadingBar: PropTypes.bool,
};

export default TransitionWrapper;
