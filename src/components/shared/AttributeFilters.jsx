import { ProductsContext } from "@/context/ProductsContext";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import allAttributes from "./attributes";
import { Tag, Ruler, Box, Layers, Search } from "lucide-react";
import { FaCaretDown } from "react-icons/fa";

const getAttributeIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("brand")) return <Tag size={18} />;
  if (n.includes("size")) return <Ruler size={18} />;
  if (n.includes("material")) return <Box size={18} />;
  if (n.includes("collection")) return <Layers size={18} />;
  return <Tag size={18} />;
};

const AttributeItem = ({ 
  attribute, 
  normalizeKey, 
  normalizeValue, 
  normalize, 
  selectedAttributes, 
  expandedAttributes, 
  toggleAttributeExpansion, 
  handleCheckboxChange 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const nameKey = normalizeKey(attribute.name);
  const isExpanded = expandedAttributes[nameKey];
  const selectedCount = (selectedAttributes[nameKey]?.values || []).length;
  const isAttributeSelected = selectedCount > 0;

  const filteredValues = attribute.values.filter((val) =>
    val.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-lg overflow-hidden transition-all duration-200"
    >
      {/* Attribute Header */}
      <button
        type="button"
        onClick={() => toggleAttributeExpansion(attribute.name)}
        className="w-full flex items-center justify-between px-4 py-4 text-left group transition-colors"
      >
        <div className="flex items-center gap-2 text-[#01164F]">
          <span className={`flex items-center transition-colors ${
            isExpanded ? "text-[#009688]" : "text-[#01164F] group-hover:text-[#009688]"
          }`}>
            {getAttributeIcon(attribute.name)}
          </span>
          <h2 className={`text-sm font-semibold transition-colors ${
            isExpanded ? "text-[#009688]" : "text-[#01164F] group-hover:text-[#009688]"
          }`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px' }}>
            {attribute.name}
          </h2>
          {isAttributeSelected && (
            <span className="bg-[#009688] text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <FaCaretDown
          size={14}
          className={`text-[#6B7380] transition-all duration-200 ${
            isExpanded ? "rotate-180 text-[#009688]" : "group-hover:text-[#009688]"
          }`}
        />
      </button>

      {/* Attribute Values */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {/* Search Box for Attribute Values */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={`Search ${attribute.name.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009688]/30 focus:border-[#009688] transition-all"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7380] w-4 h-4" />
          </div>

          <div className="max-h-[250px] overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredValues.length > 0 ? (
              filteredValues.map((value) => {
                const isChecked = (selectedAttributes[nameKey]?.values || []).some(
                  (v) => normalizeValue(v) === normalizeValue(value)
                );
                return (
                  <label
                    key={value}
                    className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg transition-colors hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        handleCheckboxChange(attribute.name, value)
                      }
                      className="w-4 h-4 border-gray-300 rounded focus:ring-[#009688] focus:ring-2 cursor-pointer text-[#009688]"
                    />
                    <span className={`transition-colors flex-1 text-sm ${
                      isChecked ? "text-[#009688] font-medium" : "text-[#1E2328] group-hover:text-[#009688]"
                    }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {value}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AttributeFilters({ toggleSidebar, categoryType }) {
  const { getProducts, setPaginationData } = useContext(ProductsContext);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [cachedAttributes, setCachedAttributes] = useState([]);
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

  const prevCategoryRef = useRef(null);
  const prevSearchRef = useRef(null);

  const cacheKey = `${category || "none"}-${search || "none"}`;
  const prevCacheKeyRef = useRef(cacheKey);
  const incomingAttributes = (getProducts?.attributes || []).filter(
    (attr) => attr.values && attr.values.length >= 2
  );

  useEffect(() => {
    const cacheKeyChanged = prevCacheKeyRef.current !== cacheKey;

    if (cacheKeyChanged) {
      setCachedAttributes([]);
      prevCacheKeyRef.current = cacheKey;
    } else if (incomingAttributes.length > 0) {
      setCachedAttributes(incomingAttributes);
    }
    else if (
      (categoryType === "allProducts" && cachedAttributes.length === 0) ||
      (!params.get("search") && cachedAttributes.length === 0)
    ) {
      setCachedAttributes(allAttributes);
    }

    prevCategoryRef.current = category;
    prevSearchRef.current = search;
  }, [category, search, cacheKey, incomingAttributes.length, categoryType]);

  const attributes =
    cachedAttributes.length > 0
      ? cachedAttributes
      : categoryType === "allProducts"
        ? allAttributes
        : incomingAttributes;

  useEffect(() => {
    const nextSelected = buildSelectedFromParams(params);

    setSelectedAttributes(nextSelected);

    // Auto-expand attributes that have selections
    setExpandedAttributes((prev) => {
      const next = { ...prev };
      Object.keys(nextSelected).forEach((key) => {
        next[key] = true;
      });
      return next;
    });

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
      {attributes.map((attribute) => (
        <AttributeItem
          key={attribute.name}
          attribute={attribute}
          normalizeKey={normalizeKey}
          normalizeValue={normalizeValue}
          normalize={normalize}
          selectedAttributes={selectedAttributes}
          expandedAttributes={expandedAttributes}
          toggleAttributeExpansion={toggleAttributeExpansion}
          handleCheckboxChange={handleCheckboxChange}
        />
      ))}
    </div>
  );
}
