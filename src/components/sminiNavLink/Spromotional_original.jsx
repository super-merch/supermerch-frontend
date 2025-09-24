import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IoClose, IoMenu, IoSearchOutline } from "react-icons/io5";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setSearchText, applyFilters } from "../../redux/slices/filterSlice";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";

import Skeleton from "react-loading-skeleton";
import noimage from "/noimage.png";

import { setSelectedBrands, setMinPrice, setMaxPrice, setSelectedCategory } from "../../redux/slices/filterSlice";
import { AppContext } from "../../context/AppContext";
import { matchProduct } from "@/redux/slices/categorySlice";
import SpromotionalSidebar from "./SpromotionalSidebar";
import { matchPromotionalProduct, setAllProducts } from "@/redux/slices/promotionalSlice";
import PromotionalPriceFilter from "../miniNavLinks/promotionalComps/PromotionalPriceFilter";
import PromotionalBrandFilter from "../miniNavLinks/promotionalComps/PromotionalBrandFilter";
import PromotionalPopularTags from "../miniNavLinks/promotionalComps/PromotionalPopularTags";
import { toast } from "react-toastify";
import { megaMenu, headWear } from "@/assets/assets";
import { megaMenuClothing } from "@/assets/asset";
import { addToFavourite } from "@/redux/slices/favouriteSlice";

// Utility function to calculate visible page buttons
const getPaginationButtons = (currentPage, totalPages, maxVisiblePages) => {
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
};

const getMenuArrayByCategoryName = (categoryName) => {
  if (!categoryName) return megaMenu;

  // Check if categoryName exists in headWear
  if (headWear.some((category) => category.name === categoryName)) {
    return headWear;
  }

  // Check if categoryName exists in megaMenuClothing
  if (megaMenuClothing.some((category) => category.name === categoryName)) {
    return megaMenuClothing;
  }

  // Default to megaMenu
  return megaMenu;
};

const Spromotional = () => {
  const priceCache = useRef(new Map());
  const [itemsPerPage] = useState(9);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Price filtering states - similar to SearchCard
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [totalFilteredPages, setTotalFilteredPages] = useState(0);
  const [fetchedPagesCount, setFetchedPagesCount] = useState(0);

  const [clicked, setClicked] = useState(false);
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const {
    products: contextProducts,
    skeletonLoading,
    categoryProducts,
    marginApi,
    fetchParamProducts,
    paramProducts,
    selectedParamCategoryId,
    setSelectedParamCategoryId,
    totalApiPages,
    setTotalApiPages,
    activeFilterCategory,
    setActiveFilterCategory,
    currentPage,
    setCurrentPage,
    v1categories,
    sidebarActiveCategory,
    setSidebarActiveCategory,
    fetchMultipleParamPages,
  } = useContext(AppContext);

  const { minPrice, maxPrice, activeFilters } = useSelector((state) => state.filters);

  const [productionIds, setProductionIds] = useState(new Set());
  const getAll24HourProduction = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/24hour/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch 24-hour production data");
      }

      const data = await response.json();
      if (data && data.data) {
        const ids = new Set(data.data.map((item) => item.meta.id));
        setProductionIds(ids);
      }
    } catch (error) {
      console.error("Error fetching 24-hour production data:", error);
    }
  };

  useEffect(() => {
    getAll24HourProduction();
  }, []);

  const [prioritizedData, setPrioritizedData] = useState([]);

  // Get filtered products from Redux
  const filteredProducts = useSelector((state) => state.promotionals.filteredPromotionalProducts);

  // Filter products that match the current category
  const matchedProducts = filteredProducts.filter((product) => {
    const typeId = product.product?.categorisation?.promodata_product_type?.type_id;
    if (!typeId) return false;
    return categoryProducts.some((category) => category.subTypes.some((sub) => sub.id === typeId));
  });

  // Function to fetch and filter products with multiple pages
  const fetchAndFilterProducts = async (categoryId, minPrice, maxPrice, sortOption) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      // Start with more pages initially for better results
      let maxPages = 3; // Increased from 1

      // Fetch products in parallel batches
      const fetchedProducts = await fetchMultipleParamPages(categoryId, maxPages, 100, sortOption);
      setFetchedPagesCount(maxPages);

      if (fetchedProducts && fetchedProducts.length > 0) {
        // Filter products by price range
        const filteredProducts = fetchedProducts.filter((product) => {
          const priceGroups = product.product?.prices?.price_groups || [];
          const basePrice = priceGroups.find((group) => group?.base_price) || {};
          const priceBreaks = basePrice.base_price?.price_breaks || [];
          const price = priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;
          return price >= minPrice && price <= maxPrice;
        });

        if (filteredProducts.length > 0) {
          // Remove duplicates based on product ID
          const uniqueProducts = Array.from(new Map(filteredProducts.map((product) => [product.meta?.id, product])).values());
          setAllFilteredProducts(uniqueProducts);
          setTotalFilteredPages(Math.ceil(uniqueProducts.length / itemsPerPage));
        } else {
          setFilterError("No products found in the specified price range");
        }
      } else {
        setFilterError("No products found in the specified price range");
      }
    } catch (error) {
      console.error("Error fetching and filtering products:", error);
      setFilterError("Error fetching products. Please try again.");
    } finally {
      setIsFiltering(false);
    }
  };

  // Check if price filter is active
  const isPriceFilterActive = minPrice > 0 || maxPrice < 1000;

  // Fetch more filtered products when needed
  const fetchMoreFilteredProducts = async (categoryId, minPrice, maxPrice, sortOption) => {
    if (fetchedPagesCount >= 5) return; // Limit to prevent infinite fetching

    try {
      const nextPage = fetchedPagesCount + 1;
      const newProducts = await fetchMultipleParamPages(categoryId, nextPage, 100, sortOption);

      if (newProducts && newProducts.length > 0) {
        const filteredNewProducts = newProducts.filter((product) => {
          const priceGroups = product.product?.prices?.price_groups || [];
          const basePrice = priceGroups.find((group) => group?.base_price) || {};
          const priceBreaks = basePrice.base_price?.price_breaks || [];
          const price = priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;
          return price >= minPrice && price <= maxPrice;
        });

        if (filteredNewProducts.length > 0) {
          const updatedProducts = [...allFilteredProducts, ...filteredNewProducts];
          const uniqueProducts = Array.from(new Map(updatedProducts.map((product) => [product.meta?.id, product])).values());
          setAllFilteredProducts(uniqueProducts);
          setTotalFilteredPages(Math.ceil(uniqueProducts.length / itemsPerPage));
          setFetchedPagesCount(nextPage);
        }
      }
    } catch (error) {
      console.error("Error fetching more filtered products:", error);
    }
  };

  // Auto-fetch more products when approaching the end
  useEffect(() => {
    if (isPriceFilterActive && allFilteredProducts.length > 0) {
      const currentIndex = (currentPage - 1) * itemsPerPage;
      const remainingProducts = allFilteredProducts.length - currentIndex;

      if (remainingProducts < itemsPerPage * 2 && fetchedPagesCount < 5) {
        fetchMoreFilteredProducts(selectedParamCategoryId, minPrice, maxPrice, sortOption);
      }
    }
  }, [currentPage, allFilteredProducts.length, isPriceFilterActive]);

  // Auto-fetch when price filter becomes active
  useEffect(() => {
    if (isPriceFilterActive && selectedParamCategoryId) {
      fetchAndFilterProducts(selectedParamCategoryId, minPrice, maxPrice, sortOption);
    }
  }, [isPriceFilterActive, selectedParamCategoryId, minPrice, maxPrice, sortOption]);

  const handleClearFilter = (filterType) => {
    if (filterType === "category") dispatch(setSelectedCategory("all"));
    if (filterType === "brand") dispatch(setSelectedBrands([]));
    if (filterType === "price") {
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));
      // Reset filtered products when clearing price filter
      setAllFilteredProducts([]);
      setTotalFilteredPages(0);
      setFilterError("");
    }
    dispatch(applyFilters());
  };

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1); // Reset to page 1 when sorting changes
  };

  const handleViewProduct = (productId, name) => {
    navigate(`/product/${name}`, { state: productId });
  };

  const [searchProductName, setSearchProductName] = useState("");
  const setSearchTextChanger = (e) => setSearchProductName(e.target.value);

  const { categoryProduct, status, error } = useSelector((state) => state.categoryProduct);

  // Fetch products when page or sort changes (only when no price filter is active)
  useEffect(() => {
    if (selectedParamCategoryId && !isPriceFilterActive) {
      fetchParamProducts(selectedParamCategoryId, currentPage).then((response) => {
        if (response && response.total_pages) {
          setTotalApiPages(response.total_pages);
        }
      });
    }
  }, [currentPage, sortOption, selectedParamCategoryId, isPriceFilterActive]);

  useEffect(() => {
    setFilterLocalProducts(filteredProducts);
  }, [filteredProducts]);

  useEffect(() => {
    if (contextProducts) {
      dispatch(setAllProducts(contextProducts));
    }
  }, [contextProducts, dispatch]);

  useEffect(() => {
    if (categoryProducts && contextProducts) {
      dispatch(
        matchPromotionalProduct({
          categoryProducts,
          checkAllPro: contextProducts,
        })
      );
    }
  }, [categoryProducts, contextProducts, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubCategories = (subCategory, categoryId, titleName, labelName) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedlabelName = encodeURIComponent(labelName);
    setSearchParams({
      category: categoryId,
      categoryName: encodedTitleName,
      label: encodedlabelName,
    });
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setSidebarActiveCategory(titleName);
  };

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlCategoryName = searchParams.get("categoryName");
    const decodedCategoryName = urlCategoryName ? decodeURIComponent(urlCategoryName) : "";
    const urlLabel = searchParams.get("label");
    const decodedLabel = urlLabel ? decodeURIComponent(urlLabel) : "";
    setSidebarActiveLabel(decodedLabel);

    if (urlCategory && decodedCategoryName) {
      setSelectedParamCategoryId(urlCategory);
      let foundSubCategory = null;

      const allMenus = [...megaMenu, ...megaMenuClothing, ...headWear];
      for (const category of allMenus) {
        for (const subTypeGroup of category.subTypes) {
          const matchingItem = subTypeGroup.items.find((item) => item.id === urlCategory);
          if (matchingItem) {
            foundSubCategory = matchingItem;
            break;
          }
        }
        if (foundSubCategory) break;
      }

      if (foundSubCategory) {
        setActiveFilterCategory(foundSubCategory.name);
        setSidebarActiveCategory(decodedCategoryName);
      }
    }
  }, [searchParams, setSelectedParamCategoryId, v1categories]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedParamCategoryId && !isPriceFilterActive) {
        try {
          await fetchParamProducts(selectedParamCategoryId, currentPage);
        } catch (error) {
          toast.error("Error fetching products for category");
        }
      }
    };
    fetchData();
  }, [selectedParamCategoryId, currentPage, isPriceFilterActive]);

  useEffect(() => {
    if (paramProducts && paramProducts.total_pages && !isPriceFilterActive) {
      setTotalApiPages(paramProducts.total_pages);
    }
  }, [paramProducts, isPriceFilterActive]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1025);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Helper function to get real price
  const getRealPrice = useCallback((product) => {
    const productId = product.meta?.id;
    if (priceCache.current.has(productId)) {
      return priceCache.current.get(productId);
    }

    const priceGroups = product.product?.prices?.price_groups || [];
    const basePrice = priceGroups.find((group) => group?.base_price) || {};
    const priceBreaks = basePrice.base_price?.price_breaks || [];
    const price = priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;

    // Cache the result
    priceCache.current.set(productId, price);
    return price;
  }, []);

  // Get current page products based on whether price filter is active
  const getCurrentPageProducts = () => {
    if (isPriceFilterActive) {
      // Use filtered products
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return allFilteredProducts.slice(startIndex, endIndex);
    } else {
      // Use regular API products with local search filter
      const apiProducts = paramProducts?.data || [];

      // Apply client-side sorting if requested
      const sortedProducts =
        sortOption === "lowToHigh" || sortOption === "highToLow"
          ? [...apiProducts].sort((a, b) => {
              const priceA = getRealPrice(a) || 0;
              const priceB = getRealPrice(b) || 0;
              return sortOption === "lowToHigh" ? priceA - priceB : priceB - priceA;
            })
          : apiProducts;

      // Then apply local name filter
      return sortedProducts.filter((product) => {
        const productName = (product.overview?.name || "").toLowerCase();
        return productName.includes(searchProductName.toLowerCase());
      });
    }
  };

  //get categoryName from searchParams
  const categoryName = searchParams.get("categoryName");

  // Check if any filters are active
  const hasActiveFilters = searchProductName.trim() !== "" || isPriceFilterActive;

  const currentPageProducts = getCurrentPageProducts();
  const currentPageFilteredCount = currentPageProducts.length;

  // Determine which pagination to use
  const paginationTotalPages = isPriceFilterActive ? totalFilteredPages : totalApiPages;

  // Calculate total count for display
  const getTotalCount = () => {
    if (isPriceFilterActive) {
      return allFilteredProducts.length;
    } else {
      return currentPageFilteredCount;
    }
  };

  const currentMenuArray = getMenuArrayByCategoryName(sidebarActiveCategory);
  const filteredCategories = sidebarActiveCategory
    ? currentMenuArray.filter((category) => category.name === sidebarActiveCategory)
    : currentMenuArray;

  const clothing = [
    { id: "B-01", name: "Accessories" },
    { id: "B-02", name: "Aprons" },
    { id: "B-03", name: "Dresses" },
    { id: "B-04", name: "Jackets" },
    { id: "B-05", name: "Pants" },
    { id: "B-06", name: "Polo Shirts" },
    { id: "B-07", name: "Shirts" },
    { id: "B-08", name: "Shorts" },
    { id: "B-09", name: "Sweaters" },
    { id: "B-10", name: "T-Shirts" },
    { id: "B-11", name: "Tank Tops" },
    { id: "B-12", name: "Vests" },
    { id: "B-13", name: "Workwear" },
    { id: "B-14", name: "Hoodies" },
    { id: "B-15", name: "Sweatshirts" },
    { id: "B-16", name: "Blazers" },
    { id: "B-17", name: "Cardigans" },
    { id: "B-18", name: "Tunics" },

    { id: "B-19", name: "Vests" },

    { id: "B-20", name: "Misc Clothing" },
  ];

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[22%]">
          <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
            {isMobile && (
              <button onClick={toggleSidebar} className="absolute px-2 py-1 text-white rounded top-4 bg-smallHeader">
                {isSidebarOpen ? <IoClose className="text-xl" /> : <IoMenu className="text-xl" />}
              </button>
            )}

            <div
              className={`transition-all ${
                isSidebarOpen
                  ? "lg:w-[100%] z-10 mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen md:shadow-lg shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4"
                  : "hidden"
              }`}
            >
              <div className="h-full pr-3 overflow-y-auto">
                <SpromotionalSidebar filterLocalProducts={filteredProducts} setFilterLocalProducts={setFilterLocalProducts} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4 ">
          <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
            <div className="flex items-center justify-between px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
              {/* {!isPriceFilterActive && (
                <>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full border-none outline-none"
                    value={searchProductName}
                    onChange={setSearchTextChanger}
                  />
                  <IoSearchOutline className="text-2xl" />
                </>
              )} */}
            </div>
            <div className="flex items-center gap-3">
              <p>Sort by:</p>
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center justify-between gap-2 px-4 py-3 border w-52 border-border2"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {sortOption === "lowToHigh" ? "Lowest to Highest" : sortOption === "highToLow" ? "Highest to Lowest" : "Relevency"}
                  <span className="">
                    {isDropdownOpen ? <IoIosArrowUp className="text-black" /> : <IoIosArrowDown className="text-black" />}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 z-10 w-full mt-2 bg-white border top-full border-border2">
                    <button
                      onClick={() => handleSortSelection("lowToHigh")}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${sortOption === "lowToHigh" ? "bg-gray-100" : ""}`}
                    >
                      Lowest to Highest
                    </button>
                    <button
                      onClick={() => handleSortSelection("highToLow")}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${sortOption === "highToLow" ? "bg-gray-100" : ""}`}
                    >
                      Highest to Lowest
                    </button>
                    <button
                      onClick={() => handleSortSelection("relevency")}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${sortOption === "highToLow" ? "bg-gray-100" : ""}`}
                    >
                      Relenency
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between px-5 py-3 mt-4 rounded-md bg-activeFilter">
            <div className="flex flex-wrap items-center gap-4">
              {activeFilters.category && activeFilters.category !== "all" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
                  <span className="text-sm">{activeFilters.category}</span>
                  <button onClick={() => handleClearFilter("category")} className="text-red-500">
                    ×
                  </button>
                </div>
              )}
              {activeFilters.brands && activeFilters.brands.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
                  <span className="text-sm">{activeFilters.brands.join(", ")}</span>
                  <button onClick={() => handleClearFilter("brand")} className="text-red-500">
                    ×
                  </button>
                </div>
              )}
              {isPriceFilterActive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
                  <span className="text-sm">
                    ${minPrice} - ${maxPrice}
                  </span>
                  <button onClick={() => handleClearFilter("price")} className="text-red-500">
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 pt-3 lg:pt-0 md:pt-0 sm:pt-0">
              <span className="font-semibold text-brand">{!skeletonLoading && !isFiltering && getTotalCount()}</span>
              <p className="">
                {skeletonLoading || isFiltering
                  ? "Loading..."
                  : `Results found${isPriceFilterActive ? ` (Price filtered)` : hasActiveFilters ? ` on page ${currentPage}` : ""}`}
                {isFiltering && "Please wait a while..."}
              </p>
            </div>
          </div>

          {/* {filterError && (
            <div className="flex items-center justify-center p-4 mt-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{filterError}</p>
            </div>
          )} */}

          <div
            className={`${
              skeletonLoading || isFiltering
                ? "grid grid-cols-1 gap-6 mt-4 md:mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1"
                : ""
            }`}
          >
            {skeletonLoading || isFiltering ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <div key={index} className="relative p-4 border rounded-lg shadow-md border-border2">
                  <Skeleton height={200} className="rounded-md" />
                  <div className="p-4">
                    <Skeleton height={20} width={120} className="rounded" />
                    <Skeleton height={15} width={80} className="mt-2 rounded" />
                    <Skeleton height={25} width={100} className="mt-3 rounded" />
                    <Skeleton height={15} width={60} className="mt-2 rounded" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton height={20} width={80} className="rounded" />
                      <Skeleton height={20} width={80} className="rounded" />
                    </div>
                    <div className="flex justify-between gap-1 mt-6 mb-2">
                      <Skeleton circle height={40} width={40} />
                      <Skeleton height={40} width={120} className="rounded" />
                      <Skeleton circle height={40} width={40} />
                    </div>
                  </div>
                </div>
              ))
            ) : currentPageProducts.length > 0 ? (
              <div className="grid justify-center grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {currentPageProducts.map((product) => {
                  const priceGroups = product.product?.prices?.price_groups || [];
                  const basePrice = priceGroups.find((group) => group?.base_price) || {};
                  const priceBreaks = basePrice.base_price?.price_breaks || [];

                  // Get an array of prices from priceBreaks (these are already discounted)
                  const prices = priceBreaks.map((breakItem) => breakItem.price);
                  // .filter((price) => price !== undefined);

                  // 1) compute raw min/max
                  let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  // 2) pull margin info (guarding against undefined)
                  const marginInfo = product.product?.prices?.margin || {};
                  const baseMarginPrice = marginInfo.base_margin_price || 0;

                  // 3) apply margin to both min and max
                  const finalMinPrice = minPrice + baseMarginPrice;
                  const finalMaxPrice = maxPrice + baseMarginPrice;

                  // 4) format for display
                  const formattedMinPrice = finalMinPrice.toFixed(2);
                  const formattedMaxPrice = finalMaxPrice.toFixed(2);

                  // 5) determine display logic
                  const shouldShowRange = finalMinPrice !== finalMaxPrice;
                  const displayPrice = shouldShowRange ? `$${formattedMinPrice} - $${formattedMaxPrice}` : `$${formattedMinPrice}`;

                  // Get discount percentage from product's discount info
                  const discountPct = product.discountInfo?.discount || 0;
                  const isGlobalDiscount = product.discountInfo?.isGlobal || false;

                  return (
                    <div
                      key={product.meta.id}
                      className="relative p-4 border rounded-lg shadow-md border-border2 hover:shadow-lg transition-shadow duration-300"
                      onMouseEnter={() => setCardHover(product.meta.id)}
                      onMouseLeave={() => setCardHover(null)}
                    >
                      <div className="relative">
                        <img
                          src={product.overview.hero_image || noimage}
                          alt={product.overview.name || "Product Image"}
                          className="w-full h-48 object-cover rounded-md"
                        />
                        {discountPct > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {discountPct}% OFF
                          </div>
                        )}
                        {productionIds.has(product.meta.id) && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            24H
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.overview.name || "No Name"}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.overview.description || "No description available"}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-brand">{displayPrice}</span>
                          {isGlobalDiscount && <span className="text-sm text-green-600 font-medium">Global Discount</span>}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>MOQ: {product.overview.moq || "N/A"}</span>
                          <span>Lead Time: {product.overview.lead_time || "N/A"}</span>
                        </div>

                        <div className="flex justify-between gap-1 mt-6 mb-2">
                          <button
                            onClick={() => dispatch(addToFavourite(product))}
                            className="flex items-center justify-center w-10 h-10 border rounded-full hover:bg-red-50 transition-colors"
                          >
                            {favSet.has(product.meta.id) ? (
                              <IoIosHeart className="text-xl text-red-500" />
                            ) : (
                              <CiHeart className="text-xl" />
                            )}
                          </button>
                          <button
                            onClick={() => handleViewProduct(product.meta.id, product.overview.name)}
                            className="flex items-center justify-center w-full h-10 bg-brand text-white rounded-md hover:bg-opacity-90 transition-colors"
                          >
                            View Product
                          </button>
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="flex items-center justify-center w-10 h-10 border rounded-full hover:bg-blue-50 transition-colors"
                          >
                            <AiOutlineEye className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="pt-10 text-xl text-center text-red-900">
                  No products found. Explore our categories or refine your search to discover more options
                </p>
              </div>
            )}
          </div>

          {paginationTotalPages > 1 && (
            <div className="flex items-center justify-center mt-16 space-x-2 pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 border rounded-full"
              >
                <IoMdArrowBack className="text-xl" />
              </button>

              {getPaginationButtons(currentPage, paginationTotalPages, maxVisiblePages).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center w-10 h-10 border rounded-full ${
                    currentPage === page ? "bg-brand text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationTotalPages))}
                disabled={currentPage === paginationTotalPages}
                className="flex items-center justify-center w-10 h-10 border rounded-full"
              >
                <IoMdArrowForward className="text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-brand mb-2">{selectedProduct.overview.name || "No Name"}</h2>

                {selectedProduct.overview.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedProduct.overview.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Spromotional;
