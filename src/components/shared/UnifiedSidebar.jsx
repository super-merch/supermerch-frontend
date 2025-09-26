import React, { useState, useEffect, useContext } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../context/AppContext";
import { getSidebarConfig, getCategoriesForConfig } from "../../config/sidebarConfig";
import { setSelectedCategory, applyFilters } from "../../redux/slices/filterSlice";
import PriceFilter from "../shop/PriceFilter";
import BrandCheckboxes from "../shop/BrandFilter";
import PopularTags from "../shop/PopularTags";

const UnifiedSidebar = ({ pageType = "GENERAL", customConfig = null }) => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Get configuration for this page type
  const config = customConfig || getSidebarConfig(pageType);
  const categories = getCategoriesForConfig(config);

  // Mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1025);
      if (window.innerWidth > 1025) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCategoryClick = (categoryName) => {
    dispatch(setSelectedCategory(categoryName));
    dispatch(applyFilters());
  };

  const handleSubCategoryClick = (subCategory, categoryId, categoryName) => {
    // This will be implemented based on your existing navigation logic
    console.log("Subcategory clicked:", subCategory, categoryId, categoryName);
    // TODO: Implement navigation logic similar to existing components
  };

  return (
    <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
      {/* Mobile toggle button */}
      {isMobile && (
        <button onClick={toggleSidebar} className="absolute px-2 py-1 text-white rounded top-4 bg-smallHeader z-20">
          {isSidebarOpen ? <IoClose className="text-xl" /> : <IoMenu className="text-xl" />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`transition-all ${
          isSidebarOpen
            ? "lg:w-[100%] z-10 mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen md:shadow-lg shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4"
            : "hidden"
        }`}
      >
        <div className="h-full pr-3 overflow-y-auto">
          {/* Header */}
          <div className="pb-6 border-b-2">
            <h1 className="mb-1 text-base font-medium uppercase text-brand">{config.title}</h1>
            {config.description && <p className="text-sm text-gray-600 mb-4">{config.description}</p>}

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="lg:min-w-[180px] max-lg:min-w-[140px]">
                  <div
                    className={`py-2 px-3 rounded cursor-pointer transition-colors ${
                      activeCategory === category.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setActiveCategory(activeCategory === category.id ? null : category.id);
                      handleCategoryClick(category.name);
                    }}
                  >
                    <p className="text-lg font-semibold text-blue-500 cursor-pointer">{category.name}</p>
                  </div>

                  {/* Subcategories */}
                  {activeCategory === category.id && category.subTypes && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subTypes.map((subType) => (
                        <button
                          key={subType.id}
                          onClick={() => handleSubCategoryClick(subType.name, subType.id, category.name)}
                          className={`font-semibold text-[13px] block text-start w-full text-left py-1 px-2 rounded transition-colors ${
                            selectedCategory === subType.name
                              ? "text-blue-500 bg-blue-50"
                              : "text-gray-700 hover:text-blue-500 hover:bg-gray-50"
                          }`}
                        >
                          {subType.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <PriceFilter />
            <BrandCheckboxes />
            <PopularTags />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSidebar;
