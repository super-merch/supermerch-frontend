import { ProductsContext } from "@/context/ProductsContext";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import allAttributes from "./attributes";

export default function AttributeFilters({ toggleSidebar, categoryType }) {
  const { getProducts, setPaginationData } = useContext(ProductsContext);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [cachedAttributes, setCachedAttributes] = useState([]);
  //const [selectedValues, setSelectedValues]  = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const search = params.get("search");
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .replace(/\u00A0/g, " ")
      .trim();
  const normalizeKey = (value) => normalize(value).toLowerCase();
  const normalizeValue = (value) =>
    normalize(value)
      .toLowerCase()
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/\s+/g, " ");
  const buildSelectedFromParams = (paramsInput) => {
    const urlAttrNames = paramsInput.getAll("attrName");
    const urlAttrValues = paramsInput.getAll("attrValue");
    const nextSelected = {};
    urlAttrNames.forEach((name, idx) => {
      const raw = urlAttrValues[idx] || "";
      const values = raw.split(",").map(normalize).filter(Boolean);
      const nameKey = normalizeKey(name);
      const displayName = normalize(name);
      if (!values.length || !nameKey) return;
      const existing = nextSelected[nameKey];
      const merged = existing ? [...existing.values] : [];
      const seen = new Set(merged.map((v) => normalizeValue(v)));
      values.forEach((val) => {
        const key = normalizeValue(val);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(val);
        }
      });
      nextSelected[nameKey] = { name: existing?.name || displayName, values: merged };
    });
    return nextSelected;
  };

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
    else if (
      (categoryType === "allProducts" && cachedAttributes.length === 0) ||
      (!params.get("search") && cachedAttributes.length === 0)
    ) {
      setCachedAttributes(allAttributes);
    }

    prevCategoryRef.current = category;
    prevSearchRef.current = search;
  }, [category, search, cacheKey, incomingAttributes.length, categoryType]);

  // Use cached attributes if available, otherwise show incoming
  const attributes =
    cachedAttributes.length > 0
      ? cachedAttributes
      : categoryType === "allProducts"
        ? allAttributes
        : incomingAttributes;

  // Reset selected filter when location changes
  useEffect(() => {
    const nextSelected = buildSelectedFromParams(params);

    setSelectedAttributes(nextSelected);

    const attributesPayload = Object.values(nextSelected).map(
      ({ name, values }) => ({ name, value: values.join(",") })
    );

    setPaginationData((prev) => ({
      ...prev,
      attributes: attributesPayload.length > 0 ? attributesPayload : null,
    }));
  }, [location.pathname, category, search, location.search]);


  const handleCheckboxChange = (attributeName, value) => {
    const nameKey = normalizeKey(attributeName);
    const valueDisplay = normalize(value);
    const valueKey = normalizeValue(value);
    const nextSelected = buildSelectedFromParams(new URLSearchParams(searchParams));
    const currentEntry = nextSelected[nameKey];
    const currentValues = currentEntry?.values || [];
    const nextValues = currentValues.some((v) => normalizeValue(v) === valueKey)
      ? currentValues.filter((v) => normalizeValue(v) !== valueKey)
      : [...currentValues, valueDisplay];

    if (nextValues.length > 0) {
      nextSelected[nameKey] = {
        name: currentEntry?.name || normalize(attributeName),
        values: nextValues,
      };
    } else {
      delete nextSelected[nameKey];
    }

    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.delete("attrName");
      newParams.delete("attrValue");

      Object.values(nextSelected).forEach(({ name, values }) => {
        newParams.append("attrName", name);
        newParams.append("attrValue", values.join(","));
      });

      newParams.set("page", "1");
      return newParams;
    });

    setSelectedAttributes(nextSelected);

    const attributesPayload = Object.values(nextSelected).map(
      ({ name, values }) => ({ name, value: values.join(",") })
    );

    setPaginationData((prev) => ({
      ...prev,
      page: 1,
      attributes: attributesPayload.length > 0 ? attributesPayload : null,
      sendAttributes: false,
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (toggleSidebar && window.innerWidth <= 1025) {
      toggleSidebar();
    }
  };


  const toggleAttributeExpansion = (attributeName) => {
    const nameKey = normalizeKey(attributeName);
    setExpandedAttributes((prev) => ({
      ...prev,
      [nameKey]: !prev[nameKey],
    }));
  };

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {attributes.map((attribute) => {
        const nameKey = normalizeKey(attribute.name);
        const isExpanded = expandedAttributes[nameKey];
        const selectedCount = (selectedAttributes[nameKey]?.values || []).length;
        const isAttributeSelected = selectedCount > 0;

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
                    {selectedCount}
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
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
                    const isChecked = (selectedAttributes[nameKey]?.values || []).some(
                      (v) => normalizeValue(v) === normalizeValue(value)
                    );
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
