import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { CiHeart } from "react-icons/ci";

import Skeleton from "react-loading-skeleton";
import noimage from "/noimage.png";

import {
  setSelectedBrands,
  setMinPrice,
  setMaxPrice,
  setSelectedCategory,
} from "../../redux/slices/filterSlice";
import { AppContext } from "../../context/AppContext";
import { matchProduct } from "@/redux/slices/categorySlice";
import SpromotionalSidebar from "./SpromotionalSidebar";
import {
  matchPromotionalProduct,
  setAllProducts,
} from "@/redux/slices/promotionalSlice";
import PromotionalPriceFilter from "../miniNavLinks/promotionalComps/PromotionalPriceFilter";
import PromotionalBrandFilter from "../miniNavLinks/promotionalComps/PromotionalBrandFilter";
import PromotionalPopularTags from "../miniNavLinks/promotionalComps/PromotionalPopularTags";
import { toast } from "react-toastify";
import { megaMenu, megaMenuClothing, headWear } from "@/assets/assets";
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
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const {
    fetchProducts,
    products: contextProducts,
    skeletonLoading,
    discountPromo,
    setDiscountPromo,
    categoryProducts,
    filterLocalProducts,
    setFilterLocalProducts,
    marginApi,
    fetchParamProducts,
    paramProducts,
    setParamProducts,
    selectedParamCategoryId,
    setSelectedParamCategoryId,
    totalApiPages,
    setTotalApiPages,
    activeFilterCategory,
    setActiveFilterCategory,
    currentPage,
    setCurrentPage,
    v1categories,
    setV1categories,
    sidebarActiveCategory,
    setSidebarActiveCategory,
    sidebarActiveLabel,
    setSidebarActiveLabel,
    fetchMultipleParamPages, // We'll need to create this function
  } = useContext(AppContext);

  const { searchText, activeFilters, filteredCount, minPrice, maxPrice } =
    useSelector((state) => state.filters);

  // Check if price filters are active
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;

  const filteredProducts = useSelector(
    (state) => state.promotionals.filteredPromotionalProducts
  );

  const matchedProducts = filteredProducts.filter((product) => {
    const typeId =
      product.product?.categorisation?.promodata_product_type?.type_id;
    if (!typeId) return false;
    return categoryProducts.some((category) =>
      category.subTypes.some((sub) => sub.id === typeId)
    );
  });

  // Helper function to get real price
  const getRealPrice = useCallback((product) => {
    const productId = product.meta?.id;
    if (priceCache.current.has(productId)) {
      return priceCache.current.get(productId);
    }

    const priceGroups = product.product?.prices?.price_groups || [];
    const basePrice = priceGroups.find((group) => group?.base_price) || {};
    const priceBreaks = basePrice.base_price?.price_breaks || [];
    const price =
      priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;

    // Cache the result
    priceCache.current.set(productId, price);
    return price;
  }, []);

  // Function to fetch and filter products with multiple pages
  const fetchAndFilterProducts = async (
    categoryId,
    minPrice,
    maxPrice,
    sortOption
  ) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      // Start with more pages initially for better results
      let maxPages = 3; // Increased from 1

      // Fetch products in parallel batches
      const fetchedProducts = await fetchMultipleParamPages(
        categoryId,
        maxPages,
        100,
        sortOption
      );
      setFetchedPagesCount(maxPages);

      if (fetchedProducts && fetchedProducts.length > 0) {
        // Optimize filtering with early exit conditions
        const filteredProducts = fetchedProducts.filter((product) => {
          const price = getRealPrice(product);
          // Early exit if price is 0 or invalid
          if (price <= 0) return false;
          return price >= minPrice && price <= maxPrice;
        });

        if (filteredProducts.length > 0) {
          // Remove duplicates more efficiently using Map
          const uniqueProducts = Array.from(
            new Map(
              filteredProducts.map((product) => [product.meta?.id, product])
            ).values()
          );

          // Apply sorting only once at the end
          const sortedProducts = sortOption
            ? [...uniqueProducts].sort((a, b) => {
                const priceA = getRealPrice(a);
                const priceB = getRealPrice(b);
                return sortOption === "lowToHigh"
                  ? priceA - priceB
                  : priceB - priceA;
              })
            : uniqueProducts;

          setAllFilteredProducts(sortedProducts);
          setTotalFilteredPages(
            Math.ceil(sortedProducts.length / itemsPerPage)
          );
        } else {
          setFilterError("No products found in the specified price range");
        }
      } else {
        setFilterError("No products found in the specified price range");
      }
    } catch (error) {
      console.error("Error filtering products:", error);
      setFilterError("Error fetching filtered products. Please try again.");
    } finally {
      setIsFiltering(false);
    }
  };

  // Function to fetch more products when user is near the end
  const fetchMoreFilteredProducts = async () => {
    if (isFiltering || !selectedParamCategoryId) return;

    setIsFiltering(true);

    try {
      const startPage = fetchedPagesCount + 1;
      const pagesToFetch = 3; // Increased from 2

      // Fetch pages in parallel
      const additionalProducts = await fetchMultipleParamPages(
        selectedParamCategoryId,
        pagesToFetch,
        100,
        sortOption,
        startPage
      );

      if (additionalProducts && additionalProducts.length > 0) {
        // Use Set for faster duplicate checking
        const existingIds = new Set(allFilteredProducts.map((p) => p.meta?.id));

        const newFilteredProducts = additionalProducts.filter((product) => {
          const price = getRealPrice(product);
          const isInPriceRange =
            price >= minPrice && price <= maxPrice && price > 0;
          const notDuplicate = !existingIds.has(product.meta?.id);
          return isInPriceRange && notDuplicate;
        });

        if (newFilteredProducts.length > 0) {
          // Sort only new products, then merge
          const sortedNewProducts = sortOption
            ? [...newFilteredProducts].sort((a, b) => {
                const priceA = getRealPrice(a);
                const priceB = getRealPrice(b);
                return sortOption === "lowToHigh"
                  ? priceA - priceB
                  : priceB - priceA;
              })
            : newFilteredProducts;

          const updatedProducts = [
            ...allFilteredProducts,
            ...sortedNewProducts,
          ];
          setAllFilteredProducts(updatedProducts);
          setTotalFilteredPages(
            Math.ceil(updatedProducts.length / itemsPerPage)
          );
        }

        setFetchedPagesCount((prev) => prev + pagesToFetch);
      }
    } catch (error) {
      console.error("Error fetching more products:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Check if user is near the end and needs more products
  useEffect(() => {
    if (isPriceFilterActive && allFilteredProducts.length > 0) {
      const isNearEnd = currentPage >= totalFilteredPages - 1;
      const hasRoomForMore = allFilteredProducts.length < 200;

      if (isNearEnd && hasRoomForMore) {
        fetchMoreFilteredProducts();
      }
    }
  }, [currentPage, isPriceFilterActive, totalFilteredPages]);

  // Trigger price filtering when filters change
  useEffect(() => {
    if (isPriceFilterActive && selectedParamCategoryId) {
      fetchAndFilterProducts(
        selectedParamCategoryId,
        minPrice,
        maxPrice,
        sortOption
      );
    } else {
      // Reset filtered products when no price filter is active
      setAllFilteredProducts([]);
      setTotalFilteredPages(0);
      setFilterError("");
      setFetchedPagesCount(0);
    }
  }, [minPrice, maxPrice, selectedParamCategoryId, sortOption]);

  useEffect(() => {
    if (contextProducts) {
      dispatch(setAllProducts(contextProducts));
    }
  }, [contextProducts, dispatch]);

  useEffect(() => {
    dispatch(applyFilters());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "promotional" });
  };

  const [searchProductName, setSearchProductName] = useState("");
  const setSearchTextChanger = (e) => setSearchProductName(e.target.value);

  const { categoryProduct, status, error } = useSelector(
    (state) => state.categoryProduct
  );

  // Fetch products when page or sort changes (only when no price filter is active)
  useEffect(() => {
    if (selectedParamCategoryId && !isPriceFilterActive) {
      fetchParamProducts(selectedParamCategoryId, currentPage).then(
        (response) => {
          if (response && response.total_pages) {
            setTotalApiPages(response.total_pages);
          }
        }
      );
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSubCategories = (
    subCategory,
    categoryId,
    titleName,
    labelName
  ) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedlabelName = encodeURIComponent(labelName);
    setSearchParams({
      categoryName: encodedTitleName,
      category: categoryId,
      label: encodedlabelName,
    });
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlCategoryName = searchParams.get("categoryName");
    const decodedCategoryName = urlCategoryName
      ? decodeURIComponent(urlCategoryName)
      : "";
    const urlLabel = searchParams.get("label");
    const decodedLabel = urlLabel ? decodeURIComponent(urlLabel) : "";
    setSidebarActiveLabel(decodedLabel);

    if (urlCategory && decodedCategoryName) {
      setSelectedParamCategoryId(urlCategory);
      let foundSubCategory = null;

      const allMenus = [...megaMenu, ...megaMenuClothing, ...headWear];
      for (const category of allMenus) {
        for (const subTypeGroup of category.subTypes) {
          const matchingItem = subTypeGroup.items.find(
            (item) => item.id === urlCategory
          );
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

  const currentMenuArray = getMenuArrayByCategoryName(sidebarActiveCategory);
  const filteredCategories = sidebarActiveCategory
    ? currentMenuArray.filter(
        (category) => category.name === sidebarActiveCategory
      )
    : currentMenuArray;

  // Get current page products based on whether price filter is active
  const getCurrentPageProducts = () => {
    if (isPriceFilterActive) {
      // Use filtered products
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return allFilteredProducts.slice(startIndex, endIndex);
    } else {
      // Use regular API products with local search filter
      const apiProducts = paramProducts.data || [];
      return apiProducts.filter((product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        const realPrice =
          priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
            ? priceBreaks[0].price
            : "0";

        const productName = product.overview.name || "";
        return (
          realPrice !== "0" &&
          productName.toLowerCase().includes(searchProductName.toLowerCase())
        );
      });
    }
  };
  //get categoryName from searchParams
  const categoryName = searchParams.get("categoryName");

  // Check if any filters are active
  const hasActiveFilters =
    searchProductName.trim() !== "" || isPriceFilterActive;

  const currentPageProducts = getCurrentPageProducts();
  const currentPageFilteredCount = currentPageProducts.length;

  // Determine which pagination to use
  const paginationTotalPages = isPriceFilterActive
    ? totalFilteredPages
    : totalApiPages;

  // Calculate total count for display
  const getTotalCount = () => {
    if (isPriceFilterActive) {
      return allFilteredProducts.length;
    } else if (searchProductName.trim() !== "") {
      return currentPageFilteredCount;
    } else {
      return paramProducts.item_count || 0;
    }
  };

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[22%]">
          <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute px-2 py-1 text-white rounded top-4 bg-smallHeader"
              >
                {isSidebarOpen ? (
                  <IoClose className="text-xl" />
                ) : (
                  <IoMenu className="text-xl" />
                )}
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
                <div className="pb-6 border-b-2">
                  {filteredCategories.map((category) => (
                    <div key={category.id}>
                      <p className="text-lg font-semibold text-blue-500">
                        {category.name}
                      </p>
                      <ul>
                        {category.subTypes
                          .filter(
                            (group) =>
                              !sidebarActiveLabel ||
                              group.label === sidebarActiveLabel
                          )
                          .map((group) => (
                            <li key={group.label}>
                              <p className="mt-2 ml-2 text-base font-semibold">
                                {group.label}
                              </p>
                              <ul>
                                {group?.items?.map((item) => (
                                  <li
                                    key={item.id}
                                    className="hover:underline ml-4"
                                  >
                                    <button
                                      onClick={() =>
                                        handleSubCategories(
                                          item.name,
                                          item.id,
                                          category.name,
                                          group.label
                                        )
                                      }
                                      className={`font-medium text-[13px] block ${
                                        activeFilterCategory === item.name
                                          ? "text-blue-500"
                                          : ""
                                      }`}
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <PromotionalPriceFilter />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4 mt-16">
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
                  {sortOption === "lowToHigh"
                    ? "Lowest to Highest"
                    : sortOption === "highToLow"
                    ? "Highest to Lowest"
                    : "Lowest to Highest"}
                  <span className="">
                    {isDropdownOpen ? (
                      <IoIosArrowUp className="text-black" />
                    ) : (
                      <IoIosArrowDown className="text-black" />
                    )}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 z-10 w-full mt-2 bg-white border top-full border-border2">
                    <button
                      onClick={() => handleSortSelection("lowToHigh")}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                        sortOption === "lowToHigh" ? "bg-gray-100" : ""
                      }`}
                    >
                      Lowest to Highest
                    </button>
                    <button
                      onClick={() => handleSortSelection("highToLow")}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                        sortOption === "highToLow" ? "bg-gray-100" : ""
                      }`}
                    >
                      Highest to Lowest
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between px-5 py-3 mt-4 rounded-md bg-activeFilter">
            <div className="flex flex-wrap items-center gap-4">
              {activeFilters.category && activeFilters.category !== "all" && (
                <div className="filter-item">
                  <span className="text-sm">{activeFilters.category}</span>
                  <button
                    className="px-2 text-lg"
                    onClick={() => handleClearFilter("category")}
                  >
                    x
                  </button>
                </div>
              )}

              
              
              {activeFilters.brands && activeFilters.brands.length > 0 && (
                <div className="filter-item">
                  <span className="text-sm">
                    {activeFilters.brands.join(", ")}
                  </span>
                  <button
                    className="px-2 text-lg"
                    onClick={() => handleClearFilter("brand")}
                  >
                    x
                  </button>
                </div>
              )}
              {activeFilters.price &&
                activeFilters.price.length === 2 &&
                (activeFilters.price[0] !== 0 ||
                  activeFilters.price[1] !== 1000) && (
                  <div className="filter-item">
                    <span className="text-sm">
                      ${activeFilters.price[0]} - ${activeFilters.price[1]}
                    </span>
                    <button
                      className="px-2 text-lg"
                      onClick={() => handleClearFilter("price")}
                    >
                      x
                    </button>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-1 pt-3 lg:pt-0 md:pt-0 sm:pt-0">
              <span className="font-semibold text-brand">
                {!skeletonLoading && !isFiltering && getTotalCount()}
              </span>
              <p className="">
                {skeletonLoading || isFiltering
                  ? "Loading..."
                  : `Results found${
                      isPriceFilterActive
                        ? ` (Price filtered)`
                        : hasActiveFilters
                        ? ` on page ${currentPage}`
                        : ""
                    }`}
                {isFiltering && "Please wait a while..."}
              </p>
            </div>
          </div>

          {filterError && (
            <div className="flex items-center justify-center p-4 mt-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{filterError}</p>
            </div>
          )}

          <div
            className={`${
              skeletonLoading || isFiltering
                ? "grid grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1"
                : ""
            }`}
          >
            {skeletonLoading || isFiltering ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="relative p-4 border rounded-lg shadow-md border-border2"
                >
                  <Skeleton height={200} className="rounded-md" />
                  <div className="p-4">
                    <Skeleton height={20} width={120} className="rounded" />
                    <Skeleton height={15} width={80} className="mt-2 rounded" />
                    <Skeleton
                      height={25}
                      width={100}
                      className="mt-3 rounded"
                    />
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
                {currentPageProducts
                  .filter((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];
                    return (
                      priceBreaks.length > 0 &&
                      priceBreaks[0]?.price !== undefined
                    );
                  })
                  .map((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];

                    // Get an array of prices from priceBreaks (these are already discounted)
                    const prices = priceBreaks
                      .map((breakItem) => breakItem.price)
                      .filter((price) => price !== undefined);

                    // 1) compute raw min/max
                    let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                    let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                    // 2) pull margin info (guarding against undefined)
                    const productId = product.meta.id;
                    const marginEntry = marginApi[productId] || {};
                    const marginFlat =
                      typeof marginEntry.marginFlat === "number"
                        ? marginEntry.marginFlat
                        : 0;
                    const baseMarginPrice =
                      typeof marginEntry.baseMarginPrice === "number"
                        ? marginEntry.baseMarginPrice
                        : 0;

                    // 3) apply the flat margin to both ends of the range
                    minPrice += marginFlat;
                    maxPrice += marginFlat;

                    // Get discount percentage from product's discount info
                    const discountPct = product.discountInfo?.discount || 0;
                    const isGlobalDiscount =
                      product.discountInfo?.isGlobal || false;

                    return (
                      <div
                        key={productId}
                        className="relative border border-border2 cursor-pointer max-h-[280px] sm:max-h-[350px] h-full group"
                        onClick={() => handleViewProduct(product.meta.id)}
                      >
                        {/* Show discount badge */}
                        {discountPct > 0 && (
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-red-500 rounded">
                              {discountPct}%
                            </span>
                            {isGlobalDiscount && (
                              <span className="block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-orange-500 rounded mt-1">
                                Sale
                              </span>
                            )}
                          </div>
                        )}

                        {/* Favourite button - moved to top-right of image */}
                        <div className="absolute top-2 right-2 z-20">
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              dispatch(addToFavourite(product));
                              toast.success("Product added to favourites");
                            }}
                            className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                          >
                            <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                          </div>
                        </div>

                        {/* Enlarged image section */}
                        <div className="max-h-[65%] sm:max-h-[75%] h-full border-b overflow-hidden relative">
                          <img
                            src={
                              product.overview.hero_image
                                ? product.overview.hero_image
                                : noimage
                            }
                            alt=""
                            className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>

                        {/* Color swatches */}
                        <div className="absolute w-18 grid grid-cols-2 gap-1 top-[2%] left-[5%] z-10">
                          {product?.product?.colours?.list.length > 0 &&
                            product?.product?.colours?.list
                              .slice(0, 15)
                              .flatMap((colorObj, index) =>
                                colorObj.colours.map((color, subIndex) => (
                                  <div
                                    key={`${index}-${subIndex}`}
                                    style={{
                                      backgroundColor:
                                        colorObj.swatch?.[subIndex] ||
                                        color
                                          .toLowerCase()
                                          .replace("dark blue", "#1e3a8a")
                                          .replace("light blue", "#3b82f6")
                                          .replace("navy blue", "#1e40af")
                                          .replace("royal blue", "#2563eb")
                                          .replace("sky blue", "#0ea5e9")
                                          .replace("gunmetal", "#2a3439")
                                          .replace("dark grey", "#4b5563")
                                          .replace("light grey", "#9ca3af")
                                          .replace("dark gray", "#4b5563")
                                          .replace("light gray", "#9ca3af")
                                          .replace("charcoal", "#374151")
                                          .replace("lime green", "#65a30d")
                                          .replace("forest green", "#166534")
                                          .replace("dark green", "#15803d")
                                          .replace("light green", "#16a34a")
                                          .replace("bright green", "#22c55e")
                                          .replace("dark red", "#dc2626")
                                          .replace("bright red", "#ef4444")
                                          .replace("wine red", "#991b1b")
                                          .replace("burgundy", "#7f1d1d")
                                          .replace("hot pink", "#ec4899")
                                          .replace("bright pink", "#f472b6")
                                          .replace("light pink", "#f9a8d4")
                                          .replace("dark pink", "#be185d")
                                          .replace("bright orange", "#f97316")
                                          .replace("dark orange", "#ea580c")
                                          .replace("bright yellow", "#eab308")
                                          .replace("golden yellow", "#f59e0b")
                                          .replace("dark yellow", "#ca8a04")
                                          .replace("cream", "#fef3c7")
                                          .replace("beige", "#f5f5dc")
                                          .replace("tan", "#d2b48c")
                                          .replace("brown", "#92400e")
                                          .replace("dark brown", "#78350f")
                                          .replace("light brown", "#a3a3a3")
                                          .replace("maroon", "#7f1d1d")
                                          .replace("teal", "#0d9488")
                                          .replace("turquoise", "#06b6d4")
                                          .replace("aqua", "#22d3ee")
                                          .replace("mint", "#10b981")
                                          .replace("lavender", "#c084fc")
                                          .replace("violet", "#8b5cf6")
                                          .replace("indigo", "#6366f1")
                                          .replace("slate", "#64748b")
                                          .replace("stone", "#78716c")
                                          .replace("zinc", "#71717a")
                                          .replace("neutral", "#737373")
                                          .replace("rose", "#f43f5e")
                                          .replace("emerald", "#10b981")
                                          .replace("cyan", "#06b6d4")
                                          .replace("amber", "#f59e0b")
                                          .replace("lime", "#84cc16")
                                          .replace("fuchsia", "#d946ef")
                                          .replace(" ", "") || // remove remaining spaces
                                        color.toLowerCase(),
                                    }}
                                    className="w-4 h-4 rounded-sm border border-slate-900"
                                  />
                                ))
                              )}
                        </div>

                        {/* Reduced content area */}
                        <div className="p-2 ">
                          <div className="text-center">
                            <h2 className="text-sm sm:text-lg font-semibold text-brand leading-tight ">
                              {product.overview.name &&
                              product.overview.name.length > 20
                                ? product.overview.name.slice(0, 20) + "..."
                                : product.overview.name || "No Name"}
                            </h2>

                            {/* Minimum quantity */}
                            <p className="text-xs text-gray-500 ">
                              {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}{" "}
                              minimum quantity
                            </p>

                            {/* Updated Price display with better font */}
                            <div className="">
                              <h2 className="text-base sm:text-lg font-bold text-heading ">
                                From $
                                {minPrice === maxPrice ? (
                                  <span>{minPrice.toFixed(2)}</span>
                                ) : (
                                  <span>{minPrice.toFixed(2)}</span>
                                )}
                              </h2>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="pt-10 text-xl text-center text-red-900">
                  Please search for other products or adjust your filters.
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

              {getPaginationButtons(
                currentPage,
                paginationTotalPages,
                maxVisiblePages
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 border rounded-full flex items-center justify-center ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, paginationTotalPages)
                  )
                }
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
                <h2 className="text-2xl font-bold text-brand mb-2">
                  {selectedProduct.overview.name || "No Name"}
                </h2>

                {selectedProduct.overview.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedProduct.overview.description}
                  </p>
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
