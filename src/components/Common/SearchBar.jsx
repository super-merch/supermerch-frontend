import React, { useState, useRef, useEffect, useCallback } from "react";
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
  // add near other useState declarations
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestionTimerRef = useRef(null);
  const wrapperRef = categoryDropdownRef;
  // Close category dropdown & suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);

        // <-- NEW: also close suggestions when clicking outside
        if (isSuggestionsOpen) {
          setIsSuggestionsOpen(false);
          setSuggestions([]);
          setHighlightedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSuggestionsOpen]);

  const fetchSuggestions = async (q) => {
    if (!q || q.trim().length === 0) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }
    try {
      setSuggestionLoading(true);
      const limit = 7;
      const resp = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/search-suggestion?q=${encodeURIComponent(q)}&limit=${limit}${
          selectedCategory.id ? `&category=${selectedCategory.id}` : ""
        }`
      );
      const json = await resp.json();
      const items = (json?.data || []).map((it) => ({
        id: it.id,
        name: it.name || "",
        sku: it.sku || "",
      }));
      setSuggestions(items);
      setIsSuggestionsOpen(items.length > 0);
      setHighlightedIndex(-1);
    } catch (err) {
      console.warn("suggestion fetch error:", err);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSubTypesToShow = (category) =>
    expandedCategories.includes(category?.id)
      ? category?.subTypes
      : category?.subTypes?.slice(0, 3);

  const sizeClasses = {
    small: {
      container: "w-56 sm:w-full",
      input: "text-sm",
      button: "text-sm px-2 py-1",
    },
    default: {
      container: "w-72 sm:w-full",
      input: "text-base",
      button: "text-sm px-3 py-1",
    },
    large: {
      container: "w-96 sm:w-[28rem]",
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

  // Add debounce timer ref
  const debounceTimerRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase();
    setInputValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);

    // Set new timer for debounced search
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(value.trim());
      }, 1000); // 1000ms delay
    } else {
      handleSearch("");
    }
    if (value.trim()) {
      suggestionTimerRef.current = setTimeout(() => {
        fetchSuggestions(value.trim());
      }, 250);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSearch = (searchValue = inputValue) => {
    if (!searchValue.trim()) {
      onSearch("");
      return;
    }
    onSearch(searchValue.trim());
    // setInputValue("");
    // Close search bar if collapsible
    if (collapsible && onToggle) {
      onToggle(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // If suggestions open and one highlighted -> select it
      if (
        isSuggestionsOpen &&
        highlightedIndex >= 0 &&
        suggestions[highlightedIndex]
      ) {
        const sel = suggestions[highlightedIndex];
        setInputValue(sel.name || sel.sku || "");
        setIsSuggestionsOpen(false);
        setSuggestions([]);
        onSearch(sel.name || sel.sku || "");
        return;
      }

      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      handleSearch();
    } else if (e.key === "Escape") {
      if (isSuggestionsOpen) {
        setIsSuggestionsOpen(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
        return;
      }
      if (collapsible && onToggle) onToggle(false);
    } else if (e.key === "ArrowDown") {
      if (!isSuggestionsOpen || suggestions.length === 0) return;
      e.preventDefault();
      setHighlightedIndex((idx) => Math.min(idx + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      if (!isSuggestionsOpen || suggestions.length === 0) return;
      e.preventDefault();
      setHighlightedIndex((idx) => Math.max(idx - 1, 0));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleCategorySelect = (category) => {
    onCategoryChange?.(category);
    setIsCategoryDropdownOpen(false);
  };
  // If collapsible and not open, show only search icon
  if (collapsible && !isOpen) {
    return (
      <div className={`flex items-center search-container ${className}`}>
        <button
          onClick={() => {
            // Clear debounce timer and search immediately
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            handleSearch();
          }}
          className="text-primary hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
        >
          <IoSearchSharp className="text-lg" />
        </button>
      </div>
    );
  }

  // If collapsible and open, show search bar with always-visible search icon
  if (collapsible && isOpen) {
    return (
      <div
        className={`w-full relative z-20 flex items-center search-container ${className}`}
        ref={categoryDropdownRef}
      >
        <div className="flex items-center bg-white border-2 border-blue-200 rounded-xl px-3 py-1.5 hover:border-blue-300 shadow-lg transition-all duration-300 w-full animate-in slide-in-from-right-2 fade-in-0">
          {showCategoryDropdown && (
            <div
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mr-3 cursor-pointer hover:bg-blue-100 transition-all duration-200"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="text-blue-700 font-semibold text-sm">
                {selectedCategory?.name || selectedCategory}
              </span>
              <svg
                className={`w-4 h-4 text-primary transition-transform duration-200 ${
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
            // disabled={!inputValue}
            type="text"
            placeholder={placeholder}
            className={`flex-1 text-gray-700 bg-transparent outline-none placeholder-gray-400 ${currentSize.input}`}
          />
          {/* Suggestions dropdown */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
              role="listbox"
            >
              {suggestionLoading && (
                <li className="px-3 py-2 text-sm text-gray-500">Loading…</li>
              )}
              {suggestions.map((s, idx) => (
                <li
                  key={s.id + "-" + idx}
                  role="option"
                  aria-selected={highlightedIndex === idx}
                  onMouseDown={(ev) => {
                    // use onMouseDown to avoid input blur before click handler
                    ev.preventDefault();
                    setInputValue(s.name || s.sku || "");
                    setIsSuggestionsOpen(false);
                    setSuggestions([]);
                    onSearch(s.name || s.sku || "");
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`cursor-pointer px-3 py-2 text-sm flex justify-between items-center ${
                    highlightedIndex === idx
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium text-gray-900 truncate">
                      {s.name || s.sku}
                    </div>
                    {s.sku && s.name && (
                      <div className="text-xs text-gray-500 truncate">
                        {s.sku}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 ml-2">
            <IoSearchSharp
              onClick={handleSearch}
              className="text-primary text-xl cursor-pointer hover:text-blue-700 transition-colors"
            />
            <IoClose
              onClick={() => onToggle?.(false)}
              className="text-gray-500 text-xl cursor-pointer hover:text-gray-700 transition-colors"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        {isCategoryDropdownOpen && showCategoryDropdown && (
          <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
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
                  <div
                    onClick={() => handleCategorySelect(category)}
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <span className="text-gray-800 font-semibold">
                      {category.name}
                    </span>
                  </div>
                  {getSubTypesToShow(category)?.map((subcategory) => (
                    <div key={subcategory.id} className="ml-4">
                      <div
                        onClick={() => handleCategorySelect(subcategory)}
                        className="px-3 py-1 hover:bg-gray-50 rounded cursor-pointer"
                      >
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

                  {/* View all / View less button */}
                  {category.subTypes && category.subTypes.length > 3 && (
                    <div className="ml-4 px-3 py-1">
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="text-sm text-primary hover:underline"
                      >
                        {expandedCategories.includes(category.id)
                          ? "View less"
                          : "View all"}
                      </button>
                    </div>
                  )}
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
      className={`w-full relative z-20 flex items-center ${
        collapsible ? "w-full" : currentSize.container
      } ${className}`}
      ref={categoryDropdownRef}
    >
      <div
        className={`flex items-center bg-white border-2 border-blue-100 rounded-lg px-1 lg:px-3 py-1 lg:py-2 hover:border-blue-200 transition-all duration-300 w-full ${
          collapsible ? "animate-in slide-in-from-right-2 fade-in-0" : ""
        }`}
      >
        {showCategoryDropdown && (
          <div
            className="flex items-center gap-2  rounded-md mr-3 cursor-pointer transition-colors"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          >
            <span className="text-primary font-semibold text-sm">
              {selectedCategory?.name || selectedCategory}
            </span>
            <svg
              className={`w-3 h-3 text-primary transition-transform ${
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
        {isSuggestionsOpen && suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
            role="listbox"
          >
            {suggestionLoading && (
              <li className="px-3 py-2 text-sm text-gray-500">Loading…</li>
            )}
            {suggestions.map((s, idx) => (
              <li
                key={s.id + "-" + idx}
                role="option"
                aria-selected={highlightedIndex === idx}
                onMouseDown={(ev) => {
                  // use onMouseDown to avoid input blur before click handler
                  ev.preventDefault();
                  setInputValue(s.name || s.sku || "");
                  setIsSuggestionsOpen(false);
                  setSuggestions([]);
                  onSearch(s.name || s.sku || "");
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`cursor-pointer px-3 py-2 text-sm flex justify-between items-center ${
                  highlightedIndex === idx ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="truncate">
                  <div className="font-medium text-gray-900 truncate">
                    {s.name || s.sku}
                  </div>
                  {s.sku && s.name && (
                    <div className="text-xs text-gray-500 truncate">
                      {s.sku}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            onClick={() => {
              // Clear debounce timer and search immediately
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              handleSearch();
            }}
            className="text-primary hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
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
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 fade-in-0">
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
                <div
                  onClick={() => handleCategorySelect(category)}
                  className="px-4 py-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <span className="text-gray-800 font-semibold">
                    {category.name}
                  </span>
                </div>
                {getSubTypesToShow(category)?.map((subcategory) => (
                  <div key={subcategory.id} className="ml-4">
                    <div
                      onClick={() => handleCategorySelect(subcategory)}
                      className="px-4 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200"
                    >
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

                {/* View all / View less button */}
                {category.subTypes && category.subTypes.length > 3 && (
                  <div className="ml-4 px-4 py-2">
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      {expandedCategories.includes(category.id)
                        ? "View less"
                        : "View all"}
                    </button>
                  </div>
                )}
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
