import { setMaxPrice, setMinPrice } from "@/redux/slices/filterSlice";
import { slugify } from "@/utils/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPageTypeFromRoute } from "../../config/sidebarConfig";
import { AppContext } from "../../context/AppContext";
import { ProductsContext } from "../../context/ProductsContext";
import EmptyState from "../Common/EmptyState";
import ProductCard from "../Common/ProductCard";
import SkeletonLoadingCards from "../Common/SkeletonLoadingCards";
import UnifiedSidebar from "../shared/UnifiedSidebar";
const Cards = ({ category = "" }) => {
<<<<<<< HEAD
=======

>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const urlCategoryParam = searchParams.get("category");
  const pageFromURL = Number(searchParams.get("page")) || 1;
  const urlSort = searchParams.get("sort") || "";
  const urlColors = searchParams.get("colors");
  const urlAttrNames = searchParams.getAll("attrName");
  const urlAttrValues = searchParams.getAll("attrValue");
  const urlAttributes = urlAttrNames
    .map((name, idx) => ({
      name,
      value: (urlAttrValues[idx] || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .join(","),
    }))
    .filter((attr) => attr.name && attr.value);
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");
  const scrollToProductId = searchParams.get("scrollTo");

  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;
  const isSearchRoute = location.pathname.includes("/search");
  const pageType = getPageTypeFromRoute(location.pathname);
  const limit = parseInt(searchParams.get("limit")) || 20;
  const pageLimit = limit;

  const {
    paginationData,
    setPaginationData,
    getProducts,
    productsLoading,
    productsFetching,
  } = useContext(ProductsContext);
  const isProductsLoading = productsLoading || productsFetching;
  const { backendUrl } = useContext(AppContext);

  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
<<<<<<< HEAD

=======
>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
  const [accumulatedProducts, setAccumulatedProducts] = useState(
    getProducts?.data ?? []
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    pageFromURL || paginationData?.page || paginationData?.currentPage
  );

  const dropdownRef = useRef(null);
  const prevCategoryKeyRef = useRef(null);
  const filtersKeyRef = useRef(null);
  const paginationModeRef = useRef("unknown");
  const productRefs = useRef(new Map());
  const hasScrolledRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const favSet = new Set();
<<<<<<< HEAD
=======

>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
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
    });

    if (Array.isArray(paginationData.attributes) && paginationData.attributes.length > 0) {
      paginationData.attributes.forEach((attr) => {
        params.append("attribute_name", attr.name);
        params.append("attribute_value", attr.value);
      });
    } else if (paginationData.attributes?.name && paginationData.attributes?.value) {
      params.append("attribute_name", paginationData.attributes.name);
      params.append("attribute_value", paginationData.attributes.value);
    }

    let url = "";
    let searchTerms = ["gift pack", "hampers", "gift"];
    if (paginationData.category === "return-gifts") {
      url = `${backendUrl}/api/client-products/search?searchTerms=${searchTerms.join(
        ","
      )}&page=${page}&limit=${limit}`;
    } else if (paginationData.category === "australia") {
      url = `${backendUrl}/api/australia/get-products?${params.toString()}`;
    } else if (paginationData.category === "24hr-production") {
      url = `${backendUrl}/api/24hour/get-products?${params.toString()}`;
    } else if (paginationData.category === "sales") {
      url = `${backendUrl}/api/client-products-discounted?${params.toString()}`;
    } else if (paginationData.category === "allProducts") {
      url = `${backendUrl}/api/client-products?${params.toString()}`;
    } else if (paginationData.category === "search") {
      url = `${backendUrl}/api/client-products/search?${params.toString()}`;
    } else if (paginationData.category) {
      url = `${backendUrl}/api/client-products/category?${params.toString()}`;
    } else if (paginationData.productTypeId) {
      url = `${backendUrl}/api/params-products?${params.toString()}`;
    } else {
      url = `${backendUrl}/api/client-products?${params.toString()}`;
    }
    return url;
  };

  const fetchProductsPage = async (page, limitOverride) => {
    const effectiveLimit = limitOverride ?? 20;
    const url = buildApiUrl(page, effectiveLimit);

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
    const currentLimit =
      Number(searchParams.get("limit")) || paginationData?.limit || 20;
    setIsLoadingMore(true);
    try {
      if (paginationModeRef.current !== "limit") {
        const nextPage = currentPage + 1;
        const pageData = await fetchProductsPage(nextPage, currentLimit);
        if (pageData?.data && Array.isArray(pageData.data)) {
          const existingIds = new Set(
            accumulatedProducts
              .map((product) => product.meta?.id ?? product.product?.id ?? product.id)
              .filter(Boolean)
          );
          const fresh = pageData.data.filter((product) => {
            const id = product.meta?.id ?? product.product?.id ?? product.id;
            return id ? !existingIds.has(id) : true;
          });
          if (fresh.length > 0) {
            paginationModeRef.current = "page";
            setAccumulatedProducts((prev) => [...prev, ...fresh]);
            setCurrentPage(nextPage);
            setSearchParams((prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.set("page", nextPage.toString());
              nextParams.set("limit", currentLimit.toString());
              return nextParams;
            });
            const totalPages = pageData.total_pages || pageData.totalPages || 0;
            if (totalPages && nextPage >= totalPages) {
              setHasMoreProducts(false);
            }
            return;
          }
        }
        paginationModeRef.current = "limit";
      }

      const newLimit = currentLimit + 20;
      const data = await fetchProductsPage(1, newLimit);

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setAccumulatedProducts(data.data);
        setCurrentPage(1);
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set("page", "1");
          nextParams.set("limit", newLimit.toString());
          return nextParams;
        });

        const totalCount =
          data.item_count ||
          data.totalCount ||
          data.total_count ||
          data.meta?.total ||
          data.data.length;
        setHasMoreProducts(data.data.length < totalCount);
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

<<<<<<< HEAD
=======

>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
  useEffect(() => {
    const paramsFromLocation = new URLSearchParams(location.search);
    paramsFromLocation.delete("page");
    paramsFromLocation.delete("limit");
    paramsFromLocation.delete("scrollTo");
    const currentCategoryKey = `${location.pathname}|${category}|${paramsFromLocation.toString()}`;
    const categoryChanged = prevCategoryKeyRef.current !== currentCategoryKey;
    prevCategoryKeyRef.current = currentCategoryKey;

    if (categoryChanged) {
      const shouldPreservePagination = pageFromURL > 1 || pageLimit > 20;
      paginationModeRef.current = "unknown";
<<<<<<< HEAD
      setAccumulatedProducts([]);
      setCurrentPage(1);
      setHasMoreProducts(true);
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        const before = nextParams.toString();
        nextParams.set("page", "1");
        nextParams.delete("scrollTo");
        if (nextParams.toString() === before) {
          return prev;
        }
        return nextParams;
      }, { replace: true });
=======

      const effectiveLimit = shouldPreservePagination
        ? (pageFromURL > 1 ? pageFromURL * pageLimit : pageLimit)
        : pageLimit;

      if (shouldPreservePagination) {
        setCurrentPage(1);
        setHasMoreProducts(true);
        const preserveParams = new URLSearchParams(searchParams);
        preserveParams.set("page", "1");
        preserveParams.set("limit", effectiveLimit.toString());
        setSearchParams(preserveParams, { replace: true });
      } else {
        setAccumulatedProducts([]);
        setCurrentPage(1);
        setHasMoreProducts(true);
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set("page", "1");
        currentParams.delete("scrollTo");
        setSearchParams(currentParams, { replace: true });
      }
>>>>>>> 4517ac6 (products page retention and scroll retention fixed)

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
          urlCategoryParam === "return-gifts" ||
          urlCategoryParam === "allProducts"
        ) {
          setPaginationData((prev) => ({
            ...prev,
            category: urlCategoryParam,
            productTypeId: null,
            page: 1,
            limit: effectiveLimit,
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
            category: null,
            searchTerm: "",
            sendAttributes: true,
            limit: effectiveLimit,
            page: 1,
            sortOption: urlSort,
            colors: urlColors ? urlColors.split(",") : [],
            attributes: urlAttributes.length > 0 ? urlAttributes : null,
            pricerange:
              urlMinPrice && urlMaxPrice
                ? { min_price: Number(urlMinPrice), max_price: Number(urlMaxPrice) }
                : undefined,
          }));
        }
      } else if (isSearchRoute) {
        setPaginationData((prev) => ({
          ...prev,
          category: "search",
          page: 1,
          sendAttributes: true,
          limit: effectiveLimit,
          searchTerm: searchParams.get("search") || "",
          productTypeId: searchParams.get("categoryId"),
          sortOption: urlSort,
          colors: urlColors ? urlColors.split(",") : [],
          attributes: urlAttributes.length > 0 ? urlAttributes : null,
          pricerange:
            urlMinPrice && urlMaxPrice
              ? {
                min_price: Number(urlMinPrice),
                max_price: Number(urlMaxPrice),
              }
              : undefined,
        }));
      } else {
        const isTopLevel = ["promotional", "clothing", "headwear", "dress"].includes(category);
        setPaginationData((prev) => ({
          ...prev,
          category: isTopLevel ? null : category,
          productTypeId: null,
          searchTerm: "",
          page: 1,
          limit: effectiveLimit,
          sortOption: urlSort,
          colors: urlColors ? urlColors.split(",") : [],
          attributes: urlAttributes.length > 0 ? urlAttributes : null,
          pricerange:
            urlMinPrice && urlMaxPrice
              ? { min_price: Number(urlMinPrice), max_price: Number(urlMaxPrice) }
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

  useEffect(() => {
    const currentFiltersKey = `${paginationData.productTypeId}-${paginationData.category
      }-${paginationData.searchTerm}-${paginationData.sortOption
      }-${JSON.stringify(paginationData.pricerange)}-${JSON.stringify(
        paginationData.colors
      )}`;

    if (
      filtersKeyRef.current !== null &&
      filtersKeyRef.current !== currentFiltersKey
    ) {
      filtersKeyRef.current = currentFiltersKey;
      isInitialLoadRef.current = true;
      setAccumulatedProducts([]);
      setCurrentPage(1);
      setHasMoreProducts(true);
<<<<<<< HEAD
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        const before = nextParams.toString();
        nextParams.set("page", "1");
        nextParams.delete("scrollTo");
        if (nextParams.toString() === before) {
          return prev;
        }
        return nextParams;
      }, { replace: true });
=======
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", "1");
      currentParams.delete("scrollTo");
      setSearchParams(currentParams, { replace: true });
>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
    } else if (filtersKeyRef.current === null) {
      filtersKeyRef.current = currentFiltersKey;
    }
  }, [
    paginationData.productTypeId,
    paginationData.category,
    paginationData.searchTerm,
  ]);

  useEffect(() => {
    if (
      scrollToProductId &&
      !hasScrolledRef.current &&
      accumulatedProducts.length > 0 &&
      !isProductsLoading &&
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
<<<<<<< HEAD

=======
>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
          const currentParams = new URLSearchParams(searchParams);
          currentParams.delete("scrollTo");
          setSearchParams(currentParams, { replace: true });
        }, 300);
      }
    }
  }, [
    scrollToProductId,
    accumulatedProducts,
    isProductsLoading,
    isLoadingMore,
<<<<<<< HEAD
=======

>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
  ]);

  useEffect(() => {
    if (!scrollToProductId) {
      hasScrolledRef.current = false;
    }
  }, [scrollToProductId]);

  useEffect(() => {
    if (
      getProducts?.data &&
      Array.isArray(getProducts.data) &&
      !isProductsLoading
    ) {
<<<<<<< HEAD
      const urlPage = parseInt(searchParams.get("page")) || 1;
      const isRestoringFromURL = urlPage > 1;

      const effectivePage = paginationData.page ?? 1;
      if (
        ((isInitialLoadRef.current || effectivePage === 1) && !isRestoringFromURL)
      ) {
        setAccumulatedProducts(getProducts.data);
        setCurrentPage(1);
        isInitialLoadRef.current = false;


        const totalPages =
          getProducts.total_pages || getProducts.totalPages || 0;
        setHasMoreProducts(totalPages > 1 && getProducts.data.length > 0);
      } else if (isRestoringFromURL && accumulatedProducts.length === 0) {
        setAccumulatedProducts(getProducts.data);
=======
      setAccumulatedProducts(getProducts.data);
      isInitialLoadRef.current = false;

      const totalCount =
        getProducts.item_count ||
        getProducts.totalCount ||
        getProducts.total_count ||
        0;
      if (totalCount > 0) {
        setHasMoreProducts(getProducts.data.length < totalCount);
      } else {
>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
        const totalPages =
          getProducts.total_pages || getProducts.totalPages || 0;
        setHasMoreProducts(totalPages > 1 && getProducts.data.length > 0);
      }
    } else if (
      !isProductsLoading &&
      (!getProducts?.data ||
        (Array.isArray(getProducts.data) && getProducts.data.length === 0))
    ) {
      if (isInitialLoadRef.current || accumulatedProducts.length === 0) {
        setAccumulatedProducts([]);
        setHasMoreProducts(false);
      }
    }
  }, [
    getProducts?.data,
    getProducts?.item_count,
    getProducts?.totalCount,
    getProducts?.total_count,
    isProductsLoading,
  ]);

<<<<<<< HEAD
=======
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

>>>>>>> 4517ac6 (products page retention and scroll retention fixed)
  const handleSortSelection = (option) => {
    setSortOption(option);
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
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("page", currentPage.toString());
    currentParams.set("scrollTo", productId.toString());

    const encodedId = btoa(productId);
    const slug = slugify(name);
    const returnUrl = `${location.pathname}?${currentParams.toString()}`;

    // Replace current history entry with scrollTo so browser back preserves scroll
    navigate(returnUrl, { replace: true });

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
          <div className="lg:hidden">
            <div className="flex items-center justify-between w-full mb-4">
              <button
                onClick={() => {
                  const sidebarToggle = document.querySelector(
                    "[data-sidebar-toggle]"
                  );
                  if (sidebarToggle) sidebarToggle.click();
                }}
                className="flex items-center justify-center rounded-lg text-black border border-gray-300 bg-white py-1 px-2 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Filters
              </button>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-2 py-1 border w-40 border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 transition-colors"
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
                        className={`w-full text-left text-sm px-4 py-1.5 hover:bg-gray-50 rounded-t-lg ${sortOption === "lowToHigh" ? "bg-gray-50" : ""
                          }`}
                      >
                        Lowest to Highest
                      </button>
                      <button
                        onClick={() => handleSortSelection("highToLow")}
                        className={`w-full text-left text-sm px-4 py-1.5 hover:bg-gray-50 ${sortOption === "highToLow" ? "bg-gray-50" : ""
                          }`}
                      >
                        Highest to Lowest
                      </button>
                      <button
                        onClick={() => handleSortSelection("relevancy")}
                        className={`w-full text-left text-sm px-4 py-1.5 hover:bg-gray-50 rounded-b-lg ${sortOption === "relevancy" ? "bg-gray-50" : ""
                          }`}
                      >
                        Relevancy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand text-base">
                  {!isProductsLoading &&
                    (getProducts?.item_count ||
                      getProducts?.totalCount ||
                      accumulatedProducts.length ||
                      0)}
                </span>
                <p className="text-sm text-gray-600">
                  {isProductsLoading ? "Loading..." : `product found `}
                  {isProductsLoading && " Please wait a while..."}
                  {isPriceFilterActive && !isProductsLoading
                    ? `between $${minPrice} and $${maxPrice}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-brand">
                  {!isProductsLoading &&
                    (getProducts?.item_count ||
                      getProducts?.totalCount ||
                      accumulatedProducts.length ||
                      0)}
                </span>
                <p className="">
                  {isProductsLoading ? "Loading..." : `product found`}
                  {isProductsLoading && " Please wait a while..."}
                  {isPriceFilterActive && !isProductsLoading
                    ? ` between $${minPrice} and $${maxPrice}`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p>Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-4 py-3 border w-48 md:w-52 bg-white rounded-lg"
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
                    <div className="absolute left-0 z-50 w-full mt-2 bg-white border top-full border-border2">
                      <button
                        onClick={() => handleSortSelection("lowToHigh")}
                        className={`w-full text-left text-sm px-4 py-3 hover:bg-gray-100 ${sortOption === "lowToHigh" ? "bg-gray-100" : ""
                          }`}
                      >
                        Lowest to Highest
                      </button>
                      <button
                        onClick={() => handleSortSelection("highToLow")}
                        className={`w-full text-left text-sm px-4 py-3 hover:bg-gray-100 ${sortOption === "highToLow" ? "bg-gray-100" : ""
                          }`}
                      >
                        Highest to Lowest
                      </button>
                      <button
                        onClick={() => handleSortSelection("relevancy")}
                        className={`w-full text-left text-sm px-4 py-3 hover:bg-gray-100 ${sortOption === "relevancy" ? "bg-gray-100" : ""
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
            className={`${isProductsLoading
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 md:mt-10 mt-3 w-full"
              : ""
              }`}
          >
            {isProductsLoading ? (
              Array.from({ length: 20 }, (_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : accumulatedProducts?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 md:mt-5 mt-3 w-full">
                  {accumulatedProducts.map((product, index) => {
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
                          priority={index < 4}
                        />
                      </div>
                    );
                  })}
                </div>

                {hasMoreProducts && !isProductsLoading && (
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

                {accumulatedProducts.length > 0 && !isProductsLoading && (
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
