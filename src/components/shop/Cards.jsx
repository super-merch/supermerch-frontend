import { setMaxPrice, setMinPrice } from "@/redux/slices/filterSlice";
import { slugify } from "@/utils/utils";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPageTypeFromRoute } from "../../config/sidebarConfig";
import { AppContext } from "../../context/AppContext";
import EmptyState from "../Common/EmptyState";
import ProductCard from "../Common/ProductCard";
import SkeletonLoadingCards from "../Common/SkeletonLoadingCards";
import UnifiedSidebar from "../shared/UnifiedSidebar";

const Cards = ({ category = "" }) => {
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategoryParam = searchParams.get("category");
  const pageFromURL = parseInt(searchParams.get("page"));
  const urlType = searchParams.get("type");
  const isSearchRoute = location.pathname.includes("/search");
  const limit = 20;
  const pageLimit = limit;
  const urlSort = searchParams.get("sort") || "";
  const urlColors = searchParams.get("colors");
  const urlAttrName = searchParams.get("attrName");
  const urlAttrValue = searchParams.get("attrValue");
  const { activeFilters, minPrice, maxPrice } = useSelector(
    (state) => state.filters
  );
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pageType = getPageTypeFromRoute(location.pathname);

  const {
    paginationData,
    setPaginationData,
    getProducts,
    productsLoading,
    backednUrl,
    refetchProducts,
  } = useContext(AppContext);

  // State for accumulated products and loading more
  const [accumulatedProducts, setAccumulatedProducts] = useState(
    getProducts?.data ?? []
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    pageFromURL || paginationData?.page || paginationData?.currentPage
  );
  const prevCategoryKeyRef = useRef(null);
  const productRefs = useRef(new Map());
  const hasScrolledRef = useRef(false);
  const scrollToProductId = searchParams.get("scrollTo");

  const favSet = new Set();

  // Function to build API URL for fetching products
  const buildApiUrl = (page, limit) => {
    const params = new URLSearchParams({
      ...(paginationData.productTypeId && {
        product_type_ids: paginationData.productTypeId,
      }),
      page: page.toString(),
      limit: limit.toString(),
      ...(paginationData.sortOption && { sort: paginationData.sortOption }),
      ...(paginationData.filter && { filter: paginationData.filter }),
      ...(paginationData.category && { category: paginationData.category }),
      ...(paginationData.searchTerm !== undefined && {
        searchTerm: paginationData.searchTerm,
      }),
      ...(paginationData.pricerange?.min_price != null && {
        min_price: paginationData.pricerange.min_price,
      }),
      ...(paginationData.pricerange?.max_price != null && {
        max_price: paginationData.pricerange.max_price,
      }),
      ...(paginationData.sendAttributes != null && {
        send_attributes: paginationData.sendAttributes,
      }),
      ...(paginationData.attributes?.name && {
        attribute_name: paginationData.attributes.name,
      }),
      ...(paginationData.attributes?.value && {
        attribute_value: paginationData.attributes.value,
      }),
    });

    if (
      paginationData.colors &&
      Array.isArray(paginationData.colors) &&
      paginationData.colors.length > 0
    ) {
      paginationData.colors.forEach((color) => {
        params.append("colors[]", color);
      });
    }
    let url = "";
    if (paginationData.category === "return-gifts") {
      url = `${backednUrl}/api/client-products/search?searchTerm=hamper&page=${page}&limit=${limit}`;
    } else if (paginationData.category === "australia") {
      url = `${backednUrl}/api/australia/get-products?${params.toString()}`;
    } else if (paginationData.category === "24hr-production") {
      url = `${backednUrl}/api/24hour/get-products?${params.toString()}`;
    } else if (paginationData.category === "sales") {
      url = `${backednUrl}/api/client-products-discounted?${params.toString()}`;
    } else if (paginationData.category === "allProducts") {
      url = `${backednUrl}/api/client-products?${params.toString()}`;
    } else if (paginationData.category === "search") {
      url = `${backednUrl}/api/client-products/search?${params.toString()}`;
    } else if (paginationData.category) {
      url = `${backednUrl}/api/client-products/category?${params.toString()}`;
    } else if (paginationData.productTypeId) {
      url = `${backednUrl}/api/params-products?${params.toString()}`;
    } else {
      url = `${backednUrl}/api/client-products?${params.toString()}`;
    }
    return url;
  };

  // Function to fetch products for a specific page
  const fetchProductsPage = async (page) => {
    const limit = 20;
    const url = buildApiUrl(page, limit);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    const limit = Number(searchParams.get("limit")) || 20;
    const newLimit = limit + 20;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await fetchProductsPage(nextPage);

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        // Append new products to accumulated products
        setAccumulatedProducts((prev) => [...prev, ...data.data]);
        setCurrentPage(nextPage);
        setSearchParams((prev) => {
          prev.set("page", nextPage.toString());
          prev.set("limit", newLimit.toString());
          return prev;
        });

        // Check if there are more products to load
        const totalPages = data.total_pages || data.totalPages || 0;
        if (nextPage >= totalPages) {
          setHasMoreProducts(false);
        }
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      toast.error("Failed to load more products");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Reset accumulated products when category/filters change
  useEffect(() => {
    const currentCategoryKey = urlCategoryParam
      ? `cat:${urlCategoryParam}:type:${urlType || ""}`
      : isSearchRoute
      ? `search:${searchParams.get("search") || ""}`
      : `route:${category || ""}`;

    const categoryChanged = prevCategoryKeyRef.current !== currentCategoryKey;
    prevCategoryKeyRef.current = currentCategoryKey;

    if (categoryChanged) {
      // Reset accumulated products and page when category/filters change
      setAccumulatedProducts([]);
      setCurrentPage(1);
      setHasMoreProducts(true);
      // Reset page in URL to 1
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", "1");
      currentParams.delete("scrollTo");
      setSearchParams(currentParams, { replace: true });

      setSortOption(urlSort || "");
      if (urlMinPrice && urlMaxPrice) {
        dispatch(setMinPrice(Number(urlMinPrice)));
        dispatch(setMaxPrice(Number(urlMaxPrice)));
      } else {
        dispatch(setMinPrice(0));
        dispatch(setMaxPrice(1000));
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
            page: 1,
            limit: pageLimit,
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
            limit: pageLimit,
            category: null,
            page: pageFromURL,
            sortOption: urlSort,
            colors: urlColors ? urlColors.split(",") : [],
            attributes:
              urlAttrName && urlAttrValue
                ? { name: urlAttrName, value: urlAttrValue }
                : null,
            pricerange:
              urlMinPrice && urlMaxPrice
                ? {
                    min_price: Number(urlMinPrice),
                    max_price: Number(urlMaxPrice),
                  }
                : undefined,
          }));
        }
      } else if (isSearchRoute) {
        setPaginationData((prev) => ({
          ...prev,
          category: "search",
          page: 1,
          sendAttributes: true,
          limit: pageLimit,
          searchTerm: searchParams.get("search"),
          productTypeId: searchParams.get("categoryId"),
          sortOption: urlSort,
          colors: urlColors ? urlColors.split(",") : [],
          attributes:
            urlAttrName && urlAttrValue
              ? { name: urlAttrName, value: urlAttrValue }
              : null,
          pricerange:
            urlMinPrice && urlMaxPrice
              ? {
                  min_price: Number(urlMinPrice),
                  max_price: Number(urlMaxPrice),
                }
              : undefined,
        }));
      } else {
        setPaginationData((prev) => ({
          ...prev,
          category: category,
          page: pageFromURL,
          limit: pageLimit,
          sortOption: urlSort,
          colors: urlColors ? urlColors.split(",") : [],
          attributes:
            urlAttrName && urlAttrValue
              ? { name: urlAttrName, value: urlAttrValue }
              : null,
          pricerange:
            urlMinPrice && urlMaxPrice
              ? {
                  min_price: Number(urlMinPrice),
                  max_price: Number(urlMaxPrice),
                }
              : undefined,
          sendAttributes: false,
        }));
      }
    }
  }, [
    searchParams,
    category,
    location.pathname,
    dispatch,
    urlMinPrice,
    urlMaxPrice,
  ]);

  // Track when filters/category change to reset accumulated products
  const filtersKeyRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Reset accumulated products when filters change (before data is fetched)
  useEffect(() => {
    const currentFiltersKey = `${paginationData.productTypeId}-${
      paginationData.category
    }-${paginationData.searchTerm}-${
      paginationData.sortOption
    }-${JSON.stringify(paginationData.pricerange)}-${JSON.stringify(
      paginationData.colors
    )}`;

    if (
      filtersKeyRef.current !== null &&
      filtersKeyRef.current !== currentFiltersKey
    ) {
      // Filters changed - reset accumulated products
      filtersKeyRef.current = currentFiltersKey;
      isInitialLoadRef.current = true;
      setAccumulatedProducts([]);
      setCurrentPage(1);
      setHasMoreProducts(true);
      // Reset page in URL to 1 when filters change
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", "1");
      currentParams.delete("scrollTo");
      setSearchParams(currentParams, { replace: true });
    } else if (filtersKeyRef.current === null) {
      // Initial load - set the key
      filtersKeyRef.current = currentFiltersKey;
    }
  }, [
    paginationData.productTypeId,
    paginationData.category,
    paginationData.searchTerm,
    // paginationData.sortOption,
    // paginationData.pricerange,
    // paginationData.colors,
  ]);

  // Handle scroll restoration from URL
  useEffect(() => {
    if (
      scrollToProductId &&
      !hasScrolledRef.current &&
      accumulatedProducts.length > 0 &&
      !productsLoading &&
      !isLoadingMore
    ) {
      const productElement = productRefs.current.get(scrollToProductId);

      if (productElement) {
        setTimeout(() => {
          productElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          hasScrolledRef.current = true;

          // Remove scrollTo from URL after scrolling
          const currentParams = new URLSearchParams(searchParams);
          currentParams.delete("scrollTo");
          setSearchParams(currentParams, { replace: true });
        }, 300);
      }
    }
  }, [
    scrollToProductId,
    accumulatedProducts,
    productsLoading,
    isLoadingMore,
    // searchParams,
    // setSearchParams,
  ]);

  // Reset scroll ref when scrollToProductId is removed
  useEffect(() => {
    if (!scrollToProductId) {
      hasScrolledRef.current = false;
    }
  }, [scrollToProductId]);

  // Update accumulated products when getProducts.data changes
  useEffect(() => {
    if (
      getProducts?.data &&
      Array.isArray(getProducts.data) &&
      !productsLoading
    ) {
      // Check if we're restoring from URL page parameter
      const urlPage = parseInt(searchParams.get("page")) || 1;
      const isRestoringFromURL = urlPage > 1;

      // Only update on initial load or when page is 1 (React Query always fetches page 1 first)
      // Don't reset if we're restoring from URL page parameter (page > 1 in URL)
      if (
        (isInitialLoadRef.current || currentPage === 1) &&
        !isRestoringFromURL
      ) {
        setAccumulatedProducts(getProducts.data);
        setCurrentPage(1);
        isInitialLoadRef.current = false;

        // Ensure page 1 is in URL only if not restoring
        if (urlPage === 1) {
          const currentParams = new URLSearchParams(searchParams);
          currentParams.set("page", "1");
          setSearchParams(currentParams, { replace: true });
        }

        // Check if there are more products to load
        const totalPages =
          getProducts.total_pages || getProducts.totalPages || 0;
        setHasMoreProducts(totalPages > 1 && getProducts.data.length > 0);
      } else if (isRestoringFromURL && accumulatedProducts.length === 0) {
        // If restoring from URL and no products loaded yet, start with page 1 data
        // The loadProductsUpToPage will append more products
        setAccumulatedProducts(getProducts.data);
        // Don't reset currentPage here, let loadProductsUpToPage handle it
        const totalPages =
          getProducts.total_pages || getProducts.totalPages || 0;
        setHasMoreProducts(totalPages > 1 && getProducts.data.length > 0);
      }
    } else if (
      !productsLoading &&
      (!getProducts?.data ||
        (Array.isArray(getProducts.data) && getProducts.data.length === 0))
    ) {
      // No products and not loading - only clear if we don't have accumulated products or if it's the initial load
      if (isInitialLoadRef.current || accumulatedProducts.length === 0) {
        setAccumulatedProducts([]);
        setHasMoreProducts(false);
      }
    }
    // if (urlCategoryParam) {
    //   if (
    //     urlCategoryParam === "australia" ||
    //     urlCategoryParam === "24hr-production" ||
    //     urlCategoryParam === "sales" ||
    //     urlCategoryParam === "allProducts"
    //   ) {
    //     setPaginationData((prev) => ({
    //       ...prev,
    //       category: urlCategoryParam,
    //       page: pageFromURL,
    //       limit,
    //       // preserve prev.sortOption
    //       sortOption: urlSort,
    //       colors: urlColors ? urlColors.split(",") : [],
    //       attributes:
    //         urlAttrName && urlAttrValue
    //           ? { name: urlAttrName, value: urlAttrValue }
    //           : null,
    //       pricerange:
    //         urlMinPrice && urlMaxPrice
    //           ? {
    //               min_price: Number(urlMinPrice),
    //               max_price: Number(urlMaxPrice),
    //             }
    //           : undefined,
    //       sendAttributes: false,
    //     }));
    //   } else {
    //     setPaginationData((prev) => ({
    //       ...prev,
    //       productTypeId: urlCategoryParam,
    //       category: null,
    //       limit,
    //       page: pageFromURL,
    //       sortOption: urlSort,
    //       colors: urlColors ? urlColors.split(",") : [],
    //       attributes:
    //         urlAttrName && urlAttrValue
    //           ? { name: urlAttrName, value: urlAttrValue }
    //           : null,
    //       pricerange:
    //         urlMinPrice && urlMaxPrice
    //           ? {
    //               min_price: Number(urlMinPrice),
    //               max_price: Number(urlMaxPrice),
    //             }
    //           : undefined,
    //       sendAttributes: false,
    //     }));
    //   }
    // } else if (isSearchRoute) {
    //   setPaginationData((prev) => ({
    //     ...prev,
    //     category: "search",
    //     page: pageFromURL,
    //     searchTerm: searchParams.get("search"),
    //     limit,
    //     productTypeId: searchParams.get("categoryId"),
    //     sortOption: urlSort,
    //     colors: urlColors ? urlColors.split(",") : [],
    //     attributes:
    //       urlAttrName && urlAttrValue
    //         ? { name: urlAttrName, value: urlAttrValue }
    //         : null,
    //     pricerange:
    //       urlMinPrice && urlMaxPrice
    //         ? {
    //             min_price: Number(urlMinPrice),
    //             max_price: Number(urlMaxPrice),
    //           }
    //         : undefined,
    //     sendAttributes: false,
    //   }));
    // } else {
    //   setPaginationData((prev) => ({
    //     ...prev,
    //     category: category,
    //     limit,
    //     page: pageFromURL,
    //     sortOption: urlSort,
    //     colors: urlColors ? urlColors.split(",") : [],
    //     attributes:
    //       urlAttrName && urlAttrValue
    //         ? { name: urlAttrName, value: urlAttrValue }
    //         : null,
    //     pricerange:
    //       urlMinPrice && urlMaxPrice
    //         ? {
    //             min_price: Number(urlMinPrice),
    //             max_price: Number(urlMaxPrice),
    //           }
    //         : undefined,
    //     sendAttributes: false,
    //   }));
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getProducts?.data,
    getProducts?.total_pages,
    getProducts?.totalPages,
    productsLoading,
    paginationData.page,
  ]);

  // Update limit when screen size changes (but don't reset products)
  useEffect(() => {
    const handleResize = () => {
      const newLimit = Number(searchParams.get("limit")) || 20;
      setPaginationData((prev) => {
        if (prev.limit !== newLimit) {
          return { ...prev, limit: newLimit };
        }
        return prev;
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pageLimit, setPaginationData]);

  const handleSortSelection = (option) => {
    setSortOption(option);
    // Reset accumulated products and page when sort changes
    setAccumulatedProducts([]);
    setCurrentPage(1);
    setHasMoreProducts(true);
    const currentParams = new URLSearchParams(searchParams);
    if (option === "relevancy") {
      currentParams.delete("sort");
    } else {
      currentParams.set("sort", option);
    }
    currentParams.set("page", "1");
    setSearchParams(currentParams);

    setPaginationData((prev) => ({
      ...prev,
      sortOption: option === "relevancy" ? "" : option,
      page: 1,
      sendAttributes: false,
    }));

    setIsDropdownOpen(false);
  };

  const handleViewProduct = (productId, name) => {
    // Store current page and product ID in URL for scroll restoration
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("page", currentPage.toString());
    currentParams.set("scrollTo", productId.toString());

    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    const returnUrl = `${location.pathname}?${currentParams.toString()}`;

    navigate(
      `/product/${encodeURIComponent(
        slug
      )}?ref=${encodedId}&return=${encodeURIComponent(returnUrl)}`,
      {
        state: { productId, returnUrl },
      }
    );
  };

  return (
    <>
      <div className="relative flex justify-between pt-0 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[280px] bg-gray-100">
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
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand text-base">
                  {!productsLoading &&
                    (getProducts?.item_count ||
                      getProducts?.totalCount ||
                      accumulatedProducts.length ||
                      0)}
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
                  {!productsLoading &&
                    (getProducts?.item_count ||
                      getProducts?.totalCount ||
                      accumulatedProducts.length ||
                      0)}
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
                        onClick={() => handleSortSelection("relevancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                          sortOption === "revelancy" ? "bg-gray-100" : ""
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
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 md:mt-10 mt-3 w-full"
                : ""
            }`}
          >
            {productsLoading ? (
              Array.from({ length: 20 }, (_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : accumulatedProducts?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 md:mt-5 mt-3 w-full">
                  {accumulatedProducts.map((product) => {
                    const productId = product.meta?.id?.toString();
                    return (
                      <div
                        key={product.meta.id}
                        ref={(el) => {
                          if (el && productId) {
                            productRefs.current.set(productId, el);
                          } else if (!el && productId) {
                            productRefs.current.delete(productId);
                          }
                        }}
                      >
                        <ProductCard
                          product={product}
                          favSet={favSet}
                          onViewProduct={handleViewProduct}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMoreProducts && !productsLoading && (
                  <div className="flex justify-center mt-8 mb-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
                    >
                      {isLoadingMore ? (
                        <>
                          <span>Loading...</span>
                        </>
                      ) : (
                        "View More Products"
                      )}
                    </button>
                  </div>
                )}

                {/* Product Count Display */}
                {accumulatedProducts.length > 0 && !productsLoading && (
                  <div className="flex justify-center mb-8 mt-2">
                    <p className="text-sm sm:text-base text-gray-600 text-center">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">1</span> -{" "}
                      <span className="font-semibold text-gray-900">
                        {accumulatedProducts.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900">
                        {getProducts?.item_count ||
                          getProducts?.totalCount ||
                          getProducts?.total_count ||
                          accumulatedProducts.length}
                      </span>{" "}
                      products
                    </p>
                  </div>
                )}
              </>
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
        </div>
      </div>
    </>
  );
};

export default Cards;
