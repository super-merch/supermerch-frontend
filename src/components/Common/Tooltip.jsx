import React, { useState } from "react";

const Tooltip = ({
  children,
  content,
  show,
  placement = "top",
  offset = 8,
  className = "",
}) => {
  const [hovered, setHovered] = useState(false);
  const isVisible = show !== undefined ? show : hovered;

  if (!content) return <>{children}</>;

  const positions = {
    top: {
      tooltip: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      arrow:
        "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900",
    },
    bottom: {
      tooltip: "top-full left-1/2 -translate-x-1/2 mt-2",
      arrow:
        "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900",
    },
    left: {
      tooltip: "right-full top-1/2 -translate-y-1/2 mr-2",
      arrow:
        "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900",
    },
    right: {
      tooltip: "left-full top-1/2 -translate-y-1/2 ml-2",
      arrow:
        "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900",
    },
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-nowrap max-w-xs ${positions[placement].tooltip} ${className}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-[6px] border-solid ${positions[placement].arrow}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
