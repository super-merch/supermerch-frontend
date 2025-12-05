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
      className="bg-white border border-gray-200 rounded-lg p-4"
    >
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyCustomRange(e);
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none"
              onChange={(e) => {
                e.stopPropagation();
                setLocalMin(e.target.value);
              }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="text"
              placeholder="1000"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyCustomRange(e);
                }
              }}
              value={localMax}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none"
              onChange={(e) => {
                e.stopPropagation();
                setLocalMax(e.target.value);
              }}
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
            isApplying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark"
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
