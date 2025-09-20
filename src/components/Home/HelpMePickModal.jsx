import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMinPrice, setMaxPrice, applyFilters } from "../../redux/slices/filterSlice";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { megaMenu } from "../../assets/assets.js";

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
const customClothingCategories = [
  {
    id: "B-CW",
    name: "Corporate Wear",
    subTypes: [
      {
        label: "Pants",
        items: [{ id: "B-03", name: "Dresses" }],
      },
    ],
  },
  {
    id: "B-AW",
    name: "Activewear",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-09", name: "Polo Shirts" }],
      },
    ],
  },
  {
    id: "B-WW",
    name: "Workwear",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-18", name: "T Shirts" }],
      },
    ],
  },
  {
    id: "B-BR",
    name: "Brands",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-13", name: "Shirts" }],
      },
    ],
  },
  {
    id: "B-HT",
    name: "Hospitality",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-02", name: "Aprons" }],
      },
    ],
  },
];

// Custom headwear categories for popup
const customHeadwearCategories = [
  {
    id: "G-CAP",
    name: "Caps & Hats",
    subTypes: [
      {
        label: "Headwear",
        items: [
          { id: "G-01", name: "Baseball Caps" },
          { id: "G-04", name: "Flat Peak Caps" },
          { id: "G-08", name: "Trucker Caps" },
        ],
      },
    ],
  },
  {
    id: "G-SUN",
    name: "Sun Protection",
    subTypes: [
      {
        label: "Headwear",
        items: [
          { id: "G-03", name: "Bucket & Sun Hats" },
          { id: "G-07", name: "Straw Hats" },
          { id: "G-09", name: "Visors" },
        ],
      },
    ],
  },
  {
    id: "G-WIN",
    name: "Winter Wear",
    subTypes: [
      {
        label: "Headwear",
        items: [
          { id: "G-02", name: "Beanies" },
          { id: "G-05", name: "Headbands" },
        ],
      },
    ],
  },
  {
    id: "G-KID",
    name: "Kids & Specialty",
    subTypes: [
      {
        label: "Headwear",
        items: [
          { id: "G-06", name: "Kid's Caps" },
          { id: "G-10", name: "Misc Headwear" },
        ],
      },
    ],
  },
];

const mainCategories = [
  { id: "promotion", name: "Promotion", data: megaMenu },
  { id: "clothing", name: "Clothing", data: customClothingCategories },
  { id: "headwear", name: "Headwear", data: customHeadwearCategories },
];

const HelpMePickModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const handleSubCategorySelect = (subCategory) => setSelectedSubCategory(subCategory);

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
    dispatch(setMinPrice(selectedPrice.min));
    dispatch(setMaxPrice(selectedPrice.max));
    dispatch(applyFilters());

    if (selectedMainCategory.id === "promotion") {
      const encodedCategoryName = encodeURIComponent(selectedSubCategory.name);
      navigate(`/Spromotional?categoryName=${encodedCategoryName}&category=${selectedSubCategory.id}`);
    } else if (selectedMainCategory.id === "clothing") {
      let selectedItem = null;
      let selectedLabel = null;

      for (const subType of selectedSubCategory.subTypes) {
        if (subType.items && subType.items.length > 0) {
          selectedItem = subType.items[0];
          selectedLabel = subType.label;
          break;
        }
      }

      if (selectedItem) {
        const encodedCategoryName = encodeURIComponent(selectedSubCategory.name);
        const encodedLabel = encodeURIComponent(selectedLabel);
        navigate(`/Spromotional?categoryName=${encodedCategoryName}&category=${selectedItem.id}&label=${encodedLabel}`);
      }
    } else if (selectedMainCategory.id === "headwear") {
      let selectedItem = null;
      let selectedLabel = null;

      for (const subType of selectedSubCategory.subTypes) {
        if (subType.items && subType.items.length > 0) {
          selectedItem = subType.items[0];
          selectedLabel = subType.label;
          break;
        }
      }

      if (selectedItem) {
        const encodedCategoryName = encodeURIComponent(selectedSubCategory.name);
        const encodedLabel = encodeURIComponent(selectedLabel);
        navigate(`/Spromotional?categoryName=${encodedCategoryName}&category=${selectedItem.id}&label=${encodedLabel}`);
      }
    }

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Help Me Pick</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step 1: Main Category Selection */}
        {step === 1 && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Main Category</h3>
              <p className="text-gray-600 mb-1">What type of products are you looking for?</p>
              <p className="text-sm text-gray-500">Choose 1 from {mainCategories?.length} options</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleMainCategorySelect(category);
                    handleNext();
                  }}
                  className={`px-6 py-4 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-blue-500 hover:text-blue-600 ${
                    selectedMainCategory?.id === category.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
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
                className="px-6 py-2 text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedMainCategory}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Price Range Selection */}
        {step === 2 && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Price Range</h3>
              <p className="text-gray-600 mb-1">Select price range you are looking for...</p>
              <p className="text-sm text-gray-500">Choose 1 from {priceRanges?.length} options</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 max-h-64 overflow-y-auto">
              {priceRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    handlePriceSelect(range);
                    handleNext();
                  }}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-blue-500 hover:text-blue-600 ${
                    selectedPrice === range ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-blue-50"
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
                className="px-6 py-2 text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedPrice}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sub Category Selection */}
        {step === 3 && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Category</h3>
              <p className="text-gray-600 mb-1">Select the specific category you want...</p>
              <p className="text-sm text-gray-500">Choose 1 from {availableSubCategories?.length} options</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 max-h-64 overflow-y-auto">
              {availableSubCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSubCategorySelect(category)}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold text-center transition-all duration-200 hover:border-blue-500 hover:text-blue-600 ${
                    selectedSubCategory?.id === category.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
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
                className="px-6 py-2 text-gray-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={!selectedSubCategory}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
