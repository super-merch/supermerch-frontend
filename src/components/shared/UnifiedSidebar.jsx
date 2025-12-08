import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { IoMenu, IoClose, IoGolfSharp } from "react-icons/io5";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { X } from "lucide-react";
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
  FaTools,
  FaTshirt,
} from "react-icons/fa";
import {
  GiClothes,
  GiConverseShoe,
  GiMonclerJacket,
  GiRunningShoe,
  GiWrappedSweet,
} from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
// import {
//   getSidebarConfig,
//   getCategoriesForConfig,
// } from "../../config/sidebarConfig";
import {
  setSelectedCategory,
  applyFilters,
  setMinPrice,
  setMaxPrice,
} from "../../redux/slices/filterSlice";
import PriceFilter from "../shop/PriceFilter";
import ColorFilter from "./ColorFilter";
import ClothingGenderToggle from "./ClothingGenderToggle";
import CollapsibleSection from "./CollapsibleSection";
import { PiBaseballCapFill, PiPantsFill } from "react-icons/pi";
import { BiDrink } from "react-icons/bi";
import { CiGlass } from "react-icons/ci";
import { MdOutlinePhoneIphone, MdSportsGymnastics } from "react-icons/md";
import { FaChildDress } from "react-icons/fa6";
import AttributeFilters from "./AttributeFilters";

// Category icon mapping
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    Writing: FaPen,
    "Pens & Pencils": FaPen,
    Bags: FaShoppingBag,
    Print: FaPrint,
    "Printing and Magnets": FaPrint,
    "Fun & Games": FaGamepad,
    "Leisure & Outdoors": FaGamepad,
    "Health & Personal": FaHeart,
    "Office & Business": HiMiniBuildingOffice,
    "Home & Living": FaHome,
    "USB & Tech": FaUsb,
    Tech: FaUsb,
    "Office Stationery": FaUserTie,
    Food: FaUtensils,
    "Food & Drink": FaUtensils,
    "Exhibitions & Events": FaHeadset,
    Clothing: FaUserTie,
    "Capital Equipment": FaUsb,
    Bottoms: PiPantsFill,
    "Clothing Accessories": GiClothes,
    Confectionery: GiWrappedSweet,
    Drinkware: BiDrink,
    Footwear: GiConverseShoe,
    Glassware: CiGlass,
    Golf: IoGolfSharp,
    Headwear: PiBaseballCapFill,
    Jackets: GiMonclerJacket,
    Jumpers: GiMonclerJacket,
    "Keyrings & Tools": FaTools,
    "Phone & Technology": MdOutlinePhoneIphone,
    Shirts: FaTshirt,
    "Sports Uniforms": MdSportsGymnastics,
    Uniforms: FaChildDress,
    Workwear: GiClothes,
  };

  return iconMap[categoryName] || FaShoppingBag;
};

const UnifiedSidebar = ({
  pageType = "GENERAL",
  customConfig = null,
  isSearchPage = false,
  categoryType,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    setSelectedParamCategoryId,
    setCurrentPage,
    setSidebarActiveCategory,
    setActiveFilterCategory,
    v1categories, // Add this from context
    setPaginationData,
  } = useContext(AppContext);
  const dropdownCategoryMap = {
    promotional: [
      "Writing",
      "Bags",
      "Drinkware",
      "Exhibitions & Events",
      "Home & Living",
      "Print",
      "Phone & Technology",
      "Leisure & Outdoors",
      "Confectionery",
      "Fun & Games",
      "Glassware",
      "Golf",
      "Keyrings & Tools",
      "Health & Personal",
      "Office & Business",
      // add any other promotional categories you included in RefactoredNavbar
    ],
    clothing: [
      "Footwear",
      "Jackets",
      "Shirts",
      "Jumpers",
      "Bottoms",
      "Clothing Accessories",
      "Uniforms",
      "Workwear",
      "Sports Uniforms",
    ],
    headwear: ["Headwear"],
  };

  // Get configuration for this page type
  const urlCategory = searchParams.get("categoryName");
  const category = v1categories.filter((cat) => cat.name === urlCategory);
  const allCategories = category.length > 0 ? category : v1categories || [];
  const config = { title: "Categories" };
  const urlSubCategory = searchParams.get("subCategory");
  const urlCategoryName = searchParams.get("categoryName");
  const [appliedFilters, setAppliedFilters] = useState([]);
  const getAppliedFilters = (searchParams) => {
    const filters = [];

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice && maxPrice) {
      filters.push({
        type: "price",
        label: `$${minPrice} - $${maxPrice}`,
        params: ["minPrice", "maxPrice"],
      });
    }

    const colors = searchParams.get("colors");
    if (colors) {
      colors.split(",").forEach((color) => {
        filters.push({
          type: "color",
          label: color,
          value: color,
          params: ["colors"],
        });
      });
    }

    const attrName = searchParams.get("attrName");
    const attrValue = searchParams.get("attrValue");
    if (attrName && attrValue) {
      filters.push({
        type: "attribute",
        label: `${attrName}: ${attrValue}`,
        params: ["attrName", "attrValue"],
      });
    }

    return filters;
  };

  // Add this useEffect to update appliedFilters when URL changes
  useEffect(() => {
    const filters = getAppliedFilters(searchParams);
    setAppliedFilters(filters);
  }, [searchParams]);

  const handleRemoveFilter = (filter) => {
    const newParams = new URLSearchParams(searchParams);

    if (filter.type === "color") {
      const currentColors = newParams.get("colors")?.split(",") || [];
      const updatedColors = currentColors.filter((c) => c !== filter.value);

      if (updatedColors.length > 0) {
        newParams.set("colors", updatedColors.join(","));
      } else {
        newParams.delete("colors");
      }

      // Update state immediately
      setPaginationData((prev) => ({
        ...prev,
        colors: updatedColors,
        page: 1,
      }));
    } else if (filter.type === "price") {
      newParams.delete("minPrice");
      newParams.delete("maxPrice");

      // Update Redux state immediately
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));

      // Update pagination state
      setPaginationData((prev) => ({
        ...prev,
        pricerange: undefined,
        page: 1,
      }));
    } else if (filter.type === "attribute") {
      newParams.delete("attrName");
      newParams.delete("attrValue");

      // Update state immediately
      setPaginationData((prev) => ({
        ...prev,
        attributes: null,
        page: 1,
      }));
    }

    newParams.set("page", "1");

    // Update URL - this will trigger the useEffect that reads from URL
    setSearchParams(newParams, { replace: true });
  };

  // Fixed handleClearAllFilters function
  const handleClearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    // Remove all filter params
    newParams.delete("minPrice");
    newParams.delete("maxPrice");
    newParams.delete("colors");
    newParams.delete("attrName");
    newParams.delete("attrValue");
    newParams.set("page", "1");

    // Update all states immediately
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));

    setPaginationData((prev) => ({
      ...prev,
      pricerange: undefined,
      colors: [],
      attributes: null,
      page: 1,
    }));

    // Update URL last
    setSearchParams(newParams, { replace: true });
  };

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

  // Add click outside functionality to close sidebar
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     event.stopPropagation();
  //     if (isMobile && isSidebarOpen) {
  //       const sidebar = document.querySelector("[data-sidebar-content]");
  //       const hamburgerButton = document.querySelector("[data-sidebar-toggle]");

  //       if (
  //         sidebar &&
  //         !sidebar.contains(event.target) &&
  //         hamburgerButton &&
  //         !hamburgerButton.contains(event.target)
  //       ) {
  //         setIsSidebarOpen(false);
  //       }
  //     }
  //   };

  //   if (isMobile && isSidebarOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isMobile, isSidebarOpen]);

  useEffect(() => {
    if (!urlCategoryName || allCategories.length === 0) return;
    const categoryMatch = allCategories.find(
      (category) => category.name === urlCategoryName
    );

    if (!categoryMatch) return;
    // setOpenCategory(categoryMatch.id);
    if (
      urlSubCategory &&
      categoryMatch.subTypes?.some((subType) => subType.name === urlSubCategory)
    ) {
      setActiveSub(urlSubCategory);
    } else {
      setActiveSub(null);
    }
  }, [urlSubCategory, urlCategoryName]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleMainCategoryClick = (categoryId, categoryName) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
    setActiveSub(null); // reset subcategory highlight when switching groups
    dispatch(setSelectedCategory(categoryName));
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    setPaginationData((prev) => ({ ...prev, pricerange: undefined, page: 1 }));
  };

  const handleSubCategoryClick = (subCategory, categoryId, categoryName) => {
    setActiveSub(subCategory); // Set the active subcategory
    const encodedTitleName = encodeURIComponent(categoryName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    setPaginationData((prev) => ({ ...prev, pricerange: undefined, page: 1 }));

    // Determine the correct route based on the category name
    let targetRoute = "/promotional"; // Default fallback
    let type = dropdownCategoryMap.promotional.includes(categoryName)
      ? "promotional"
      : dropdownCategoryMap.clothing.includes(categoryName)
      ? "clothing"
      : dropdownCategoryMap.headwear.includes(categoryName)
      ? "headwear"
      : null;
    const encodedType = encodeURIComponent(type);

    //find out that the category clicked is from promotional or clothing or headwear

    navigate(
      `${targetRoute}?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}&type=${encodedType}`
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(categoryName);
  };

  return (
    <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)] bg-gray-100">
      {/* Hidden toggle button for external control */}
      <button
        data-sidebar-toggle
        onClick={toggleSidebar}
        className="hidden"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        data-sidebar-content
        onClick={(e) => e.stopPropagation()}
        className={`bg-gray-100 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "lg:w-[100%] z-50 lg:mt-0 md:w-[280px] max-w-[90vw] xs:max-w-[95vw] absolute h-screen md:shadow-xl shadow-xl lg:shadow-none px-3 xs:px-2 lg:px-0 py-4"
            : "hidden"
        } ${isMobile ? "bg-white rounded-lg h-max w-full" : "bg-gray-100"}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="h-full pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {appliedFilters.length > 0 && (
            <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  Applied Filters
                </h3>
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {appliedFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group"
                  >
                    <span className="max-w-[150px] truncate">
                      {filter.label}
                    </span>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="flex-shrink-0 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {!isSearchPage && (
            <CollapsibleSection title={config.title} defaultExpanded={false}>
              {/* Categories List */}
              <div className="space-y-0.5">
                {allCategories
                  .filter((category) => category.name !== "Capital Equipment")
                  .map((category) => {
                    const IconComponent = getCategoryIcon(category.name);
                    return (
                      <div key={category.id} className="w-full">
                        {/* Main Category */}
                        <div
                          className={`group flex items-center justify-between py-1.5 px-1 cursor-pointer transition-all duration-200 ${
                            openCategory === category.id
                              ? "bg-gray-100 text-gray-800"
                              : "hover:bg-gray-50 text-gray-600"
                          }`}
                          onClick={() =>
                            handleMainCategoryClick(category.id, category.name)
                          }
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="transition-colors duration-200 text-gray-500">
                              <IconComponent size={14} />
                            </div>
                            <span className="text-sm font-medium">
                              {category.name}
                            </span>
                          </div>

                          {/* Expand/Collapse Icon */}
                          <div
                            className={`transition-transform duration-200 ${
                              openCategory === category.id
                                ? "rotate-180 text-primary"
                                : "text-gray-400 group-hover:text-gray-600"
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
                                (urlSubCategory === subType.name &&
                                  urlCategoryName === category.name) ||
                                (activeSub === subType.name &&
                                  openCategory == category.id);

                              return (
                                <button
                                  key={subType.id}
                                  onClick={() =>
                                    handleSubCategoryClick(
                                      subType.name,
                                      subType.id,
                                      category.name
                                    )
                                  }
                                  className={`w-full text-left py-1 px-1 transition-all duration-200 ${
                                    isActive ||
                                    selectedCategory === subType.name
                                      ? "bg-gray-100 text-gray-800 font-medium"
                                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="text-xs">
                                    {subType.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CollapsibleSection>
          )}
          {/* Filters Section */}
          <div className="mt-4 space-y-4">
            {pageType === "CLOTHING" && (
              <CollapsibleSection title="Gender" defaultExpanded={false}>
                <ClothingGenderToggle />
              </CollapsibleSection>
            )}

            <CollapsibleSection title="Price Range" defaultExpanded={false}>
              <PriceFilter toggleSidebar={toggleSidebar} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Filter by Colour"
              defaultExpanded={false}
            >
              <ColorFilter toggleSidebar={toggleSidebar} />
            </CollapsibleSection>
            {categoryType !== "australia" &&
              categoryType !== "24hr-production" &&
              categoryType !== "sales" && (
                <CollapsibleSection
                  title="Filter by Attributes"
                  defaultExpanded={false}
                >
                  <AttributeFilters
                    toggleSidebar={toggleSidebar}
                    categoryType={categoryType}
                  />
                </CollapsibleSection>
              )}
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
