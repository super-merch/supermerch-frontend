import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { backgroundColor, getProductPrice, slugify } from "@/utils/utils";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
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
import { LoadingOverlay } from "../Common";

const Cards = ({ category = "dress" }) => {
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedCategory = useSelector((state) => state.filters.categoryId);
  const [cardHover, setCardHover] = useState(null);
  const location = useLocation();

  const isAustraliaPage = category === "australia";
  const is24HrPage = category === "24hr-production";
  const isSalesPage = category === "sales";
  const isSearch = category === "search";
  const isAllProducts = category === "allProducts";
  const [searchParams, setSearchParams] = useSearchParams();
  const isSpecialPage =
    isAustraliaPage || is24HrPage || isSalesPage || isSearch;
  const urlCategoryParam = searchParams.get("category");
  const pageFromURL = parseInt(searchParams.get("page")) || 1;

  const urlType = searchParams.get("type");
  const isSearchRoute = location.pathname.includes("/search");
  const limit = 20;
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
  } = useContext(AppContext);

  // State for accumulated products and loading more
  const [accumulatedProducts, setAccumulatedProducts] = useState(
    getProducts?.data ?? []
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    paginationData?.page || paginationData?.currentPage
  );
  const prevCategoryKeyRef = useRef(null);

  const getProductsData = getProducts?.data;

  const favSet = new Set();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

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
    if (paginationData.category === "australia") {
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

  // Function to load more products
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreProducts) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await fetchProductsPage(nextPage);

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        // Append new products to accumulated products
        setAccumulatedProducts((prev) => [...prev, ...data.data]);
        setCurrentPage(nextPage);

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
          limit,
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
          limit,
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
    } else if (filtersKeyRef.current === null) {
      // Initial load - set the key
      filtersKeyRef.current = currentFiltersKey;
    }
  }, [
    paginationData.productTypeId,
    paginationData.category,
    paginationData.searchTerm,
    paginationData.sortOption,
    paginationData.pricerange,
    paginationData.colors,
  ]);

  // Update accumulated products when getProducts.data changes
  useEffect(() => {
    if (
      getProducts?.data &&
      Array.isArray(getProducts.data) &&
      !productsLoading
    ) {
      // Only update on initial load or when page is 1 (React Query always fetches page 1 first)
      if (isInitialLoadRef.current || currentPage === 1) {
        setAccumulatedProducts(getProducts.data);
        setCurrentPage(1);
        isInitialLoadRef.current = false;

        // Check if there are more products to load
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

  // Update limit when screen size changes (but don't reset products)
  useEffect(() => {
    const handleResize = () => {
      const newLimit = 20;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="relative flex justify-between pt-0 Mycontainer lg:gap-4 md:gap-4">
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
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : accumulatedProducts?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 md:mt-5 mt-3 w-full">
                  {accumulatedProducts.map((product) => {
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
