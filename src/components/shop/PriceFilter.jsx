// PriceFilter.jsx — updated (only show changed file)
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import { toast } from "react-toastify";
import { useContext } from "react";
import { ProductsContext } from "../../context/ProductsContext";
import { useSearchParams } from "react-router-dom";

const PriceFilter = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { setPaginationData } = useContext(ProductsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  useEffect(() => {
    setLocalMin(minPriceParam);
    setLocalMax(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

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
    setTimeout(() => setIsApplying(false), 250);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Price Range</h3>

      {/* Input Fields */}
      <div className="flex  items-center  gap-x-3 mb-4">
        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Minimum Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>

            <input
              type="number"
              placeholder="0"
              value={localMin}
              min="0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyCustomRange(e);
                }
              }}
              onChange={(e) => {
                setLocalMin(e.target.value);
              }}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Maximum Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              placeholder="1000"
              value={localMax}
              min="0"
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyCustomRange(e);
                }
              }}
              onChange={(e) => {
                e.stopPropagation();
                setLocalMax(e.target.value);
              }}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
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
            "Apply"
          )}
        </button>

        <button
          onClick={() => handlePresetRangeClick({ min: 0, max: 1000 })}
          className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;
