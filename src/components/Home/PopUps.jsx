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

const brands = [
  "Apple",
  "Microsoft",
  "Symphony",
  "Dell",
  "Sony",
  "LG",
  "One Plus",
  "Google",
  "Samsung",
  "HP",
  "Xiaomi",
  "Panasonic",
  "Intel",
];

const categories = [
  "promotion",
  "headwear",
  "clothing",
  "promotion2",
  "headwear2",
  "clothing2",
];

const priceRanges = [
  { label: "All Prices", min: 0, max: 1000 },
  { label: "Under $20", min: 0, max: 20 },
  { label: "$25 to $100", min: 25, max: 100 },
  { label: "$100 to $300", min: 100, max: 300 },
  { label: "$300 to $500", min: 300, max: 500 },
  { label: "$500 to $1,000", min: 500, max: 1000 },
  { label: "$1,000 to $10,000", min: 1000, max: 10000 },
];

const PopUp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Category, 2 = Price, 3 = Brand
  const [selectedCategory, setCategory] = useState(null);
  const [selectedPrice, setPrice] = useState(null);
  const [selectedBrand, setBrand] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCategorySelect = (category) => setCategory(category);
  const handlePriceSelect = (price) => setPrice(price);
  const handleBrandSelect = (brand) => setBrand(brand);
  useEffect(() => {
    if (isOpen) {
      setCategory(null);
      setBrand(null);
      setPrice(null);
      setStep(1);
    }
  }, [isOpen]);
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleApplyFilters = () => {
    dispatch(setSelectedCategory(selectedCategory));
    dispatch(setMinPrice(selectedPrice.min));
    dispatch(setMaxPrice(selectedPrice.max));
    dispatch(setSelectedBrands([selectedBrand]));
    dispatch(applyFilters());
    navigate("/shop");
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
          className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center  p-2">
          <div className="flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white rounded-md max-h-[440px] h-full">
            <div className="flex py-4 border-b text-[15px] relative px-5 text-center items-center justify-between">
              <h2 className="text-lg text-center font-semibold text-gray-800 ">
                Help Me Pick
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className=" text-gray-500 hover:text-gray-800 transition"
              >
                ✖
              </button>
            </div>
            {step === 1 && (
              <div className="overflow-y-auto">
                <div className="flex flex-col justify-center items-center my-5">
                  <h2 className="text-lg font-bold">Select a Category</h2>
                  <p className="text-sm font-semibold">What type of category are you looking for?</p>
                  <p className="text-sm font-medium italic mb-4">Choose 1 from {categories?.length} options</p>
                  <div className="grid p-2 grid-cols-2 justify-center items-center gap-4">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-4 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold `}
                      >
                        <p className={`${selectedCategory === category
                          ? "text-[#1d6ce3] underline "
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                          }`}>{category}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] relative px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600 ">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedCategory}
                    className=" text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

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
                        onClick={() => handlePriceSelect(range)}
                        className={`px-3 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold `}
                      >
                        <p className={`${selectedPrice === range
                          ? "text-[#1d6ce3] underline "
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                          }`}>{range.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] relative px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600 ">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedPrice}
                    className=" text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}



            {step === 3 && (
              <div className="overflow-y-auto">
                <div className="flex flex-col justify-center items-center my-5">
                  <h2 className="text-lg font-bold">Select a Brand</h2>
                  <p className="text-sm font-semibold">Select brand name you are looking for...</p>
                  <p className="text-sm font-medium italic mb-4">Choose 1 from {brands?.length} options</p>
                  <div className="grid p-2 grid-cols-2 justify-center items-center gap-4">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleBrandSelect(brand)}
                        className={`px-4 sm:px-10 py-2 border group border-[#1b6ce0] rounded-md mt-2 font-semibold `}
                      >
                        <p className={`${selectedBrand === brand
                          ? "text-[#1d6ce3] underline "
                          : "text-[#1d6ce3] group-hover:scale-105 transition-all duration-300"
                          }`}>{brand}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-auto py-4 border-t leading-5 text-[15px] relative px-5 text-center items-center justify-between">
                  <button
                    disabled={step === 1}
                    onClick={handleBack}
                    className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-gray-600 ">
                    Back
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    disabled={!selectedBrand}
                    className=" text-sm disabled:text-blue-400 disabled:cursor-not-allowed cursor-pointer text-center font-semibold text-blue-600"
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
