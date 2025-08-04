import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setMinPrice,
  setMaxPrice,
  applyFilters,
} from "../../redux/slices/filterSlice";
import { Range } from "react-range"; 

const PriceFilter = () => {
  const dispatch = useDispatch();
  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  const handleRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleRangeFinalChange = (values) => {
    const [min, max] = values;
    dispatch(setMinPrice(min));
    dispatch(setMaxPrice(max));
    dispatch(applyFilters());
  };

  const priceRanges = [
    { label: "All Prices", min: 0, max: 1000 },
    { label: "Under $5", min: 0, max: 5 },
    { label: "$10 to $50", min: 10, max: 50 },
    { label: "$50 to $100", min: 50, max: 100 },
    { label: "$100 to $150", min: 100, max: 150 },
    { label: "$150 to $200", min: 150, max: 200 },
    { label: "$200 to $250", min: 200, max: 250 },
  ];

  return (
    <>
      <h1 className="mb-2 text-base font-medium uppercase text-brand">
        Price Range
      </h1>
      <div className="flex flex-col gap-4 pb-6 mt-4 border-b-2">

        
        <div className="flex flex-col gap-2">
          {priceRanges.map((range, index) => (
            <div
              key={index}
              className="flex items-center gap-2 mt-1 transition duration-300 transform cursor-pointer group hover:scale-x-95"
            >
              <p
                onClick={() => {
                  setPriceRange([range.min, range.max]);
                  dispatch(setMinPrice(range.min));
                  dispatch(setMaxPrice(range.max));
                  dispatch(applyFilters());
                }}
                className={`hover:underline ${
                  minPrice === range.min && maxPrice === range.max
                    ? "underline text-smallHeader"
                    : ""
                }`}
              >
                {range.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PriceFilter;
