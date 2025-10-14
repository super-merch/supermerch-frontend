import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoIosHeart,
  IoMdArrowBack,
  IoMdArrowForward,
} from "react-icons/io";
import { IoClose, IoMenu } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";
import Sidebar from "./Sidebar";
import noimage from "/noimage.png";
import { slugify } from "@/utils/utils";

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

const AustraliaProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("lowToHigh");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);
  const [totalApiPages, setTotalApiPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Simplified state - remove local products state since we use context
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  // Get Redux filter state
  const { minPrice, maxPrice } = useSelector((state) => state.filters);

  // Check if price filters are active
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
      const pageType = getPageTypeFromRoute(location.pathname);

  const { marginApi, backendUrl, fetchAustraliaProducts, fetchAllAustraliaProducts, australia, skeletonLoading,totalAustraliaPages, productionIds, australiaIds } = useContext(AppContext);

  // Helper function to get real price with caching
  const priceCache = useRef(new Map());

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

  // Clear price filter handler
  const handleClearPriceFilter = () => {
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    setCurrentPage(1);
    dispatch(applyFilters());
  };

  // Function to fetch Australia products with pagination
  const fetchAustraliaProductsPaginated = async (page = 1, sortOption = "") => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchAustraliaProducts(page, itemsPerPage, sortOption);

      const validProducts = data.data.filter((product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        return (
          priceBreaks.length > 0 &&
          priceBreaks[0]?.price !== undefined &&
          priceBreaks[0]?.price > 0
        );
      });

      setAllProducts(validProducts);
      setTotalApiPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Australia products:", error);
      setError("Error fetching Australia products. Please try again.");
      setIsLoading(false);
    }
  };

  // Function to fetch and filter ALL Australia products with price range
  const fetchAndFilterAllAustraliaProducts = async (
    minPrice,
    maxPrice,
    sortOption
  ) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      // Fetch all Australia products for filtering
      const data = await fetchAllAustraliaProducts(sortOption);

      if (data && data.length > 0) {
        const validProducts = data
          .filter((item) => {
            if (!item.product || item.error) return false;
            const product = item.product;
            const price = getRealPrice(product);
            if (price <= 0) return false;
            return price >= minPrice && price <= maxPrice;
          })
          .map((item) => item.product);

        if (validProducts.length > 0) {
          const uniqueProducts = Array.from(
            new Map(
              validProducts.map((product) => [product.meta?.id, product])
            ).values()
          );

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
          setFilterError("No products found in the specified price range.");
        }
      } else {
        setFilterError("No products found in the specified price range");
      }
      return [];
    } catch (error) {
      console.error("Error filtering Australia products:", error);
      setError("Error fetching filtered products. Please try again.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Handle price filter changes
  useEffect(() => {
    if (isPriceFilterActive) {
      setCurrentPage(1);
      fetchAndFilterAllAustraliaProducts(minPrice, maxPrice, sortOption);
    } else {
      // Reset to normal pagination when no price filter is active
      setCurrentPage(1);
      fetchAustraliaProductsPaginated(1, sortOption);
    }
  }, [minPrice, maxPrice, isPriceFilterActive]);

  // Initial load and sort changes
  useEffect(() => {
    if (!isPriceFilterActive) {
      setCurrentPage(1);
      fetchAustraliaProductsPaginated(1, sortOption);
    }
  }, [sortOption]);
  useEffect(()=>{
    fetchAustraliaProductsPaginated(currentPage, sortOption);
  },[currentPage])

  // Apply sorting to active products
  const getSortedProducts = () => {
    const activeProducts = getActiveProducts();
    if (!sortOption || isPriceFilterActive) return activeProducts;

    return [...activeProducts].sort((a, b) => {
      const getRealPriceForSort = (product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];

        const prices = priceBreaks
          .map((breakItem) => breakItem.price)
          .filter((price) => price !== undefined);

        let minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        const productId = product.meta.id;
        const marginEntry = marginApi[productId] || {};
        const marginFlat =
          typeof marginEntry.marginFlat === "number"
            ? marginEntry.marginFlat
            : 0;

        return minPrice + marginFlat;
      };

      const priceA = getRealPriceForSort(a);
      const priceB = getRealPriceForSort(b);

      if (sortOption === "lowToHigh") return priceA - priceB;
      if (sortOption === "highToLow") return priceB - priceA;
      return 0;
    });
  };

  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  // Get current products based on mode
  const getCurrentProducts = () => {
    // For price filtering, we need to handle locally (since backend doesn't support price filtering)
    if (isPriceFilterActive) {
      // This would need to be implemented with local filtering of all products
      // For now, return empty array since we don't have all products locally
      return [];
    }
    
    // For normal pagination, use products from context
    return australia || [];
  };

  // Calculate total pages based on current mode
  const getTotalPages = () => {
    if (isPriceFilterActive) {
      // For price filtering, we'd need to calculate based on filtered products
      // Since we don't have all products locally, return 1 for now
      return 1;
    }
    return totalAustraliaPages || 1;
  };

  // Calculate total count for display
  const getTotalCount = () => {
    if (isPriceFilterActive) {
      // For price filtering, we'd need the count of filtered products
      return 0; // Placeholder
    }
    
    // This should come from your API response - you might need to add it to context
    return australiaIds?.size || 0;
  };

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

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };



  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`, {
      state: productId,
    });
  };

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

  const currentProducts = getCurrentProducts();
  const totalPages = getTotalPages();
  const showSkeleton = isLoading || skeletonLoading;

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        {/* Price Filter Sidebar */}
        <div className="lg:w-[25%]">
          <UnifiedSidebar pageType={pageType} />
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4 mt-4">
          {/* Mobile Layout */}
          <div className="lg:hidden px-4 py-3">
            {/* Hamburger Menu and Sort By - Properly aligned */}
            <div className="flex items-center justify-between w-full mb-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => {
                  const sidebarToggle = document.querySelector(
                    "[data-sidebar-toggle]"
                  );
                  if (sidebarToggle) sidebarToggle.click();
                }}
                className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-smallHeader shadow-sm hover:bg-smallHeader-dark transition-colors"
              >
                <IoMenu className="text-xl" />
              </button>

              {/* Sort By - Positioned to the right */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-4 py-3 border w-48 border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 transition-colors"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {sortOption === "lowToHigh"
                      ? "Lowest to Highest"
                      : sortOption === "highToLow"
                      ? "Highest to Lowest"
                      : "Relevancy"}
                    <span className="">
                      {isDropdownOpen ? (
                        <IoIosArrowUp className="text-gray-600" />
                      ) : (
                        <IoIosArrowDown className="text-gray-600" />
                      )}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <button
                        onClick={() => handleSortSelection("lowToHigh")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg ${
                          sortOption === "lowToHigh" ? "bg-gray-50" : ""
                        }`}
                      >
                        Lowest to Highest
                      </button>
                      <button
                        onClick={() => handleSortSelection("highToLow")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                          sortOption === "highToLow" ? "bg-gray-50" : ""
                        }`}
                      >
                        Highest to Lowest
                      </button>
                      <button
                        onClick={() => handleSortSelection("relevancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg ${
                          sortOption === "relevancy" ? "bg-gray-50" : ""
                        }`}
                      >
                        Relevancy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Count - Below Sort By */}
            <div className="mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand text-base">
                  {!isLoading &&
                    !skeletonLoading &&
                    !isFiltering &&
                    getTotalCount()}
                </span>
                <p className="text-sm text-gray-600">
                  {isLoading || isFiltering
                    ? "Loading..."
                    : `Results found (Australia Made Products)${
                        isPriceFilterActive ? " (Price filtered)" : ""
                      }`}
                  {isFiltering && " Please wait a while..."}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
              <div className="flex items-center justify-between px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
                {/* Placeholder for search if needed later */}
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
                      : "Relevancy"}
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
                      <button
                        onClick={() => handleSortSelection("relevancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                          sortOption === "highToLow" ? "bg-gray-100" : ""
                        }`}
                      >
                        Relevancy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between px-5 py-3 mt-4 rounded-md bg-activeFilter">
            <div className="flex flex-wrap items-center gap-4">
              {isPriceFilterActive && (
                <div className="filter-item">
                  <span className="text-sm">
                    ${minPrice} - ${maxPrice}
                  </span>
                  <button
                    className="px-2 text-lg"
                    onClick={handleClearPriceFilter}
                  >
                    x
                  </button>
                </div>
              )}
            </div>
              <div className="flex items-center gap-1">
                  <span className="font-semibold text-brand">
                    {!isLoading && totalCount}
                  </span>
                  <p className="">
                    {isLoading
                      ? "Loading..."
                      : `Results found ${
                        "(Australia Products)"
                        }${isPriceFilterActive ? " (Price filtered)" : ""}`}
                    {isLoading && " Please wait a while..."}
                  </p>
                </div>
          </div>

          {error && (
            <div className="flex items-center justify-center p-4 mt-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div
            className={`${
              showSkeleton && currentProducts.length === 0
                ? "grid grid-cols-3 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1"
                : ""
            }`}
          >
            {showSkeleton ? (
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
            ) : currentProducts.length > 0 ? (
              <div className="grid justify-center grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {currentPageProducts.map((product) => {
                  const priceGroups =
                    product.product?.prices?.price_groups || [];
                  const basePrice =
                    priceGroups.find((group) => group?.base_price) || {};
                  const priceBreaks = basePrice.base_price?.price_breaks || [];

                  const prices = priceBreaks
                    .map((breakItem) => breakItem.price)
                    .filter((price) => price !== undefined);

                  let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  const productId = product.meta.id;
                  const marginEntry = marginApi[productId] || {};
                  const marginFlat =
                    typeof marginEntry.marginFlat === "number"
                      ? marginEntry.marginFlat
                      : 0;

                  minPrice += (marginFlat * minPrice) / 100;
                  maxPrice += (marginFlat * maxPrice) / 100;

                  const discountPct = product.discountInfo?.discount || 0;
                  const isGlobalDiscount =
                    product.discountInfo?.isGlobal || false;

                  return (
                    <div
                      key={productId}
                      className="relative border border-border2 hover:border-1 hover:rounded-md transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                      onClick={() =>
                        handleViewProduct(
                          product.meta.id,
                          product.overview.name
                        )
                      }
                      onMouseEnter={() => setCardHover(product.meta.id)}
                      onMouseLeave={() => setCardHover(null)}
                    >
                      {/* ... (rest of your product card JSX remains the same) ... */}
                      {/* Australia Made Badge */}

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
                      <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
                        {(productionIds.has(product.meta.id) ||
                          productionIds.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                            <svg
                              className="w-3 h-3 flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden
                            >
                              <path
                                d="M12 7v5l3 1"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>24Hr Production</span>
                          </span>
                        )}

                        {(australiaIds.has(product.meta.id) ||
                          australiaIds.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
                            <svg
                              className="w-3 h-3 flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden
                            >
                              <path
                                d="M3 6h10l-2 3 2 3H3V6z"
                                fill="currentColor"
                              />
                              <rect
                                x="3"
                                y="4"
                                width="1"
                                height="16"
                                rx="0.5"
                                fill="currentColor"
                                opacity="0.9"
                              />
                            </svg>
                            <span>Australia Made</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 z-20">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToFavourite(product));
                            toast.success("Product added to favourites");
                          }}
                          className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                        >
                          {favSet.has(product.meta.id) ? (
                            <IoIosHeart className="text-lg text-red-500" />
                          ) : (
                            <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                          )}
                        </div>
                      </div>

                      <div className="max-h-[62%] sm:max-h-[71%] h-full border-b overflow-hidden relative">
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

                      <div className="p-2">
                        <div className="flex justify-center mb-1 gap-1 z-10">
                          {product?.product?.colours?.list.length > 1 &&
                            (() => {
                              const uniqueColors = [
                                ...new Set(
                                  product?.product?.colours?.list
                                    .flatMap((colorObj) => colorObj.colours)
                                    .filter((color) => !color.includes(" "))
                                ),
                              ];

                              return uniqueColors
                                .slice(0, 12)
                                .map((color, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        color
                                          .toLowerCase()
                                          .replace("navy", "#1e40af")
                                          .replace("grey", "#6b7280")
                                          .replace("gray", "#6b7280")
                                          .replace("red", "#ef4444")
                                          .replace("blue", "#3b82f6")
                                          .replace("green", "#10b981")
                                          .replace("yellow", "#eab308")
                                          .replace("orange", "#f97316")
                                          .replace("purple", "#a855f7")
                                          .replace("pink", "#ec4899")
                                          .replace("black", "#000000")
                                          .replace("white", "#ffffff")
                                          .replace("brown", "#92400e")
                                          .replace(" ", "") ||
                                        color.toLowerCase(),
                                    }}
                                    className="w-4 h-4 rounded-full border border-slate-900"
                                  />
                                ));
                            })()}
                        </div>
                        <div className="text-center">
                          <h2
                            className={`text-sm transition-all duration-300 ${
                              cardHover === product.meta.id &&
                              product.overview.name.length > 20
                                ? "sm:text-[18px]"
                                : "sm:text-lg"
                            } font-semibold text-brand sm:leading-[18px]`}
                          >
                            {product.overview.name || "No Name"}
                          </h2>

                          <p className="text-xs text-gray-500 pt-1">
                            Min Qty:{" "}
                            {product.product?.prices?.price_groups[0]
                              ?.base_price?.price_breaks[0]?.qty || 1}{" "}
                          </p>

                          <div className="">
                            <h2 className="text-base sm:text-lg font-bold text-heading">
                              From $
                              {minPrice === maxPrice ? (
                                <span>{minPrice.toFixed(2)}</span>
                              ) : (
                                <span>{minPrice.toFixed(2)}</span>
                              )}
                            </h2>
                            {discountPct > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                {discountPct}% discount applied
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="pt-10 text-xl text-center text-red-500">
                  No Australia Made Products Found
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
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
                totalPages,
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
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                disabled={currentPage === totalPages}
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

export default AustraliaProducts;