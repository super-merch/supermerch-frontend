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
    <div className="py-2">
      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Min Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
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
              className="w-full pl-7 pr-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]/30 focus:border-[#009688] transition-all bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Max Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
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
              className="w-full pl-7 pr-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]/30 focus:border-[#009688] transition-all bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyCustomRange}
          disabled={isApplying}
          className={`flex-1 py-2 px-4 text-white text-sm font-semibold rounded-lg transition-all duration-200 ${
            isApplying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#009688] hover:bg-[#008080] active:scale-[0.98] shadow-sm"
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>

        <button
          onClick={() => handlePresetRangeClick({ min: 0, max: 1000 })}
          className="px-4 py-2 text-sm font-semibold text-[#01164F] bg-white border border-[#CBD5E1] hover:border-[#009688] hover:text-[#009688] rounded-lg transition-all duration-200 active:scale-[0.98]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;
