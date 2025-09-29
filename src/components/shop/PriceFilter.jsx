import { useState } from "react";
import { useDispatch } from "react-redux";
import { setMinPrice, setMaxPrice, applyFilters } from "../../redux/slices/filterSlice";
import { toast } from "react-toastify";

const PriceFilter = () => {
  const dispatch = useDispatch();
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);

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

  return (
    <div className="mb-6">
      <h1 className="mb-4 text-base font-semibold text-gray-800">Price Range</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Price Input Fields */}
        <div className="mb-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                placeholder="0"
                value={localMin}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onChange={(e) => setLocalMin(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
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

        {/* Apply Button - Keeping original color */}
        <button
          onClick={handleApplyCustomRange}
          disabled={isApplying}
          className={`w-full py-2 px-4 text-white text-sm font-medium rounded transition-colors duration-200 mb-3 ${
            isApplying ? "bg-gray-400 cursor-not-allowed" : "bg-smallHeader hover:bg-smallHeader-dark"
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
        </button>

        {/* All Prices Link */}
        <div className="text-center">
          <button
            onClick={() => handlePresetRangeClick({ min: 0, max: 1000 })}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            All Prices
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
