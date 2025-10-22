import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setMinPrice,
  setMaxPrice,
  applyFilters,
} from "../../redux/slices/filterSlice";
import { toast } from "react-toastify";

const PriceFilter = () => {
  const dispatch = useDispatch();
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const debounceTimer = useRef(null);

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
    dispatch(setMinPrice(range.min));
    dispatch(setMaxPrice(range.max));
    dispatch(applyFilters());

    // Reset applying state after a short delay
    setTimeout(() => setIsApplying(false), 1000);
  };

  // Auto-apply filter when both fields are filled with valid numbers
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only auto-apply if both fields have values and are valid numbers
    if (localMin && localMax) {
      const minValue = Number(localMin);
      const maxValue = Number(localMax);

      // Check if both are valid numbers and meet criteria
      if (
        !isNaN(minValue) &&
        !isNaN(maxValue) &&
        maxValue >= 0 &&
        minValue >= 0 &&
        minValue < maxValue
      ) {
        // Set debounce timer
        debounceTimer.current = setTimeout(() => {
          setIsApplying(true);
          dispatch(setMinPrice(minValue));
          dispatch(setMaxPrice(maxValue));
          dispatch(applyFilters());

          // Clear the input fields after successful auto-apply
          setLocalMin("");
          setLocalMax("");

          // Reset applying state after a short delay
          setTimeout(() => setIsApplying(false), 1000);
        }, 7000); // 700ms debounce delay
      }
    }

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localMin, localMax, dispatch]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Price Input Fields */}
      <div className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="text"
              placeholder="0"
              value={localMin}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onChange={(e) => setLocalMin(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="text"
              placeholder="1000"
              value={localMax}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onChange={(e) => setLocalMax(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Apply Button - Hidden since auto-apply is now active */}
      {/* <button
        onClick={handleApplyCustomRange}
        disabled={isApplying}
        className={`w-full py-2 px-4 text-white text-sm font-medium rounded transition-colors duration-200 mb-3 ${
          isApplying ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
        }`}
      >
        {isApplying ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            <span>Applying...</span>
          </>
        ) : (
          <>
            <span>Apply Filter</span>
          </>
        )}
      </button> */}

      {/* All Prices Link */}
      <div className="text-center">
        <button
          onClick={() => handlePresetRangeClick({ min: 0, max: 1000 })}
          className="text-primary hover:text-blue-800 text-sm"
        >
          All Prices
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;
