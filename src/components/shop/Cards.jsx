import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { backgroundColor, getProductPrice, slugify } from "@/utils/utils";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoMdArrowBack,
  IoMdArrowForward,
} from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPageTypeFromRoute } from "../../config/sidebarConfig";
import { AppContext } from "../../context/AppContext";
import UnifiedSidebar from "../shared/UnifiedSidebar";
import SkeletonLoadingCards from "../Common/SkeletonLoadingCards";
import EmptyState from "../Common/EmptyState";
import ProductCard from "../Common/ProductCard";
import { setMaxPrice, setMinPrice } from "@/redux/slices/filterSlice";

const getPaginationButtons = (currentPage, totalPages, maxVisiblePages) => {
  // Always ensure current page is visible
  // Calculate pages to show around current page (excluding page 1 and last page)

  if (totalPages <= 2) {
    // If only 2 pages total, no middle pages needed
    return [];
  }

  // Calculate how many pages to show on each side of current page
  const pagesOnEachSide = Math.floor((maxVisiblePages - 1) / 2);

  // Start from currentPage - pagesOnEachSide, but not less than 2
  let startPage = Math.max(2, currentPage - pagesOnEachSide);
  // End at currentPage + pagesOnEachSide, but not more than totalPages - 1
  let endPage = Math.min(totalPages - 1, currentPage + pagesOnEachSide);

  // If we have room, try to show more pages
  const pagesNeeded = endPage - startPage + 1;
  if (pagesNeeded < maxVisiblePages) {
    // If near the start, extend to the right
    if (startPage === 2) {
      endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    }
    // If near the end, extend to the left
    else if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 1);
    }
  }

  // Final check: ensure current page is always included
  if (currentPage < startPage) {
    startPage = currentPage;
  }
  if (currentPage > endPage) {
    endPage = currentPage;
  }

  // Build and return the pages array
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
};

const Cards = ({ category = "dress" }) => {
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedCategory = useSelector((state) => state.filters.categoryId);
  const [cardHover, setCardHover] = useState(null);
  const isAustraliaPage = category === "australia";
  const is24HrPage = category === "24hr-production";
  const isSalesPage = category === "sales";
  const isSearch = category === "search";
  const isAllProducts = category === "allProducts";
  const isSpecialPage =
    isAustraliaPage || is24HrPage || isSalesPage || isSearch;

  const { activeFilters, minPrice, maxPrice } = useSelector(
    (state) => state.filters
  );
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageType = getPageTypeFromRoute(location.pathname);

  const {
    marginApi,
    productionIds,
    australiaIds,
    paginationData,
    setPaginationData,
    getProducts,
    productsLoading,
    refetchProducts,
  } = useContext(AppContext);
  const [productsData, setProductsData] = useState(getProducts?.data);

  useEffect(() => {
    if (getProducts?.data) {
      setProductsData(getProducts?.data);
    }
  }, [getProducts]);

  const [searchParams, setSearchParams] = useSearchParams();
  const getProductsData = getProducts?.data;

  // Helper function to update URL with pagination
  const updatePaginationInURL = (newPage) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("page", newPage.toString());
    setSearchParams(currentParams);

    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const itemsPerPage = getProducts?.items_per_page;
  const totalPages = getProducts?.total_pages || getProducts?.totalPages;
  const itemCount =
    getProducts?.item_count ||
    getProducts?.totalCount ||
    getProducts?.data?.length;
  const currentPage = paginationData?.page || paginationData?.currentPage;
  const favSet = new Set();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const prevCategoryKeyRef = useRef(null);

  useEffect(() => {
    const pageFromURL = parseInt(searchParams.get("page")) || 1;
    const urlCategoryParam = searchParams.get("category");
    const urlType = searchParams.get("type");
    const isSearchRoute = location.pathname.includes("/search");
    let limit = 9;
    if (window.innerWidth <= 1025) {
      limit = 10;
    }

    const currentCategoryKey = urlCategoryParam
      ? `cat:${urlCategoryParam}:type:${urlType || ""}`
      : isSearchRoute
      ? `search:${searchParams.get("search") || ""}`
      : `route:${category || ""}`;

    const categoryChanged = prevCategoryKeyRef.current !== currentCategoryKey;
    prevCategoryKeyRef.current = currentCategoryKey;

    if (categoryChanged) {
      setSortOption("");
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));

      if (urlCategoryParam) {
        if (
          urlCategoryParam === "australia" ||
          urlCategoryParam === "24hr-production" ||
          urlCategoryParam === "sales" ||
          urlCategoryParam === "allProducts"
        ) {
          setPaginationData((prev) => ({
            ...prev,
            category: urlCategoryParam,
            page: pageFromURL,
            limit,
            sortOption: "",
            colors: [],
            attributes: null,
            pricerange: undefined,
            sendAttributes: false,
          }));
        } else {
          setPaginationData((prev) => ({
            ...prev,
            productTypeId: urlCategoryParam,
            sendAttributes: true,
            limit,
            category: null,
            page: pageFromURL,
            sortOption: "",
            colors: [],
            attributes: null,
            pricerange: undefined,
          }));
        }
      } else if (isSearchRoute) {
        setPaginationData((prev) => ({
          ...prev,
          category: "search",
          page: pageFromURL,
          sendAttributes: true,
          limit,
          searchTerm: searchParams.get("search"),
          productTypeId: searchParams.get("categoryId"),
          sortOption: "",
          colors: [],
          attributes: null,
          pricerange: undefined,
        }));
      } else {
        setPaginationData((prev) => ({
          ...prev,
          category: category,
          page: pageFromURL,
          sortOption: "",
          colors: [],
          limit,
          attributes: null,
          pricerange: undefined,
          sendAttributes: false,
        }));
      }

      return;
    }
    if (urlCategoryParam) {
      if (
        urlCategoryParam === "australia" ||
        urlCategoryParam === "24hr-production" ||
        urlCategoryParam === "sales" ||
        urlCategoryParam === "allProducts"
      ) {
        setPaginationData((prev) => ({
          ...prev,
          category: urlCategoryParam,
          page: pageFromURL,
          limit,
          // preserve prev.sortOption
          sortOption: prev?.sortOption ?? "",
          sendAttributes: false,
        }));
      } else {
        setPaginationData((prev) => ({
          ...prev,
          productTypeId: urlCategoryParam,
          category: null,
          limit,
          page: pageFromURL,
          sortOption: prev?.sortOption ?? "",
          sendAttributes: false,
        }));
      }
    } else if (isSearchRoute) {
      setPaginationData((prev) => ({
        ...prev,
        category: "search",
        page: pageFromURL,
        searchTerm: searchParams.get("search"),
        limit,
        productTypeId: searchParams.get("categoryId"),
        sortOption: prev?.sortOption ?? "",
        sendAttributes: false,
      }));
    } else {
      setPaginationData((prev) => ({
        ...prev,
        category: category,
        limit,
        page: pageFromURL,
        sortOption: prev?.sortOption ?? "",
        sendAttributes: false,
      }));
    }
  }, [searchParams, category, location.pathname]);

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsDropdownOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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

  const handleSortSelection = (option) => {
    setSortOption(option);

    setPaginationData((prev) => ({
      ...prev,
      sortOption: option === "revelancy" ? "" : option,
      page: 1,
      sendAttributes: false,
    }));

    setIsDropdownOpen(false);
  };

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`, {
      state: productId,
    });
  };
  const getResultsText = () => {
    if (isAustraliaPage) return "Australia Made Products";
    if (is24HrPage) return "24Hr Production Products";
    if (isSalesPage) return "Sales Products";
    if (isSearch) return `Search Results for "${searchParams.get("search")}"`;
    if (category)
      return `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
    return "All Products";
  };

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[280px]">
          <UnifiedSidebar pageType={pageType} categoryType={category} />
        </div>

        <div className="flex-1 w-full lg:mt-0 md:mt-4 mt-0">
          {/* Mobile Layout */}
          <div className="lg:hidden">
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
                className="flex items-center justify-center rounded-md text-primary shadow-sm hover:bg-primary-dark transition-colors"
              >
                <IoMenu className="text-xl" />
              </button>

              {/* Sort By - Positioned to the right */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-2 py-1 border w-48 border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 transition-colors"
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
                    <div className="absolute right-0 z-[100] w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                        onClick={() => handleSortSelection("revelancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg ${
                          sortOption === "revelancy" ? "bg-gray-50" : ""
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
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand text-base">
                  {!productsLoading && (itemCount || 0)}
                </span>
                <p className="text-sm text-gray-600">
                  {productsLoading ? "Loading..." : `product found `}
                  {productsLoading && " Please wait a while..."}
                  {isPriceFilterActive && !productsLoading
                    ? `between $${minPrice} and $${maxPrice}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Product Count - Left Side */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-brand">
                  {!productsLoading && (itemCount || 0)}
                </span>
                <p className="">
                  {productsLoading ? "Loading..." : `product found`}
                  {productsLoading && " Please wait a while..."}
                  {isPriceFilterActive && !productsLoading
                    ? ` between $${minPrice} and $${maxPrice}`
                    : ""}
                </p>
              </div>

              {/* Sort Dropdown - Right Side */}
              <div className="flex items-center gap-3">
                <p>Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-4 py-3 border w-52 border-border2 rounded-lg"
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
                        onClick={() => handleSortSelection("revelancy")}
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

          <div
            className={`${
              productsLoading
                ? "grid grid-cols-3 gap-6 mt-4 md:mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1"
                : ""
            }`}
          >
            {productsLoading ? (
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : productsData?.length > 0 ? (
              <div className="grid justify-center grid-cols-2 gap-2 md:gap-6 md:mt-10 mt-3 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-2">
                {productsData?.map((product) => {
                  return (
                    <ProductCard
                      key={product.meta.id}
                      product={product}
                      favSet={favSet}
                      onViewProduct={handleViewProduct}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Products Found"
                description="We couldn't find any products matching your search criteria. Try adjusting your filters or explore our categories to discover amazing products."
                icon="search"
                variant="detailed"
                suggestions={[
                  "Check your spelling or try different keywords",
                  "Use more general search terms",
                  "Remove some filters to broaden your search",
                  "Browse our popular categories",
                ]}
                showContact={true}
              />
            )}
          </div>
          {totalPages > 1 &&
            getProductsData?.length > 0 &&
            (() => {
              // Calculate middle pages once to avoid inconsistencies
              // Ensure we have valid values
              const safeCurrentPage = Number(currentPage) || 1;
              const safeTotalPages = Number(totalPages) || 1;
              const safeMaxVisiblePages = Number(maxVisiblePages) || 6;

              const middlePages = getPaginationButtons(
                safeCurrentPage,
                safeTotalPages,
                safeMaxVisiblePages
              );
              const showPage1Separately = !middlePages.includes(1);
              const showLastPageSeparately =
                safeTotalPages > 1 && !middlePages.includes(safeTotalPages);
              const firstMiddlePage =
                middlePages.length > 0 ? middlePages[0] : 0;
              const lastMiddlePage =
                middlePages.length > 0
                  ? middlePages[middlePages.length - 1]
                  : 0;
              const showEllipsisBefore =
                showPage1Separately && firstMiddlePage > 2;
              const showEllipsisAfter =
                showLastPageSeparately && lastMiddlePage < safeTotalPages - 1;

              // Ensure current page is always visible - if not in middlePages, add it
              const displayPages = [...middlePages];
              if (
                !displayPages.includes(safeCurrentPage) &&
                safeCurrentPage > 1 &&
                safeCurrentPage < safeTotalPages
              ) {
                displayPages.push(safeCurrentPage);
                displayPages.sort((a, b) => a - b);
              }

              return (
                <div className="flex items-center justify-center mt-16 space-x-1 sm:space-x-2 pagination flex-wrap">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      const newPage = Math.max(safeCurrentPage - 1, 1);
                      setPaginationData((prev) => ({
                        ...prev,
                        page: newPage,
                        sendAttributes: false,
                      }));
                      updatePaginationInURL(newPage);
                    }}
                    disabled={safeCurrentPage === 1}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IoMdArrowBack className="text-lg sm:text-xl" />
                  </button>

                  {/* Page 1 - Show if not in middle range */}
                  {showPage1Separately && (
                    <>
                      <button
                        onClick={() => {
                          setPaginationData((prev) => ({
                            ...prev,
                            page: 1,
                            sendAttributes: false,
                          }));
                          updatePaginationInURL(1);
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                          safeCurrentPage === 1
                            ? "bg-primary text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        1
                      </button>
                      {/* Show ellipsis if there's a gap between page 1 and middle pages */}
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Middle pages - Always include current page */}
                  {displayPages.map((page) => (
                    <button
                      key={`page-${page}`}
                      onClick={() => {
                        setPaginationData((prev) => ({
                          ...prev,
                          page: page,
                          sendAttributes: false,
                        }));
                        updatePaginationInURL(page);
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                        safeCurrentPage === page
                          ? "bg-primary text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Show ellipsis if there's a gap between middle pages and last page */}
                  {showEllipsisAfter && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {/* Last page - Show if not in middle range */}
                  {showLastPageSeparately && (
                    <button
                      onClick={() => {
                        setPaginationData((prev) => ({
                          ...prev,
                          page: safeTotalPages,
                          sendAttributes: false,
                        }));
                        updatePaginationInURL(safeTotalPages);
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                        safeCurrentPage === safeTotalPages
                          ? "bg-primary text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {safeTotalPages}
                    </button>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      const newPage = Math.min(
                        safeCurrentPage + 1,
                        safeTotalPages
                      );
                      setPaginationData((prev) => ({
                        ...prev,
                        page: newPage,
                        sendAttributes: false,
                      }));
                      updatePaginationInURL(newPage);
                    }}
                    disabled={safeCurrentPage === safeTotalPages}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IoMdArrowForward className="text-lg sm:text-xl" />
                  </button>
                </div>
              );
            })()}
        </div>
      </div>
    </>
  );
};

export default Cards;
