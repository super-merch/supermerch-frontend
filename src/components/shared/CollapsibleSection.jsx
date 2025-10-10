import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import PropTypes from "prop-types";

const CollapsibleSection = ({ title, children, defaultExpanded = true, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-200 pb-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors duration-200"
          title={isExpanded ? `Hide ${title.toLowerCase()}` : `Show ${title.toLowerCase()}`}
        >
          {isExpanded ? (
            <>
              <span>Hide</span>
              <FaCaretDown size={10} />
            </>
          ) : (
            <>
              <span>Show</span>
              <FaCaretDown size={10} />
            </>
          )}
        </button>
      </div>
      {isExpanded && <div className="animate-fade-in">{children}</div>}
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
