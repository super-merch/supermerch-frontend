import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({
  children,
  content,
  show,
  placement = "top",
  offset = 8,
  className = "",
  wrapperClassName = "inline-block",
}) => {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);

  const isVisible = show !== undefined ? show : hovered;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const pos = {
      top: {
        top: rect.top - offset,
        left: rect.left + rect.width / 2,
      },
      bottom: {
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2,
      },
      left: {
        top: rect.top + rect.height / 2,
        left: rect.left - offset,
      },
      right: {
        top: rect.top + rect.height / 2,
        left: rect.right + offset,
      },
    };

    setPosition(pos[placement]);
  }, [hovered, show, placement, offset]);

  if (!content) return <>{children}</>;

  const tooltipNode = (
    <div
      className={`fixed z-[99999] px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-nowrap transform -translate-x-1/2 ${
        placement === "top"
          ? "-translate-y-full mb-2"
          : placement === "bottom"
          ? "mt-2"
          : placement === "left"
          ? "-translate-x-full mr-2"
          : "ml-2"
      } ${className}`}
      style={{
        top: position.top,
        left: position.left,
        pointerEvents: "none",
      }}
    >
      {content}
      <div
        className={`absolute w-0 h-0 border-[6px] border-solid ${
          placement === "top"
            ? "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent"
            : placement === "bottom"
            ? "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent"
            : placement === "left"
            ? "left-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent"
            : "right-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent"
        }`}
      />
    </div>
  );

  return (
    <span
      ref={triggerRef}
      className={wrapperClassName}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {mounted && isVisible && createPortal(tooltipNode, document.body)}
    </span>
  );
};

export default Tooltip;
