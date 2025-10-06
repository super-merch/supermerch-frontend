import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setClothingGender } from "../../redux/slices/filterSlice";

const ClothingGenderToggle = () => {
  const [selectedGender, setSelectedGender] = useState("all");
  const dispatch = useDispatch();

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    dispatch(setClothingGender(gender));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex space-x-2">
        <button
          onClick={() => handleGenderChange("all")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded transition-colors duration-200 ${
            selectedGender === "all" ? "bg-smallHeader text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleGenderChange("men")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded transition-colors duration-200 ${
            selectedGender === "men" ? "bg-smallHeader text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Men
        </button>
        <button
          onClick={() => handleGenderChange("women")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded transition-colors duration-200 ${
            selectedGender === "women" ? "bg-smallHeader text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Women
        </button>
      </div>
    </div>
  );
};

export default ClothingGenderToggle;
