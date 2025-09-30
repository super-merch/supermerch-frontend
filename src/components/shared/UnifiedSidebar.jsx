import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { IoMenu, IoClose } from "react-icons/io5";
import {
  FaShoppingBag,
  FaWater,
  FaPrint,
  FaGamepad,
  FaHeart,
  FaHome,
  FaUsb,
  FaUserTie,
  FaUtensils,
  FaCaretDown,
  FaPen,
  FaCapsules,
  FaCar,
  FaHeadset,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { getSidebarConfig, getCategoriesForConfig } from "../../config/sidebarConfig";
import { setSelectedCategory, applyFilters, setMinPrice, setMaxPrice } from "../../redux/slices/filterSlice";
import { filterCategoriesByProductAvailability, shouldShowCategory } from "../../utils/categoryFilter";
import PriceFilter from "../shop/PriceFilter";
import ColorFilter from "./ColorFilter";
import ClothingGenderToggle from "./ClothingGenderToggle";

// Category icon mapping
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    Writing: FaPen,
    "Pens & Pencils": FaPen,
    Bags: FaShoppingBag,
    Drinkware: FaWater,
    Print: FaPrint,
    "Printing and Magnets": FaPrint,
    "Fun & Games": FaGamepad,
    "Leisure & Outdoors": FaGamepad,
    "Health & Personal": FaHeart,
    "Home & Office": FaHome,
    "Home & Living": FaHome,
    "USB & Tech": FaUsb,
    Tech: FaUsb,
    "Office Stationery": FaUserTie,
    Food: FaUtensils,
    "Food & Drink": FaUtensils,
    "Keyrings & Tools": FaCar,
    "Exhibitions & Events": FaHeadset,
    Clothing: FaUserTie,
    Headwear: FaCapsules,
    "Capital Equipment": FaUsb,
  };

  return iconMap[categoryName] || FaShoppingBag;
};

const UnifiedSidebar = ({ pageType = "GENERAL", customConfig = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openCategory, setOpenCategory] = useState(null); // which main group is expanded
  const [activeSub, setActiveSub] = useState(null); // which sub item is highlighted
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false); // Categories section collapse state
  const [searchParams] = useSearchParams();
  const {
    setSelectedParamCategoryId,
    setCurrentPage,
    setSidebarActiveCategory,
    setActiveFilterCategory,
    discountedProducts,
    australia,
    hourProd,
    products,
  } = useContext(AppContext);

  // Get configuration for this page type
  const config = customConfig || getSidebarConfig(pageType);
  const allCategories = getCategoriesForConfig(config);

  // Get products based on page type for dynamic filtering
  const getProductsForPageType = () => {
    switch (pageType) {
      case "SALE":
        return discountedProducts || [];
      case "AUSTRALIA_MADE":
        return australia?.data || [];
      case "HOUR_PRODUCTION":
        return hourProd?.data || [];
      case "RETURN_GIFTS":
        return products || [];
      default:
        return [];
    }
  };

  // Filter categories based on product availability for special pages
  const shouldFilterCategories = ["SALE", "AUSTRALIA_MADE", "HOUR_PRODUCTION", "RETURN_GIFTS"].includes(pageType);
  const pageProducts = getProductsForPageType();

  const categories = shouldFilterCategories
    ? allCategories.filter((category) => shouldShowCategory(category, pageProducts))
    : allCategories;

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
    if (urlSubCategory && urlCategoryName && categories.length > 0) {
      // Find the category that contains this subcategory
      const categoryWithSubcategory = categories.find(
        (category) => category.name === urlCategoryName && category.subTypes?.some((subType) => subType.name === urlSubCategory)
      );

      if (categoryWithSubcategory) {
        setOpenCategory(categoryWithSubcategory.id);
        setActiveSub(urlSubCategory);
      }
    }
  }, [urlSubCategory, urlCategoryName]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleMainCategoryClick = (categoryId, categoryName) => {
    // Toggle expansion: if clicking the same category, collapse it; otherwise expand the new one
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
    setActiveSub(null); // reset subcategory highlight when switching groups
    dispatch(setSelectedCategory(categoryName));
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
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
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "lg:w-[100%] z-10 mt-14 lg:mt-0 md:w-[280px] w-[90vw] absolute h-screen md:shadow-xl shadow-xl bg-white lg:shadow-none px-3 lg:px-0 py-4"
            : "hidden"
        }`}
      >
        <div className="h-full pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-base font-semibold text-gray-800">{config.title}</h1>
              <button
                onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors duration-200"
                title={isCategoriesCollapsed ? "Show categories" : "Hide categories"}
              >
                {isCategoriesCollapsed ? (
                  <>
                    <span>Show</span>
                    <FaCaretDown size={10} />
                  </>
                ) : (
                  <>
                    <span>Hide</span>
                    <FaCaretDown size={10} />
                  </>
                )}
              </button>
            </div>
            {config.description && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{config.description}</p>}

            {/* Categories List */}
            {!isCategoriesCollapsed && (
              <div className="space-y-0.5 animate-fade-in">
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <div key={category.id} className="w-full">
                      {/* Main Category */}
                      <div
                        className={`group flex items-center justify-between py-1.5 px-1 cursor-pointer transition-all duration-200 ${
                          openCategory === category.id ? "bg-gray-100 text-gray-800" : "hover:bg-gray-50 text-gray-600"
                        }`}
                        onClick={() => handleMainCategoryClick(category.id, category.name)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="transition-colors duration-200 text-gray-500">
                            <IconComponent size={14} />
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div
                          className={`transition-transform duration-200 ${
                            openCategory === category.id ? "rotate-180 text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        >
                          <FaCaretDown size={12} />
                        </div>
                      </div>

                      {/* Subcategories */}
                      {openCategory === category.id && category.subTypes && (
                        <div className="ml-4 mt-1 space-y-0.5 animate-fade-in">
                          {category.subTypes.map((subType) => {
                            // Check if this subcategory is active based on URL parameters or local state
                            const isActive =
                              (urlSubCategory === subType.name && urlCategoryName === category.name) ||
                              (activeSub === subType.name && openCategory == category.id);

                            return (
                              <button
                                key={subType.id}
                                onClick={() => handleSubCategoryClick(subType.name, subType.id, category.name)}
                                className={`w-full text-left py-1 px-1 transition-all duration-200 ${
                                  isActive || selectedCategory === subType.name
                                    ? "bg-gray-100 text-gray-800 font-medium"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-xs">{subType.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 space-y-4">
            {pageType === "CLOTHING" && <ClothingGenderToggle />}
            <PriceFilter />
            <ColorFilter />
          </div>
        </div>
      </div>
    </div>
  );
};

UnifiedSidebar.propTypes = {
  pageType: PropTypes.string,
  customConfig: PropTypes.object,
};

export default UnifiedSidebar;
