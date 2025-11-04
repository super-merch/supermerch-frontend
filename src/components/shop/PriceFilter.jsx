// PriceFilter.jsx — updated (only show changed file)
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const PriceFilter = () => {
  const dispatch = useDispatch();
  const { setPaginationData } = useContext(AppContext);

  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const applyRangeToBackend = (minValue, maxValue) => {
    // update redux for UI + update AppContext paginationData so backend will be called
    dispatch(setMinPrice(minValue));
    dispatch(setMaxPrice(maxValue));

    setPaginationData((prev) => ({
      ...prev,
      page: 1, // reset to first page
      pricerange: { min_price: Number(minValue), max_price: Number(maxValue) },
    }));
  };

  const handleApplyCustomRange = () => {
    const minValue = Number(localMin);
    const maxValue = Number(localMax);

    if (localMin === "" || localMax === "" || isNaN(minValue) || isNaN(maxValue)) {
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

    setLocalMin("");
    setLocalMax("");

    setTimeout(() => setIsApplying(false), 800);
  };

  const handlePresetRangeClick = (range) => {
    setIsApplying(true);
    applyRangeToBackend(range.min, range.max);
    setTimeout(() => setIsApplying(false), 500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="text"
              placeholder="0"
              value={localMin}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none"
              onChange={(e) => setLocalMin(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              placeholder="1000"
              value={localMax}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none"
              onChange={(e) => setLocalMax(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Apply Button (visible, replaces debounce) */}
      <div className="mb-3">
        <button
          onClick={handleApplyCustomRange}
          disabled={isApplying}
          className={`w-full py-2 px-4 text-white text-sm font-medium rounded transition-colors duration-200 ${
            isApplying ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
          }`}
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
              <span>Applying...</span>
            </>
          ) : (
            <span>Apply</span>
          )}
        </button>
      </div>

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
