import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
// import { megaMenu } from "../../assets/assets.js";
import { AppContext } from "@/context/AppContext";

// Price ranges for Help me Pick
const priceRanges = [
  { label: "All Prices", min: 0, max: 1000 },
  { label: "Under $5", min: 0, max: 5 },
  { label: "$10 to $50", min: 10, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $150", min: 100, max: 150 },
  { label: "$150 to $200", min: 150, max: 200 },
  { label: "$200 to $250", min: 200, max: 250 },
];

// Custom clothing categories for popup

const HelpMePickModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { v1categories, setPaginationData } = useContext(AppContext);
  const customClothingCategories = v1categories?.filter((category) =>
    [
      "Bottoms",
      "Workwear",
      "Uniforms",
      "Sports Uniforms",
      "Shirts",
      "Jackets",
      "Jumpers",
      "Footwear",
      "Clothing Accessories",
    ].includes(category.name)
  );
  const customHeadwearCategories = v1categories?.filter((category) =>
    ["Headwear"].includes(category.name)
  );
  const megaMenu = v1categories?.filter(
    (category) =>
      ![
        "Bottoms",
        "Workwear",
        "Uniforms",
        "Sports Uniforms",
        "Shirts",
        "Jackets",
        "Jumpers",
        "Footwear",
        "Clothing Accessories",
        "Headwear",
      ].includes(category.name)
  );

  const mainCategories = [
    { id: "promotion", name: "Promotion", data: megaMenu },
    { id: "clothing", name: "Clothing", data: customClothingCategories },
    { id: "headwear", name: "Headwear", data: customHeadwearCategories },
  ];

  const [step, setStep] = useState(1);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedPrice, setPrice] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  const handleMainCategorySelect = (category) => {
    setSelectedMainCategory(category);
    if (category.id === "promotion") {
      setAvailableSubCategories(megaMenu);
    } else if (category.id === "clothing") {
      setAvailableSubCategories(customClothingCategories);
    } else if (category.id === "headwear") {
      setAvailableSubCategories(customHeadwearCategories);
    }
  };

  const handlePriceSelect = (price) => setPrice(price);
  const handleSubCategorySelect = (subCategory) =>
    setSelectedSubCategory(subCategory);

  useEffect(() => {
    if (isOpen) {
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      setPrice(null);
      setStep(1);
      setAvailableSubCategories([]);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleApplyFilters = () => {
    const encodedCategoryName = encodeURIComponent(selectedSubCategory.name);
    dispatch(setMinPrice(selectedPrice.min));
    dispatch(setMaxPrice(selectedPrice.max));
    navigate(
      `/promotional?categoryName=${encodedCategoryName}&category=${selectedSubCategory.id}&minPrice=${selectedPrice.min}&maxPrice=${selectedPrice.max}`
    );
    //scroll to top smooth
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Help Me Pick
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step 1: Main Category Selection */}
        {step === 1 && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Select a Main Category
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-1">
                What type of products are you looking for?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleMainCategorySelect(category);
                    handleNext();
                  }}
                  className={`px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-4 xl:px-10 xl:py-5 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-primary hover:text-primary break-words text-sm sm:text-base md:text-lg ${
                    selectedMainCategory?.id === category.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-gray-300 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                disabled={step === 1}
                onClick={handleBack}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedMainCategory}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Price Range Selection */}
        {step === 2 && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Select a Price Range
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-1">
                Select price range you are looking for...
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Choose 1 from {priceRanges?.length} options
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 max-h-64 overflow-y-auto">
              {priceRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    handlePriceSelect(range);
                    handleNext();
                  }}
                  className={`px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-3 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-primary hover:text-primary text-sm sm:text-base break-words ${
                    selectedPrice === range
                      ? "border-primary text-primary bg-primary/10"
                      : "border-gray-300 text-gray-700 hover:bg-primary/10"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                disabled={step === 1}
                onClick={handleBack}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedPrice}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sub Category Selection */}
        {step === 3 && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Select a Category
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-1">
                Select the specific category you want...
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Choose 1 from {availableSubCategories?.length} options
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 max-h-64 overflow-y-auto">
              {availableSubCategories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSubCategorySelect(category)}
                  className={`px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-3 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-primary hover:text-primary text-sm sm:text-base break-words ${
                    selectedSubCategory?.id === category.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-gray-300 text-gray-700 hover:bg-primary/10"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                disabled={step === 1}
                onClick={handleBack}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={!selectedSubCategory}
                className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HelpMePickModal;
