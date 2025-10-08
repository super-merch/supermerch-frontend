import React, { useState, useRef, useEffect } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const SearchBar = ({
  onSearch,
  placeholder = "Search for products...",
  className = "",
  showCategoryDropdown = true,
  categoryData = [],
  selectedCategory = "All",
  onCategoryChange,
  size = "default", // "small", "default", "large"
  collapsible = false, // New prop for collapsible functionality
  isOpen = false, // New prop to control open state
  onToggle, // New prop for toggle function
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const sizeClasses = {
    small: {
      container: "w-56",
      input: "text-sm",
      button: "text-sm px-2 py-1",
    },
    default: {
      container: "w-72",
      input: "text-base",
      button: "text-sm px-3 py-1",
    },
    large: {
      container: "w-96",
      input: "text-lg",
      button: "text-base px-4 py-2",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when search bar opens
  useEffect(() => {
    if (collapsible && isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [collapsible, isOpen]);

  const handleChange = (e) => setInputValue(e.target.value.toLowerCase());

  const handleSearch = () => {
    if (!inputValue.trim()) {
      return;
    }
    onSearch(inputValue.trim());
    setInputValue("");
    // Close search bar if collapsible
    if (collapsible && onToggle) {
      onToggle(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape" && collapsible && onToggle) {
      onToggle(false);
    }
  };

  const handleCategorySelect = (category) => {
    onCategoryChange?.(category);
    setIsCategoryDropdownOpen(false);
  };

  // If collapsible and not open, show only search icon
  if (collapsible && !isOpen) {
    return (
      <div className={`flex items-center search-container ${className}`}>
        <button
          onClick={() => onToggle?.(true)}
          className="text-blue-600 hover:text-blue-700 transition-all duration-300 p-2 hover:scale-110 hover:bg-blue-50 rounded-lg"
          aria-label="Open search"
        >
          <IoSearchSharp className="text-3xl" />
        </button>
      </div>
    );
  }

  // If collapsible and open, show search bar with always-visible search icon
  if (collapsible && isOpen) {
    return (
      <div
        className={`relative z-20 flex items-center w-full search-container ${className}`}
        ref={categoryDropdownRef}
      >
        <div className="flex items-center bg-white border-2 border-blue-200 rounded-xl px-3 py-1.5 hover:border-blue-300 shadow-lg transition-all duration-300 w-full animate-in slide-in-from-right-2 fade-in-0">
          {showCategoryDropdown && (
            <div
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mr-3 cursor-pointer hover:bg-blue-100 transition-all duration-200"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="text-blue-700 font-semibold text-sm">
                {selectedCategory}
              </span>
              <svg
                className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}

          <input
            ref={searchInputRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!inputValue}
            type="text"
            placeholder={placeholder}
            className={`flex-1 text-gray-700 bg-transparent outline-none placeholder-gray-400 ${currentSize.input}`}
          />

          <div className="flex items-center gap-2 ml-2">
            <IoSearchSharp
              onClick={handleSearch}
              className="text-blue-600 text-xl cursor-pointer hover:text-blue-700 transition-colors"
            />
            <IoClose
              onClick={() => onToggle?.(false)}
              className="text-gray-500 text-xl cursor-pointer hover:text-gray-700 transition-colors"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        {isCategoryDropdownOpen && showCategoryDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div
                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleCategorySelect("All")}
              >
                <span className="text-gray-700 font-medium">
                  All Categories
                </span>
              </div>

              {categoryData.map((category) => (
                <div key={category.id} className="border-t border-gray-100">
                  <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                    <span className="text-gray-800 font-semibold">
                      {category.name}
                    </span>
                  </div>
                  {category.subcategories?.map((subcategory) => (
                    <div key={subcategory.id} className="ml-4">
                      <div className="px-3 py-1 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="text-gray-600 text-sm">
                          {subcategory.name}
                        </span>
                      </div>
                      {subcategory.subcategories?.map((item, index) => (
                        <div
                          key={index}
                          className="ml-6 px-3 py-1 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => handleCategorySelect(item)}
                        >
                          <span className="text-gray-500 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative z-20 flex items-center ${
        collapsible ? "w-full" : currentSize.container
      } ${className}`}
      ref={categoryDropdownRef}
    >
      <div
        className={`flex items-center bg-white border-2 border-blue-100 rounded-lg px-3 py-2 hover:border-blue-200 transition-all duration-300 w-full ${
          collapsible ? "animate-in slide-in-from-right-2 fade-in-0" : ""
        }`}
      >
        {showCategoryDropdown && (
          <div
            className="flex items-center gap-2 bg-gray-100 rounded-md mr-3 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          >
            <span className="text-blue-600 font-semibold text-sm">
              {selectedCategory}
            </span>
            <svg
              className={`w-3 h-3 text-blue-600 transition-transform ${
                isCategoryDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}

        <input
          ref={searchInputRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={placeholder}
          className={`flex-1 text-gray-800 bg-transparent outline-none placeholder-gray-500 text-base font-medium ${currentSize.input}`}
        />

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            onClick={handleSearch}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <IoSearchSharp className="text-lg" />
          </button>
          {collapsible && (
            <button
              onClick={() => onToggle?.(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <IoClose className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Category Dropdown */}
      {isCategoryDropdownOpen && showCategoryDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 fade-in-0">
          <div className="p-3">
            <div
              className="px-4 py-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200"
              onClick={() => handleCategorySelect("All")}
            >
              <span className="text-gray-800 font-semibold">
                All Categories
              </span>
            </div>

            {categoryData.map((category) => (
              <div key={category.id} className="border-t border-blue-100">
                <div className="px-4 py-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200">
                  <span className="text-gray-800 font-semibold">
                    {category.name}
                  </span>
                </div>
                {category.subcategories?.map((subcategory) => (
                  <div key={subcategory.id} className="ml-4">
                    <div className="px-4 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200">
                      <span className="text-gray-700 text-sm font-medium">
                        {subcategory.name}
                      </span>
                    </div>
                    {subcategory.subcategories?.map((item, index) => (
                      <div
                        key={index}
                        className="ml-6 px-4 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200"
                        onClick={() => handleCategorySelect(item)}
                      >
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  showCategoryDropdown: PropTypes.bool,
  categoryData: PropTypes.array,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  size: PropTypes.oneOf(["small", "default", "large"]),
  collapsible: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default SearchBar;
