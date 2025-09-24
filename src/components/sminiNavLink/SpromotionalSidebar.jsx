import React, { useState, useEffect, useContext } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../context/AppContext";
import { fetchcategoryProduct, matchProduct } from "@/redux/slices/categorySlice";
import { Link } from "react-router-dom";
import {
  FaPen,
  FaShoppingBag,
  FaWineGlass,
  FaHome,
  FaHeart,
  FaBriefcase,
  FaGamepad,
  FaUtensils,
  FaPrint,
  FaTshirt,
  FaHatCowboy,
  FaGift,
  FaClock,
  FaTag,
  FaFlag,
} from "react-icons/fa";
// import PromotionalPriceFilter from "../miniNavLinks/promotionalComps/PromotionalPriceFilter";
// import PromotionalBrandFilter from "../miniNavLinks/promotionalComps/PromotionalBrandFilter";
// import PromotionalPopularTags from "../miniNavLinks/promotionalComps/PromotionalPopularTags";
import { matchPromotionalProduct, setAllProducts } from "@/redux/slices/promotionalSlice";
import { megaMenu } from "@/assets/assets";

const SpromotionalSidebar = ({ filterLocalProducts, setFilterLocalProducts }) => {
  const dispatch = useDispatch();
  // Although you might be using AppContext for some data,
  // for filtering we now rely on Redux’s category slice.
  const { categoryProducts, products, activeFilterCategory, setActiveFilterCategory, fetchParamProducts, paramProducts, setParamProducts } =
    useContext(AppContext);
  const checkcatPro = useSelector((state) => state.categoryProduct.categoryProduct);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Use the actual megaMenu data for promotional categories
  const promotionalCategories = megaMenu;

  const [sideCatClicked, setSideCatClicked] = useState(false);

  // New design state variables
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);
  const [isPriceRangeCollapsed, setIsPriceRangeCollapsed] = useState(false);
  const [isColorFilterCollapsed, setIsColorFilterCollapsed] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [colorSearch, setColorSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  // Helper functions for new design features
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleCategoriesSection = () => {
    setIsCategoriesCollapsed((prev) => !prev);
  };

  const togglePriceRangeSection = () => {
    setIsPriceRangeCollapsed((prev) => !prev);
  };

  const toggleColorFilterSection = () => {
    setIsColorFilterCollapsed((prev) => !prev);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: parseInt(value) || 0,
    }));
  };

  const applyPriceFilter = () => {
    console.log("Applying price filter:", priceRange);
    // TODO: Implement price filtering logic
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: 0, max: 1000 });
  };

  const handleColorToggle = (colorName) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        return prev.filter((color) => color !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  const clearColorFilter = () => {
    setSelectedColors([]);
    setColorSearch("");
  };

  const applyColorFilter = () => {
    console.log("Applying color filter:", selectedColors);
    // TODO: Implement color filtering logic
  };

  // Color palette data
  const colorPalette = [
    { name: "Red", hex: "#FF0000", rgb: "rgb(255, 0, 0)" },
    { name: "Blue", hex: "#0000FF", rgb: "rgb(0, 0, 255)" },
    { name: "Green", hex: "#00FF00", rgb: "rgb(0, 255, 0)" },
    { name: "Yellow", hex: "#FFFF00", rgb: "rgb(255, 255, 0)" },
    { name: "Orange", hex: "#FFA500", rgb: "rgb(255, 165, 0)" },
    { name: "Purple", hex: "#800080", rgb: "rgb(128, 0, 128)" },
    { name: "Pink", hex: "#FFC0CB", rgb: "rgb(255, 192, 203)" },
    { name: "Black", hex: "#000000", rgb: "rgb(0, 0, 0)" },
    { name: "White", hex: "#FFFFFF", rgb: "rgb(255, 255, 255)" },
    { name: "Gray", hex: "#808080", rgb: "rgb(128, 128, 128)" },
    { name: "Brown", hex: "#A52A2A", rgb: "rgb(165, 42, 42)" },
    { name: "Cyan", hex: "#00FFFF", rgb: "rgb(0, 255, 255)" },
    { name: "Magenta", hex: "#FF00FF", rgb: "rgb(255, 0, 255)" },
    { name: "Lime", hex: "#00FF00", rgb: "rgb(0, 255, 0)" },
    { name: "Navy", hex: "#000080", rgb: "rgb(0, 0, 128)" },
    { name: "Teal", hex: "#008080", rgb: "rgb(0, 128, 128)" },
    { name: "Maroon", hex: "#800000", rgb: "rgb(128, 0, 0)" },
    { name: "Olive", hex: "#808000", rgb: "rgb(128, 128, 0)" },
    { name: "Silver", hex: "#C0C0C0", rgb: "rgb(192, 192, 192)" },
    { name: "Gold", hex: "#FFD700", rgb: "rgb(255, 215, 0)" },
  ];

  const filteredColors = colorPalette.filter((color) => color.name.toLowerCase().includes(colorSearch.toLowerCase()));

  // Icon mapping function
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Pens & Pencils": FaPen,
      Bags: FaShoppingBag,
      Drinkware: FaWineGlass,
      "Exhibitions & Events": FaBriefcase,
      "Home & Living": FaHome,
      "Keyrings & Tools": FaBriefcase,
      "Health & Personal": FaHeart,
      "Office Stationery": FaBriefcase,
      "USB & Tech": FaBriefcase,
      "Leisure & Outdoors": FaGamepad,
      Print: FaPrint,
      "Food & Drink": FaUtensils,
      "Fun & Games": FaGamepad,
      "Corporate Wear": FaTshirt,
      Workwear: FaTshirt,
      Hospitality: FaUtensils,
      Activewear: FaTshirt,
      Brands: FaTag,
      Headwear: FaHatCowboy,
    };
    return iconMap[categoryName] || FaPen;
  };

  // When a subcategory is clicked, dispatch the filtering action.
  // The matchProduct action should be updated to handle a subCategory filter.
  const handleSubCategories = async (subCategory) => {
    // console.log("Clicked category:", subCategory);

    // Search for a product with a matching categorisation type name (ignoring case).
    const matchedProduct = products.find((product) => {
      const productTypeName = product.product?.categorisation?.product_type?.type_name;
      return productTypeName && productTypeName.toLowerCase() === subCategory.toLowerCase();
    });

    if (matchedProduct) {
      const categoryId = matchedProduct.product.categorisation.product_type.type_id;
      //   console.log("Matched category id:", categoryId);

      try {
        // Call fetchProducts with page=1, an empty sort option, and the found categoryId.
        const response = await fetchParamProducts(categoryId);
        // Adjust this extraction based on your API's response structure.
        const fetchedProducts = response.data?.data || response.data;
        // Update the local state with the fetched products.
        setFilterLocalProducts(fetchedProducts);
        // Update the active category label.
        setActiveFilterCategory(subCategory);
      } catch (error) {
        console.error("Error fetching products for category:", error);
      }
    } else {
      console.log("No matching product found for", subCategory);
    }
  };

  // useEffect(() => {
  //     handleSubCategories();
  // }, [setSideCatClicked])

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

  // Fetch the category products if they are not already loaded.
  // useEffect(() => {
  //     dispatch(fetchcategoryProduct());
  // }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
      {isMobile && (
        <button onClick={toggleSidebar} className="absolute px-2 py-1 text-white rounded top-4 bg-smallHeader">
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
          {/* Categories Section */}
          <div className="mb-6">
            <button
              onClick={toggleCategoriesSection}
              className="w-full flex items-center justify-between p-3 mb-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h2 className="text-lg font-bold text-gray-800">Categories</h2>
              <IoIosArrowDown className={`w-5 h-5 text-gray-600 transition-transform ${isCategoriesCollapsed ? "rotate-180" : ""}`} />
            </button>

            {!isCategoriesCollapsed && (
              <div className="space-y-2">
                {promotionalCategories.map((category, categoryIndex) => {
                  const IconComponent = getCategoryIcon(category.name);
                  const isExpanded = expandedCategories[category.id];

                  return (
                    <div key={category.id} className="mb-2">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isExpanded ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-800">{category.name}</span>
                        </div>
                        <IoIosArrowDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 ml-8 space-y-1">
                          {category.subTypes?.map((subType, subTypeIndex) => (
                            <div key={subTypeIndex} className="mb-3">
                              <h4 className="text-sm font-medium text-gray-600 mb-2">{subType.label}</h4>
                              <div className="space-y-1">
                                {subType.items?.map((item, itemIndex) => (
                                  <button
                                    key={item.id}
                                    onClick={() => handleSubCategories(item.name)}
                                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-blue-50 transition-colors ${
                                      activeFilterCategory === item.name
                                        ? "text-blue-600 font-medium bg-blue-50"
                                        : "text-gray-700 hover:text-blue-600"
                                    }`}
                                  >
                                    {item.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div className="border-t pt-6">
            <button
              onClick={togglePriceRangeSection}
              className="w-full flex items-center justify-between p-3 mb-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h2 className="text-lg font-bold text-gray-800">Price Range</h2>
              <IoIosArrowDown className={`w-5 h-5 text-gray-600 transition-transform ${isPriceRangeCollapsed ? "rotate-180" : ""}`} />
            </button>

            {!isPriceRangeCollapsed && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <button
                  onClick={applyPriceFilter}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <IoIosArrowDown className="w-4 h-4" />
                  <span>Apply Filter</span>
                </button>

                <button onClick={clearPriceFilter} className="w-full text-center text-blue-600 hover:text-blue-800 transition-colors">
                  All Prices
                </button>
              </div>
            )}
          </div>

          {/* Color Filter Section */}
          <div className="border-t pt-6">
            <button
              onClick={toggleColorFilterSection}
              className="w-full flex items-center justify-between p-3 mb-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h2 className="text-lg font-bold text-gray-800">Filter by Color</h2>
              <IoIosArrowDown className={`w-5 h-5 text-gray-600 transition-transform ${isColorFilterCollapsed ? "rotate-180" : ""}`} />
            </button>

            {!isColorFilterCollapsed && (
              <div className="space-y-4">
                {/* Color Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Colors</label>
                  <input
                    type="text"
                    value={colorSearch}
                    onChange={(e) => setColorSearch(e.target.value)}
                    placeholder="Search for colors..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Color Palette */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Colors</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {filteredColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorToggle(color.name)}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedColors.includes(color.name) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        title={color.name}
                      >
                        <div className="w-8 h-8 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs mt-1 text-gray-700 truncate w-full text-center">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Colors Display */}
                {selectedColors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Colors ({selectedColors.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((colorName) => {
                        const color = colorPalette.find((c) => c.name === colorName);
                        return (
                          <div
                            key={colorName}
                            className="flex items-center space-x-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1"
                          >
                            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color?.hex }} />
                            <span className="text-xs text-blue-700">{colorName}</span>
                            <button onClick={() => handleColorToggle(colorName)} className="text-blue-500 hover:text-blue-700 text-xs ml-1">
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={applyColorFilter}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <IoIosArrowDown className="w-4 h-4" />
                    <span>Apply Color Filter</span>
                  </button>

                  <button onClick={clearColorFilter} className="w-full text-center text-blue-600 hover:text-blue-800 transition-colors">
                    Clear All Colors
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpromotionalSidebar;
