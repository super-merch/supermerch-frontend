import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMinPrice, setMaxPrice, applyFilters } from "../../redux/slices/filterSlice";
import { Range } from "react-range";
import { toast } from "react-toastify";
import { FaChevronDown } from "react-icons/fa";

const PriceFilter = () => {
  const dispatch = useDispatch();
  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [localMin, setLocalMin] = useState(minPrice.toString());
  const [localMax, setLocalMax] = useState(maxPrice.toString());
  const [isApplying, setIsApplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleRangeFinalChange = (values) => {
    const [min, max] = values;
    setIsApplying(true);
    dispatch(setMinPrice(min));
    dispatch(setMaxPrice(max));
    dispatch(applyFilters());

    // Reset applying state after a short delay
    setTimeout(() => setIsApplying(false), 1000);
  };

  const priceRanges = [
    { label: "All Prices", min: 0, max: 1000 },
    // { label: "Under $10", min: 0, max: 10 },
    // { label: "$10 to $50", min: 10, max: 50 },
    // { label: "$50 to $100", min: 50, max: 100 },

    // { label: "$100 to $150", min: 100, max: 150 },
    // { label: "$150 to $200", min: 150, max: 200 },
    // { label: "$200 to $250", min: 200, max: 250 },
  ];

  const handleApplyCustomRange = () => {
    const minValue = Number(localMin);
    const maxValue = Number(localMax);

    if (!localMin || !localMax || isNaN(minValue) || isNaN(maxValue)) {
      toast.error("Please enter valid numbers for Min and Max Price");
      return;
    }
    if (maxValue < 0 || minValue <= -1) {
      // Only check if max is negative since min can be 0
      toast.error("Price cannot be negative");
      return;
    }
    if (minValue >= maxValue) {
      toast.error("Min Price should be less than Max Price");
      return;
    }

    setIsApplying(true);
    dispatch(setMinPrice(minValue));
    dispatch(setMaxPrice(maxValue));
    dispatch(applyFilters());
    setLocalMin("");
    setLocalMax("");

    // Reset applying state after a short delay
    setTimeout(() => setIsApplying(false), 1000);
  };

  const handlePresetRangeClick = (range) => {
    setIsApplying(true);
    setPriceRange([range.min, range.max]);
    dispatch(setMinPrice(range.min));
    dispatch(setMaxPrice(range.max));
    dispatch(applyFilters());

    // Reset applying state after a short delay
    setTimeout(() => setIsApplying(false), 1000);
  };

  return (
    <div className="mb-4">
      {/* Header Section */}
      <div
        className="flex items-center justify-between py-2 px-3 bg-gray-200 cursor-pointer rounded-t-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h1 className="text-sm font-bold text-gray-800">Price Range</h1>
        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
          <FaChevronDown size={12} className="text-gray-600" />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-gray-300 rounded-b-md p-3">
          {/* Price Input Fields */}
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0"
                value={localMin}
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onChange={(e) => setLocalMin(e.target.value)}
              />
              <input
                type="text"
                placeholder="1000"
                value={localMax}
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onChange={(e) => setLocalMax(e.target.value)}
              />
            </div>
          </div>
          {/* Apply Button */}
          <button
            onClick={handleApplyCustomRange}
            disabled={isApplying}
            className="w-full flex items-center justify-center gap-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors duration-200 mb-2"
          >
            {isApplying ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <span>Apply Filter</span>
                <FaChevronDown size={8} />
              </>
            )}
          </button>

          {/* All Prices Link */}
          <div className="text-center">
            <button
              onClick={() => handlePresetRangeClick({ min: 0, max: 1000 })}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              All Prices
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceFilter;
