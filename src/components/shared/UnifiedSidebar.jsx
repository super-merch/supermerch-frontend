import React, { useState, useEffect, useContext } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { getSidebarConfig, getCategoriesForConfig } from "../../config/sidebarConfig";
import { setSelectedCategory, applyFilters, setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import PriceFilter from "../shop/PriceFilter";
import BrandCheckboxes from "../shop/BrandFilter";
import PopularTags from "../shop/PopularTags";

const UnifiedSidebar = ({ pageType = "GENERAL", customConfig = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Separate state for expansion and highlighting
  const [openCategory, setOpenCategory] = useState(null); // which main group is expanded
  const [activeSub, setActiveSub] = useState(null);       // which sub item is highlighted
  
  const [searchParams] = useSearchParams();
  const { setSelectedParamCategoryId, setCurrentPage, setSidebarActiveCategory, setActiveFilterCategory } = useContext(AppContext);

  // Get configuration for this page type
  const config = customConfig || getSidebarConfig(pageType);
  const categories = getCategoriesForConfig(config);

  // Get URL parameters for active state
  const urlSubCategory = searchParams.get("subCategory");
  const urlCategoryName = searchParams.get("categoryName");

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

  // Auto-expand category that contains the active subcategory
  useEffect(() => {
    if (urlSubCategory && urlCategoryName) {
      // Find the category that contains this subcategory
      const categoryWithSubcategory = categories.find(
        (category) => category.name === urlCategoryName && category.subTypes?.some((subType) => subType.name === urlSubCategory)
      );

      if (categoryWithSubcategory) {
        setOpenCategory(categoryWithSubcategory.id);
        setActiveSub(urlSubCategory);
      }
    }
  }, [urlSubCategory, urlCategoryName, categories]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    // Toggle expansion: if clicking the same category, collapse it; otherwise expand the new one
    setOpenCategory(categoryId === openCategory ? null : categoryId);
    setActiveSub(null); // Reset any active sub when switching groups
    dispatch(setSelectedCategory(categoryName));
    dispatch(applyFilters());
  };

  const handleSubCategoryClick = (subCategory, categoryId, categoryName) => {
    setActiveSub(subCategory); // Set the active subcategory
    const encodedTitleName = encodeURIComponent(categoryName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());

    // Determine the correct route based on the category name
    let targetRoute = "/Spromotional"; // Default fallback

    if (categoryName === "Clothing") {
      targetRoute = "/Clothing";
    } else if (categoryName === "Headwear") {
      targetRoute = "/Headwear";
    } else if (categoryName === "Capital Equipment") {
      targetRoute = "/Spromotional"; // Keep as promotional for now
    }
    // For all other categories, use /Spromotional

    navigate(`${targetRoute}?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}`);
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(categoryName);
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
                      openCategory === category.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                  >
                    <p className="text-lg font-semibold text-blue-500 cursor-pointer">{category.name}</p>
                  </div>

                  {/* Subcategories */}
                  {openCategory === category.id && category.subTypes && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subTypes.map((subType) => {
                        // Check if this subcategory is active based on URL parameters or local state
                        const isActive = (urlSubCategory === subType.name && urlCategoryName === category.name) || 
                                        (activeSub === subType.name && openCategory === category.id);

                        return (
                          <button
                            key={subType.id}
                            onClick={() => handleSubCategoryClick(subType.name, subType.id, category.name)}
                            className={`font-semibold text-[13px] block text-start w-full text-left py-1 px-2 rounded transition-colors ${
                              isActive || selectedCategory === subType.name
                                ? "text-blue-500 bg-blue-50"
                                : "text-gray-700 hover:text-blue-500 hover:bg-gray-50"
                            }`}
                          >
                            {subType.name}
                          </button>
                        );
                      })}
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
