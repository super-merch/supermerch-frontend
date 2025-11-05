import { AppContext } from "@/context/AppContext";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import allAttributes from "./attributes";

export default function AttributeFilters({ toggleSidebar, categoryType }) {
  const { getProducts, setPaginationData } = useContext(AppContext);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [cachedAttributes, setCachedAttributes] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const search = params.get("search");

  // Track previous category/search to detect changes
  const prevCategoryRef = useRef(null);
  const prevSearchRef = useRef(null);

  // Create a cache key based on category and search
  const cacheKey = `${category || "none"}-${search || "none"}`;
  const prevCacheKeyRef = useRef(cacheKey);
  // Filter attributes (at least 2 values)
  const incomingAttributes = (getProducts?.attributes || []).filter(
    (attr) => attr.values && attr.values.length >= 2
  );

  // Update cached attributes only when category/search changes OR new attributes arrive
  useEffect(() => {
    const cacheKeyChanged = prevCacheKeyRef.current !== cacheKey;

    if (cacheKeyChanged) {
      // Category or search changed - clear cache and wait for new data
      setCachedAttributes([]);
      prevCacheKeyRef.current = cacheKey;
    } else if (incomingAttributes.length > 0) {
      // New attributes arrived - cache them
      setCachedAttributes(incomingAttributes);
    }
    // Special case: show hardcoded attributes for allProducts
    else if ((categoryType === "allProducts" && cachedAttributes.length === 0) || (!params.get("search") && cachedAttributes.length === 0)) {
      setCachedAttributes(allAttributes);
    }

    prevCategoryRef.current = category;
    prevSearchRef.current = search;
  }, [category, search, cacheKey, incomingAttributes.length, categoryType]);

  // Use cached attributes if available, otherwise show incoming
  const attributes = cachedAttributes.length > 0 
  ? cachedAttributes 
  : categoryType === "allProducts" 
    ? allAttributes 
    : incomingAttributes;

  // Reset selected filter when location changes
  useEffect(() => {
    setSelectedFilter(null);
    setPaginationData((prev) => ({ ...prev, attributes: null }));
  }, [location.pathname, category, search]);

  const handleCheckboxChange = (attributeName, value) => {
    // Check if this filter is already selected
    const isCurrentlySelected =
      selectedFilter?.name === attributeName && selectedFilter?.value === value;

    if (isCurrentlySelected) {
      // Deselect the filter
      setSelectedFilter(null);
      setPaginationData((prev) => ({
        ...prev,
        page: 1,
        attributes: null,
        sendAttributes: false,
      }));
      toast.info(`${value} filter removed from ${attributeName}`);
    } else {
      // Select new filter (only one at a time)
      const newFilter = { name: attributeName, value: value };
      setSelectedFilter(newFilter);
      setPaginationData((prev) => ({
        ...prev,
        page: 1,
        attributes: newFilter,
        sendAttributes: false,
      }));
      toast.success(`${value} filter applied to ${attributeName}`);

      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Optional: Close sidebar on mobile after selection
    if (toggleSidebar && window.innerWidth <= 1025) {
      toggleSidebar();
    }
  };

  const toggleAttributeExpansion = (attributeName) => {
    setExpandedAttributes((prev) => ({
      ...prev,
      [attributeName]: !prev[attributeName],
    }));
  };

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {attributes.map((attribute) => {
        const isExpanded = expandedAttributes[attribute.name];
        const isAttributeSelected = selectedFilter?.name === attribute.name;

        return (
          <div
            key={attribute.name}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Attribute Header */}
            <button
              type="button"
              onClick={() => toggleAttributeExpansion(attribute.name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {attribute.name}
                </h3>
                {isAttributeSelected && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
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
            </button>

            {/* Attribute Values */}
            {isExpanded && (
              <div className="px-4 pb-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="space-y-2">
                  {attribute.values.map((value) => {
                    const isChecked =
                      selectedFilter?.name === attribute.name &&
                      selectedFilter?.value === value;

                    return (
                      <label
                        key={value}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(attribute.name, value)
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
