// PriceFilter.jsx — updated (only show changed file)
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useSearchParams } from "react-router-dom";

const PriceFilter = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { setPaginationData } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setLocalMin(searchParams.get("minPrice") || "");
    setLocalMax(searchParams.get("maxPrice") || "");
  }, [searchParams.get("minPrice")]);

  const applyRangeToBackend = (minValue, maxValue) => {
    dispatch(setMinPrice(minValue));
    dispatch(setMaxPrice(maxValue));

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("minPrice", minValue.toString());
      newParams.set("maxPrice", maxValue.toString());
      newParams.set("page", "1");
      return newParams;
    });

    setPaginationData((prev) => ({
      ...prev,
      page: 1, // reset to first page
      pricerange: { min_price: Number(minValue), max_price: Number(maxValue) },
      sendAttributes: false,
    }));
  };

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const minValue = Number(localMin);
    const maxValue = Number(localMax);

    if (
      localMin === "" ||
      localMax === "" ||
      isNaN(minValue) ||
      isNaN(maxValue)
    ) {
      toast.error("Please enter valid numbers for Min and Max Price");
      return;
    }
    if (maxValue < 0 || minValue < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    if (minValue >= maxValue) {
      toast.error("Min Price should be less than Max Price");
      return;
    }

    setIsApplying(true);
    applyRangeToBackend(minValue, maxValue);
    if (window.innerWidth <= 1025) toggleSidebar();
    setTimeout(() => setIsApplying(false), 800);
  };

  const handlePresetRangeClick = (range) => {
    setIsApplying(true);
    setLocalMin("");
    setLocalMax("");
    applyRangeToBackend(range.min, range.max);
    setTimeout(() => setIsApplying(false), 500);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-lg shadow-sm p-4"
    >
      {/* Price Range Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Price Range</h3>
          <div className="text-sm font-medium text-primary">
            ${localMin || 0} - ${localMax || 500}
          </div>
        </div>

        {/* Dual Range Slider */}
        <div className="relative pt-2 pb-6">
          {/* Track Background */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>

          {/* Active Range Track */}
          <div
            className="absolute h-2 bg-primary rounded-full top-1/2 -translate-y-1/2"
            style={{
              left: `${((localMin || 0) / 500) * 100}%`,
              right: `${100 - ((localMax || 500) / 500) * 100}%`,
            }}
          ></div>

          {/* Min Range Input */}
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={localMin || 0}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const value = Number(e.target.value);
              if (value < (localMax || 500)) {
                setLocalMin(value);
              }
            }}
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:active:scale-110 [&::-moz-range-thumb]:transition-transform"
            style={{ zIndex: localMin > (localMax || 500) - 100 ? 5 : 3 }}
          />

          {/* Max Range Input */}
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={localMax || 500}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const value = Number(e.target.value);
              if (value > (localMin || 0)) {
                setLocalMax(value);
              }
            }}
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:active:scale-110 [&::-moz-range-thumb]:transition-transform"
            style={{ zIndex: 4 }}
          />
        </div>

        {/* Price Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyCustomRange}
          disabled={isApplying}
          className={`flex-1 py-2.5 px-4 text-white text-sm font-semibold rounded-lg transition-all duration-200 ${
            isApplying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {isApplying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </span>
          ) : (
            "Apply Filter"
          )}
        </button>

        <button
          onClick={() => handlePresetRangeClick({ min: 0, max: 500 })}
          className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;
