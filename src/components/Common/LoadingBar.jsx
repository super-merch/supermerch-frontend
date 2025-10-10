import { motion } from "framer-motion";
import PropTypes from "prop-types";

const LoadingBar = ({ isVisible, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0 }}
      className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"
    >
      <motion.div
        className={`h-full bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />
    </motion.div>
  );
};

LoadingBar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  color: PropTypes.oneOf(["blue", "purple", "green", "red", "yellow"]),
};

export default LoadingBar;
