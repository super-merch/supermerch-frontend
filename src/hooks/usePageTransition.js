import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTransition = (options = {}) => {
  const { duration = 200, delay = 0, type = "fade", showLoadingBar = true } = options;

  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentPath(location.pathname);
      }, duration + delay);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath, duration, delay]);

  return {
    isTransitioning,
    currentPath,
    transitionProps: {
      duration: duration / 1000, // Convert to seconds for framer-motion
      delay: delay / 1000,
      type,
      showLoadingBar,
    },
  };
};

export default usePageTransition;
