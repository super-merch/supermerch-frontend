import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setClothingGender } from "../../redux/slices/filterSlice";

const ClothingGenderToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGender = searchParams.get("gender") || "all";
  const [selectedGender, setSelectedGender] = useState(urlGender);
  const dispatch = useDispatch();

  useEffect(() => {
    if (urlGender !== selectedGender) {
      setSelectedGender(urlGender);
      dispatch(setClothingGender(urlGender));
    }
  }, [urlGender, dispatch, selectedGender]);

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    dispatch(setClothingGender(gender));
    
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (gender === "all") {
        newParams.delete("gender");
      } else {
        newParams.set("gender", gender);
      }
      newParams.set("page", "1");
      return newParams;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={() => handleGenderChange("all")}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 border ${
            selectedGender === "all"
              ? "bg-[#009688] text-white border-[#009688] shadow-sm scale-[1.02]"
              : "bg-white text-[#01164F] border-[#CBD5E1] hover:border-[#009688] hover:text-[#009688]"
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          All
        </button>
        <button
          onClick={() => handleGenderChange("men")}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 border ${
            selectedGender === "men"
              ? "bg-[#009688] text-white border-[#009688] shadow-sm scale-[1.02]"
              : "bg-white text-[#01164F] border-[#CBD5E1] hover:border-[#009688] hover:text-[#009688]"
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Men
        </button>
        <button
          onClick={() => handleGenderChange("women")}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 border ${
            selectedGender === "women"
              ? "bg-[#009688] text-white border-[#009688] shadow-sm scale-[1.02]"
              : "bg-white text-[#01164F] border-[#CBD5E1] hover:border-[#009688] hover:text-[#009688]"
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Women
        </button>
      </div>
    </div>
  );
};

export default ClothingGenderToggle;
