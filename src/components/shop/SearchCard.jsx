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
import { IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
  setSelectedBrands,
  setSelectedCategory,
} from "../../redux/slices/filterSlice";
import SideBar2 from "./SideBar2";
import noimage from "/noimage.png";

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

const SearchCard = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedPagesCount, setFetchedPagesCount] = useState(0);
  const [itemsPerPage] = useState(9);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const dropdownRef = useRef(null);
  const [search, setSearch] = useSearchParams();
  const searchParam = search.get("search");

  // State for filtered products and pagination
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [totalFilteredPages, setTotalFilteredPages] = useState(0);

  // Only keep local search text state
  const [searchProductName, setSearchProductName] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    fetchSearchedProducts,
    fetchMultipleSearchPages,
    searchedProducts,
    searchLoading,
    marginApi,
    totalApiPages,
    setTotalApiPages,
    backendUrl,
    productionIds,
    australiaIds,
  } = useContext(AppContext);

  // useEffect(() => {
  //   getAll24HourProduction();
  //   getAllAustralia();
  // }, []);

  // Get Redux filter state
  const { searchText, activeFilters, filteredCount, minPrice, maxPrice } =
    useSelector((state) => state.filters);

  // Check if price filters are active
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;

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

  // Helper function to get real price
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

  // Function to fetch and filter products with timeout using AppContext method
  const fetchAndFilterProducts = async (
    searchTerm,
    minPrice,
    maxPrice,
    sortOption
  ) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      // Start with more pages initially for better results
      let maxPages = 3; // Increased from 2

      // Fetch products in parallel batches instead of sequentially
      const fetchedProducts = await fetchMultipleSearchPages(
        searchTerm,
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
          // Remove duplicates more efficiently using Set
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
          setFilterError(
            "No products found in the specified price range. Showing you the previous results"
          );
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
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  // Function to fetch more products when user is near the end
  const fetchMoreFilteredProducts = async () => {
    if (isFiltering) return;

    setIsFiltering(true);

    try {
      const startPage = fetchedPagesCount + 1;
      const pagesToFetch = 3; // Increased from 2

      // Fetch pages in parallel
      const additionalProducts = await fetchMultipleSearchPages(
        searchParam,
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
      const isNearEnd = currentPage >= totalFilteredPages - 1; // When user is on last or second-to-last page
      const hasRoomForMore = allFilteredProducts.length < 200; // Don't fetch if we already have too many

      if (isNearEnd && hasRoomForMore) {
        fetchMoreFilteredProducts();
      }
    }
  }, [currentPage, isPriceFilterActive, totalFilteredPages]);
  useEffect(() => {
    if (isPriceFilterActive && searchParam) {
      fetchAndFilterProducts(searchParam, minPrice, maxPrice, sortOption);
    } else {
      // Reset filtered products when no price filter is active
      setAllFilteredProducts([]);
      setTotalFilteredPages(0);
      setFilterError("");
      setFetchedPagesCount(0); // Add this line
    }
  }, [minPrice, maxPrice, searchParam, sortOption]);

  // Fetch products when page or sort changes (only when no price filter is active)
  useEffect(() => {
    if (searchParam && !isPriceFilterActive) {
      fetchSearchedProducts(searchParam, currentPage, sortOption).then(
        (response) => {
          if (response && response.total_pages) {
            setTotalApiPages(response.total_pages);
          }
        }
      );
    }
  }, [currentPage, sortOption, searchParam, isPriceFilterActive]);

  // Update total API pages based on the API response
  useEffect(() => {
    if (
      searchedProducts &&
      searchedProducts.total_pages &&
      !isPriceFilterActive
    ) {
      setTotalApiPages(searchedProducts.total_pages);
    }
  }, [searchedProducts, isPriceFilterActive]);

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1); // Reset to page 1 when sorting changes
  };

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  const setSearchTextChanger = (e) => {
    setSearchProductName(e.target.value);
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

  // Get current page products based on whether price filter is active
  const getCurrentPageProducts = () => {
    if (isPriceFilterActive) {
      // Use filtered products (existing logic)
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return allFilteredProducts.slice(startIndex, endIndex);
    } else {
      // Use regular API products with local search filter
      const apiProducts = searchedProducts?.data || [];

      // Apply client-side sorting if requested
      const sortedProducts =
        sortOption === "lowToHigh" || sortOption === "highToLow"
          ? [...apiProducts].sort((a, b) => {
              const priceA = getRealPrice(a) || 0;
              const priceB = getRealPrice(b) || 0;
              return sortOption === "lowToHigh"
                ? priceA - priceB
                : priceB - priceA;
            })
          : apiProducts;

      // Then apply local name filter
      return sortedProducts.filter((product) => {
        const productName = (product.overview?.name || "").toLowerCase();
        return productName.includes(searchProductName.toLowerCase());
      });
    }
  };

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
      return searchedProducts.item_count || 0;
    }
  };

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[25%]">
          {currentPageProducts.length > 0 && <SideBar2 />}
          {(searchLoading || isFiltering) && <SideBar2 />}
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4">
          <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
            <div className="flex items-center justify-between px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
              {/* {!isPriceFilterActive && (
                <>
                  <input
                    type="text"
                    placeholder={`Search for ${searchParam} products...`}
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
                  className="flex items-center justify-between gap-2 px-4 py-3 border w-52 border-border2 rounded"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  {/* Show Relevency as default/when selected, otherwise show the chosen price sort */}
                  {sortOption === "relevency" || !sortOption
                    ? "Relevency"
                    : sortOption === "lowToHigh"
                    ? "Lowest to Highest"
                    : sortOption === "highToLow"
                    ? "Highest to Lowest"
                    : "Relevency"}
                  <span>
                    {isDropdownOpen ? (
                      <IoIosArrowUp className="text-black" />
                    ) : (
                      <IoIosArrowDown className="text-black" />
                    )}
                  </span>
                </button>

                {/* Dropdown only contains price sorts (no relevency option here) */}
                {isDropdownOpen && (
                  <div className="absolute left-0 z-10 w-full mt-2 bg-white border top-full border-border2 rounded">
                    <button
                      onClick={() => {
                        handleSortSelection("lowToHigh");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                        sortOption === "lowToHigh" ? "bg-gray-100" : ""
                      }`}
                    >
                      Lowest to Highest
                    </button>

                    <button
                      onClick={() => {
                        handleSortSelection("highToLow");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                        sortOption === "highToLow" ? "bg-gray-100" : ""
                      }`}
                    >
                      Highest to Lowest
                    </button>
                    <button
                      onClick={() => {
                        handleSortSelection("relevancy");
                        setIsDropdownOpen(false);
                      }}
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
                {!searchLoading && !isFiltering && getTotalCount()}
              </span>
              <p className="">
                {searchLoading || isFiltering
                  ? "Loading..."
                  : `Results found for ${searchParam}
                ${
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

          {/* {filterError && (
            <div className="flex items-center justify-center p-4 mt-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{filterError}</p>
            </div>
          )} */}

          <div
            className={`${
              searchLoading || isFiltering
                ? "grid grid-cols-1 gap-6 mt-4 md:mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1"
                : ""
            }`}
          >
            {searchLoading || isFiltering ? (
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
                        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
                          {(productionIds.has(product.meta.id) ||
                            productionIds.has(String(product.meta.id))) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                              {/* small clock SVG (no extra imports) */}
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
                              {/* simple flag/triangle SVG */}
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
                            {favSet.has(product.meta.id) ? (
                              <IoIosHeart className="text-lg text-red-500" />
                            ) : (
                              <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                            )}
                          </div>
                        </div>

                        {/* Enlarged image section */}
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

                        {/* Color swatches */}

                        {/* Reduced content area */}
                        <div className="p-2 ">
                          <div className=" flex justify-center mb-1 gap-1  z-10">
                            {product?.product?.colours?.list.length > 1 &&
                              (() => {
                                // Extract unique colors and filter out colors with spaces/multiple words
                                const uniqueColors = [
                                  ...new Set(
                                    product?.product?.colours?.list
                                      .flatMap((colorObj) => colorObj.colours)
                                      .filter((color) => !color.includes(" ")) // Remove colors with spaces
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
                              } font-semibold text-brand sm:leading-[18px] `}
                            >
                              {(product.overview.name &&
                                // product.overview.name.length > 20 && cardHover!==product.meta.id
                                //   ? product.overview.name.slice(0, 20) + "..."
                                product.overview.name) ||
                                "No Name"}
                            </h2>

                            {/* Minimum quantity */}
                            <p className="text-xs text-gray-500 pt-1">
                              Min Qty:{" "}
                              {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}{" "}
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
                  No products found. Explore our categories or refine your
                  search to discover more options
                </p>
              </div>
            )}
          </div>

          {(paginationTotalPages > 1 || hasMoreProducts) &&
            currentPageProducts.length > 0 && (
              <div className="flex items-center justify-center mt-16 space-x-2 pagination">
                {/* Previous Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 border rounded-full"
                >
                  <IoMdArrowBack className="text-xl" />
                </button>

                {/* Always show Page 1 */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-10 h-10 border rounded-full flex items-center justify-center ${
                    currentPage === 1
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  1
                </button>

                {/* Show Page 2 when there might be more products */}
                {paginationTotalPages === 1 && hasMoreProducts && (
                  <button
                    onClick={() => {
                      setCurrentPage(2);
                      if (isPriceFilterActive) {
                        fetchMoreFilteredProducts();
                      } else {
                        // For regular search results
                        fetchSearchedProducts(searchParam, 2, sortOption).then(
                          (response) => {
                            if (
                              response &&
                              response.data &&
                              response.data.length === 0
                            ) {
                              setHasMoreProducts(false);
                            }
                          }
                        );
                      }
                    }}
                    className={`w-10 h-10 border rounded-full flex items-center justify-center ${
                      currentPage === 2
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    2
                  </button>
                )}

                {/* Show remaining pages (if any) */}
                {paginationTotalPages > 1 &&
                  getPaginationButtons(
                    currentPage,
                    paginationTotalPages,
                    maxVisiblePages
                  )
                    .filter((page) => page > 1) // Skip page 1 since we always show it
                    .map((page) => (
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

                {/* Next Button */}
                <button
                  onClick={() => {
                    const nextPage = Math.min(
                      currentPage + 1,
                      paginationTotalPages
                    );
                    setCurrentPage(nextPage);
                    if (nextPage === paginationTotalPages && hasMoreProducts) {
                      if (isPriceFilterActive) {
                        fetchMoreFilteredProducts();
                      } else {
                        // For regular search results
                        fetchSearchedProducts(
                          searchParam,
                          nextPage + 1,
                          sortOption
                        ).then((response) => {
                          if (
                            response &&
                            response.data &&
                            response.data.length === 0
                          ) {
                            setHasMoreProducts(false);
                          }
                        });
                      }
                    }
                  }}
                  disabled={
                    currentPage === paginationTotalPages && !hasMoreProducts
                  }
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

export default SearchCard;
