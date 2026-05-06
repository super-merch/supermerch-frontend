import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setMoq } from "../../redux/slices/filterSlice";

const MOQFilter = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { moq } = useSelector((state) => state.filters);

  const moqOptions = [
    { label: "All Quantities", value: null },
    { label: "50 or less", value: "50" },
    { label: "100 or less", value: "100" },
    { label: "250 or less", value: "250" },
    { label: "500 or less", value: "500" },
  ];

  const handleMoqChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("moq", value);
    } else {
      newParams.delete("moq");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
    dispatch(setMoq(value));
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1025) {
      toggleSidebar?.();
    }
  };

  return (
    <div className="space-y-2 py-2">
      {moqOptions.map((option) => (
        <label
          key={option.value || "all"}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name="moq"
              checked={moq === option.value || (!moq && !option.value)}
              onChange={() => handleMoqChange(option.value)}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all duration-200"
            />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-primary transform scale-0 peer-checked:scale-100 transition-transform duration-200" />
          </div>
          <span className="text-sm text-gray-600 group-hover:text-primary transition-colors duration-200">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

export default MOQFilter;
