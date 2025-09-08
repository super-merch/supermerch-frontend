import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setMinPrice,
  setMaxPrice,
  applyFilters,
} from "../../redux/slices/filterSlice";
import { Range } from "react-range"; 
import { toast } from "react-toastify";

const PriceFilter = () => {
  const dispatch = useDispatch();
  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");
  const [isApplying, setIsApplying] = useState(false);

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
  if (maxValue < 0 || minValue <=-1) { // Only check if max is negative since min can be 0
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
    <>
      <h1 className="mb-2 text-base font-medium uppercase text-brand">
        Unit Price ($)
      </h1>
      
      {/* Show current filter status */}
      {(minPrice !== 0 || maxPrice !== 1000) && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-300 rounded text-sm">
          <p className="text-blue-800">
            Active Filter: ${minPrice} - ${maxPrice}
            {isApplying && <span className="ml-2 text-blue-600">(Applying...)</span>}
          </p>
        </div>
      )}
      
      <div className="flex flex-col gap-4 pb-6 mt-4 border-b-2">
        <div className="flex gap-4 " >

        <input 
          type="text" 
          placeholder="From" 
          value={localMin} 
          className="border-[2px] max-w-20 text-center p-1" 
          onChange={(e) => setLocalMin(e.target.value)}
          />
        <input 
          type="text" 
          placeholder="To" 
          value={localMax} 
          className="border-[2px] p-1 max-w-20 text-center" 
          onChange={(e) => setLocalMax(e.target.value)}
          />
          </div>
        <button
          onClick={handleApplyCustomRange}
          disabled={isApplying}
          className={`px-4 max-w-44 py-2 text-white rounded ${
            isApplying 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-smallHeader hover:bg-smallHeader-dark"
          }`}
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-col gap-2">
          {priceRanges.map((range, index) => (
            <div
              key={index}
              className="flex items-center gap-2 mt-1 transition duration-300 transform cursor-pointer group hover:scale-x-95"
            >
              <p
                onClick={() => handlePresetRangeClick(range)}
                className={`hover:underline ${
                  minPrice === range.min && maxPrice === range.max
                    ? "underline text-smallHeader font-semibold"
                    : ""
                } ${isApplying ? "pointer-events-none opacity-50" : ""}`}
              >
                {range.label}
                {isApplying && minPrice === range.min && maxPrice === range.max && (
                  <span className="ml-2 text-xs">(Applying...)</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PriceFilter;