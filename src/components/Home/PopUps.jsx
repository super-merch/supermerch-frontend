import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSelectedCategory,
  setMinPrice,
  setMaxPrice,
  setSelectedBrands,
  applyFilters,
} from "../../redux/slices/filterSlice";
import { motion } from "framer-motion";

// Import your data arrays
import { megaMenu, megaMenuClothing, headWear } from "../../assets/assets.js";

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
        items: [{ id: "B-03", name: "Dresses" }]
      }
    ]
  },
  {
    id: "B-AW", 
    name: "Activewear",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-09", name: "Polo Shirts" }]
      }
    ]
  },
  {
    id: "B-WW",
    name: "Workwear", 
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-18", name: "T Shirts" }]
      }
    ]
  },
  {
    id: "B-BR",
    name: "Brands",
    subTypes: [
      {
        label: "Top", 
        items: [{ id: "B-13", name: "Shirts" }]
      }
    ]
  },
  {
    id: "B-HT",
    name: "Hospitality",
    subTypes: [
      {
        label: "Top",
        items: [{ id: "B-02", name: "Aprons" }]
      }
    ]
  }
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
          { id: "G-08", name: "Trucker Caps" }
        ]
      }
    ]
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
          { id: "G-09", name: "Visors" }
        ]
      }
    ]
  },
  {
    id: "G-WIN",
    name: "Winter Wear",
    subTypes: [
      {
        label: "Headwear", 
        items: [
          { id: "G-02", name: "Beanies" },
          { id: "G-05", name: "Headbands" }
        ]
      }
    ]
  },
  {
    id: "G-KID",
    name: "Kids & Specialty",
    subTypes: [
      {
        label: "Headwear",
        items: [
          { id: "G-06", name: "Kid's Caps" },
          { id: "G-10", name: "Misc Headwear" }
        ]
      }
    ]
  }
];

const mainCategories = [
  { id: "promotion", name: "Promotion", data: megaMenu },
  { id: "clothing", name: "Clothing", data: customClothingCategories },
  { id: "headwear", name: "Headwear", data: customHeadwearCategories },
];

const PopUp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Main Category, 2 = Price, 3 = Sub Category
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedPrice, setPrice] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMainCategorySelect = (category) => {
    setSelectedMainCategory(category);
    // Set available subcategories based on selected main category
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
    // Apply price filters to Redux store
    dispatch(setMinPrice(selectedPrice.min));
    dispatch(setMaxPrice(selectedPrice.max));
    dispatch(applyFilters());
    
    if (selectedMainCategory.id === "promotion") {
      // For promotion: navigate with categoryName and category ID
      const encodedCategoryName = encodeURIComponent(selectedSubCategory.name);
      navigate(`/Spromotional?categoryName=${encodedCategoryName}&category=${selectedSubCategory.id}`);
    } else if (selectedMainCategory.id === "clothing") {
      // For clothing: navigate with categoryName, category ID, and label
      // We need to find a subcategory item to get the proper structure
      let selectedItem = null;
      let selectedLabel = null;
      
      // Find the first available item from the selected clothing category
      for (const subType of selectedSubCategory.subTypes) {
        if (subType.items && subType.items.length > 0) {
          selectedItem = subType.items[0]; // Take first item
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
      // For headwear: similar to clothing structure
      let selectedItem = null;
      let selectedLabel = null;
      
      for (const subType of selectedSubCategory.subTypes) {
        if (subType.items && subType.items.length > 0) {
          selectedItem = subType.items[0]; // Take first item
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
    
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <div className="flex items-center mt-1">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 bg-blue-500 text-white font-normal rounded hover:bg-blue-600 transition duration-300"
      >
        Help me Pick
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0.2, z: 90 }}
          transition={{ duration: 0.3 }}
          whileInView={{ opacity: 1, z: 0 }}
          viewport={{ once: true }}
          className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center p-2"
        >
          <div className="flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white rounded-md max-h-[440px] h-full">
            <div className="flex py-4 border-b text-[15px] relative px-5 text-center items-center justify-between">
              <h2 className="text-lg text-center font-semibold text-gray-800">
                Help Me Pick
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                ✖
              </button>
            </div>

            {/* Step 1: Main Category Selection */}
            {step === 1 && (
              <div className="overflow-y-auto">
                <div className="flex flex-col justify-center items-center my-5">
                  <h2 className="text-lg font-bold">Select a Main Category</h2>
                  <p className="text-sm font-semibold">What type of products are you looking for?</p>
                  <p className="text-sm font-medium italic mb-4">Choose 1 from {mainCategories?.length} options</p>
                  <div className="grid p-2 grid-cols-1 justify-center items-center gap-4">
                    {mainCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {handleMainCategorySelect(category)
                          handleNext()
                        }}
                        className="px-4 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold"
                      >
                        <p className={`${selectedMainCategory?.id === category.id
                          ? "text-[#1d6ce3] underline"
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                        }`}>
                          {category.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] sticky bottom-0 bg-white px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedMainCategory}
                    className="text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Price Range Selection */}
            {step === 2 && (
              <div className="overflow-y-auto">
                <div className="flex flex-col justify-center items-center my-5">
                  <h2 className="text-lg font-bold">Select a Price Range</h2>
                  <p className="text-sm font-semibold">Select price range you are looking for...</p>
                  <p className="text-sm font-medium italic mb-4">Choose 1 from {priceRanges?.length} options</p>
                  <div className="grid p-2 grid-cols-2 justify-center items-center gap-4">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {handlePriceSelect(range)
                          handleNext()
                        }
                        }
                        className="px-3 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold"
                      >
                        <p className={`${selectedPrice === range
                          ? "text-[#1d6ce3] underline"
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                        }`}>
                          {range.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] bg-white sticky bottom-0 px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedPrice}
                    className="text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Sub Category Selection */}
            {step === 3 && (
              <div className="overflow-y-auto">
                <div className="flex flex-col justify-center items-center my-5">
                  <h2 className="text-lg font-bold">Select a Category</h2>
                  <p className="text-sm font-semibold">Select the specific category you want...</p>
                  <p className="text-sm font-medium italic mb-4">Choose 1 from {availableSubCategories?.length} options</p>
                  <div className="grid p-2 grid-cols-2 justify-center items-center gap-4 max-h-48 overflow-y-auto">
                    {availableSubCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleSubCategorySelect(category)}
                        className="px-4 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold"
                      >
                        <p className={`${selectedSubCategory?.id === category.id
                          ? "text-[#1d6ce3] underline"
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                        }`}>
                          {category.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] sticky bottom-0 bg-white px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    disabled={!selectedSubCategory}
                    className="text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PopUp;