// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// // import {
// //   setMinPrice,
// //   setMaxPrice,
// //   applyFilters,
// // } from "../../../redux/slices/filterSlice";
// import { Range } from "react-range";
// import { applyFilters, setMaxPrice, setMinPrice } from "@/redux/slices/promotionalSlice";

// const PromotionalPriceFilter = () => {
//   const dispatch = useDispatch();
//   const { minPrice, maxPrice } = useSelector((state) => state.promotionals);
//   const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

//   const handleRangeChange = (values) => {
//     setPriceRange(values);
//   };

//   const handleRangeFinalChange = (values) => {
//     const [min, max] = values;
//     dispatch(setMinPrice(min));
//     dispatch(setMaxPrice(max));
//     dispatch(applyFilters());
//   };

//   // const priceRanges = [
//   //   { label: "All Prices", min: 0, max: 1000 },
//   //   { label: "Under $20", min: 0, max: 20 },
//   //   { label: "$25 to $100", min: 25, max: 100 },
//   //   { label: "$100 to $300", min: 100, max: 300 },
//   //   { label: "$300 to $500", min: 300, max: 500 },
//   //   { label: "$500 to $1,000", min: 500, max: 1000 },
//   //   { label: "$1,000 to $10,000", min: 1000, max: 10000 },
//   // ];
//   const priceRanges = [
//     { label: "All Prices", min: 0, max: 1000 },
//     { label: "Under $5", min: 0, max: 5 },
//     { label: "$10 to $50", min: 10, max: 50 },
//     { label: "$50 to $100", min: 50, max: 100 },
//     { label: "$100 to $150", min: 100, max: 150 },
//     { label: "$150 to $200", min: 150, max: 200 },
//     { label: "$200 to $250", min: 200, max: 250 },
//   ];

//   return (
//     <>
//       <h1 className="mb-2 text-base font-medium uppercase text-brand">
//         Price Range
//       </h1>
//       <div className="flex flex-col gap-4 pb-6 mt-4 border-b-2">
//         <div className="ml-2 ">
//           <Range
//             step={1}
//             min={0}
//             max={1000}
//             values={priceRange}
//             onChange={handleRangeChange}
//             onFinalChange={handleRangeFinalChange}
//             renderTrack={({ props, children }) => (
//               <div
//                 key={children}
//                 {...props}
//                 style={{
//                   height: "3px",
//                   width: "90%",
//                   background: "#ccc",
//                   position: "relative",
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     position: "absolute",
//                     height: "3px",
//                     background: "navy",
//                     borderRadius: "2px",
//                     left: `${((priceRange[0] - 0) / (1000 - 0)) * 100}%`,
//                     right: `${95 - ((priceRange[1] - 0) / (1000 - 0)) * 100}%`,
//                   }}
//                 />
//                 {children}
//               </div>
//             )}
//             renderThumb={({ props, isDragged }) => (
//               <div
//                 key={isDragged}
//                 {...props}
//                 style={{
//                   height: "16px",
//                   width: "16px",
//                   backgroundColor: "white",
//                   border: isDragged ? "3px solid navy" : "2px solid navy",
//                   borderRadius: "50%",
//                   boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.5)",
//                   transform: `${
//                     props.style.transform || ""
//                   } translate(120.922px, 6.50174px)`,
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div className="flex items-center justify-between gap-4 lg:flex-nowrap">
//           <button className="w-full px-3 py-3 text-sm border rounded text-start text-minPrice border-border">
//             Min price
//           </button>
//           <button className="w-full px-3 py-3 text-sm border rounded text-start text-minPrice border-border">
//             Max price
//           </button>
//         </div>
//         <div className="flex flex-col gap-2">
//           {priceRanges.map((range, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-2 mt-1 transition duration-300 transform cursor-pointer  group hover:scale-x-95"
//             >
//               <p
//                 onClick={() => {
//                   setPriceRange([range.min, range.max]);
//                   dispatch(setMinPrice(range.min));
//                   dispatch(setMaxPrice(range.max));
//                   dispatch(applyFilters());
//                 }}
//                 className={`hover:underline ${
//                   minPrice === range.min && maxPrice === range.max
//                     ? "underline text-smallHeader"
//                     : ""
//                 }`}
//               >
//                 {range.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PromotionalPriceFilter;

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setMinPrice,
  setMaxPrice,
  applyFilters,
} from "../../../redux/slices/filterSlice";
import { Range } from "react-range";
import { toast } from "react-toastify";

const PromotionalPriceFilter = () => {
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

  const priceRanges = [{ label: "All Prices", min: 0, max: 1000 }];

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
    <>
      <h1 className="mb-2 text-base font-medium uppercase text-brand">
        Price Range
      </h1>

      {/* Show current filter status */}
      {(minPrice !== 0 || maxPrice !== 1000) && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-300 rounded text-sm">
          <p className="text-blue-800">
            Active Filter: ${minPrice} - ${maxPrice}
            {isApplying && (
              <span className="ml-2 text-primary">(Applying...)</span>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 pb-6 mt-4 border-b-2">
        <div className="flex gap-4 ">
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
              : "bg-primary hover:bg-primary-dark"
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
                {isApplying &&
                  minPrice === range.min &&
                  maxPrice === range.max && (
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

export default PromotionalPriceFilter;
