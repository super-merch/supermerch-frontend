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
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";
import Sidebar from "./Sidebar";
import noimage from "/noimage.png";
import { getProductPrice, slugify } from "@/utils/utils";
import SkeletonLoadingCards from "../Common/SkeletonLoadingCards";
import { Clock, Flag } from "lucide-react";
import { getPageTypeFromRoute } from "@/config/sidebarConfig";
import UnifiedSidebar from "../shared/UnifiedSidebar";

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
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("lowToHigh");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Price filter state and tracking
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [filterError, setFilterError] = useState("");
  const [totalFilteredPages, setTotalFilteredPages] = useState(0);
  const [fetchedPagesCount, setFetchedPagesCount] = useState(0);

  // State for managing products and pagination

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

  const {
    marginApi,

    skeletonLoading,
    australiaIds,
    productionIds,
    australiaPaginationData,
    setAustraliaPaginationData,
    getAustraliaProducts,
    australiaProductsLoading,
    refetchAustraliaProducts,
  } = useContext(AppContext);

  const [productsData, setProductsData] = useState(getAustraliaProducts?.data);
  const getProductsData = getAustraliaProducts?.data;
  const itemsPerPage = getAustraliaProducts?.itemsPerPage;
  const totalPages = getAustraliaProducts?.totalPages;
  const itemCount = getAustraliaProducts?.totalCount;
  const currentPage = getAustraliaProducts?.currentPage;

  // Helper function to get real price with caching
  const priceCache = useRef(new Map());

  // Clear price filter handler
  const handleClearPriceFilter = () => {
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    setAllFilteredProducts([]);
    setTotalFilteredPages(0);
    setFilterError("");
    setAustraliaPaginationData((prev) => ({ ...prev, page: 1 }));
    dispatch(applyFilters());
  };

  useEffect(() => {
    if (getAustraliaProducts?.data?.length === 0) {
      refetchAustraliaProducts();
    }
  }, []);

  // Get the current active products based on price filter
  const getActiveProducts = () => {
    return isPriceFilterActive ? allFilteredProducts : allProducts;
  };

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

  // Calculate total pages based on current products and mode

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    const sortedProducts = [...productsData].sort((a, b) => {
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

      if (option === "lowToHigh") return priceA - priceB;
      if (option === "highToLow") return priceB - priceA;
      if (option === "relevancy") return 0;
    });
    setProductsData(sortedProducts);
  };

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`, {
      state: productId,
    });
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
                    <div className="absolute right-0 z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                  {!australiaProductsLoading && itemCount}
                </span>
                <p className="text-sm text-gray-600">
                  {australiaProductsLoading
                    ? "Loading..."
                    : `products found (Australia Made Products)${
                        isPriceFilterActive ? " (Price filtered)" : ""
                      }`}
                  {australiaProductsLoading && " Please wait a while..."}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
              <div className="flex items-center justify-between px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
                {itemCount} products found (Australia Made Products)
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
                          sortOption === "relevancy" ? "bg-gray-100" : ""
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

          {isPriceFilterActive && (
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
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center p-4 mt-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div
            className={`${
              australiaProductsLoading
                ? "grid grid-cols-3 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1"
                : ""
            }`}
          >
            {australiaProductsLoading ? (
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : productsData?.length > 0 ? (
              <div className="grid justify-center grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {productsData?.map((product) => {
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
                      className="relative border border-border2 hover:border-1  transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
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
                      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 pointer-events-none">
                        {(productionIds?.has(product.meta.id) ||
                          productionIds?.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                            <Clock />
                            <span>24Hr Production</span>
                          </span>
                        )}

                        {(australiaIds?.has(product.meta.id) ||
                          australiaIds?.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
                            <Flag />
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
                              From ${getProductPrice(product, product.meta.id)}
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
                onClick={() =>
                  setAustraliaPaginationData((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 border rounded-full"
              >
                <IoMdArrowBack className="text-xl" />
              </button>
              {/* Middle pages */}
              {getPaginationButtons(currentPage, totalPages, maxVisiblePages)
                .filter((page) => page > 1 && page < totalPages)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setAustraliaPaginationData((prev) => ({
                        ...prev,
                        page: page,
                      }))
                    }
                    className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() =>
                  setAustraliaPaginationData((prev) => ({ ...prev, page: 1 }))
                }
                className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                1
              </button>
              {/* Show ellipsis if there are hidden pages at the end */}
              {currentPage < totalPages - maxVisiblePages / 2 &&
                totalPages > maxVisiblePages && (
                  <span className="px-2 text-gray-500">...</span>
                )}

              {/* Last page - Always show if more than 1 page */}
              {totalPages > 1 && (
                <button
                  onClick={() =>
                    setAustraliaPaginationData((prev) => ({
                      ...prev,
                      page: totalPages,
                    }))
                  }
                  className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              )}

              {/* Next Button */}
              <button
                onClick={() =>
                  setAustraliaPaginationData((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, totalPages),
                  }))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoMdArrowForward className="text-lg sm:text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AustraliaProducts;
