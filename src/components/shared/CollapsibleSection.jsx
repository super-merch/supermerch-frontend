import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import PropTypes from "prop-types";
import { useSearchParams } from "react-router-dom";

const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = true,
  className = "",
  icon,
  handleIconClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (title === "Price Range" && searchParams.get("minPrice")) {
      setIsExpanded(true);
    } else if (title === "Filter by Colour" && searchParams.get("colors")) {
      setIsExpanded(true);
    } else if (
      title === "Filter by Attributes" &&
      searchParams.get("attrName")
    ) {
      setIsExpanded(true);
    }
  }, [searchParams, title]);

  return (
    <div
      className={`bg-[#F8F9FA] border border-[#CBD5E1] rounded-lg overflow-hidden ${className} transition-all duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-4 text-left group transition-colors"
        title={
          isExpanded
            ? `Hide ${title.toLowerCase()}`
            : `Show ${title.toLowerCase()}`
        }
      >
        <div className="flex items-center gap-2 text-[#01164F]">
          {icon && (
            <span
              className={`flex items-center transition-colors ${
                isExpanded ? "text-[#009688]" : "text-[#01164F] group-hover:text-[#009688]"
              }`}
              onClick={handleIconClick}
            >
              {icon}
            </span>
          )}
          <h2
            className={`text-sm font-semibold transition-colors ${
              isExpanded ? "text-[#009688]" : "text-[#01164F] group-hover:text-[#009688]"
            }`}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
            }}
          >
            {title}
          </h2>
        </div>
        <FaCaretDown
          size={14}
          className={`text-[#6B7380] transition-all duration-200 ${
            isExpanded ? "rotate-180 text-[#009688]" : "group-hover:text-[#009688]"
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in transition-all duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
  className: PropTypes.string,
};

export default CollapsibleSection;
