import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { IoSearchOutline } from "react-icons/io5";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import noimage from "/noimage.png";
import { AppContext } from "../../context/AppContext";
import {
  setMinPrice,
  setMaxPrice,
  setSelectedCategory,
  setSelectedBrands,
  applyFilters,
} from "../../redux/slices/filterSlice";

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

const Cards = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Price filter state and tracking
  const [fetchedPagesCount, setFetchedPagesCount] = useState(0);
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [categoryFilteredProducts, setCategoryFilteredProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [totalFilteredPages, setTotalFilteredPages] = useState(0);
  const [categoryFilteredPages, setCategoryFilteredPages] = useState(0);

  const categoryName = useSelector(
    (state) => state.filters.activeFilters.category
  );
  const cacheRef = useRef({});
  const [isResettingPriceFilter, setIsResettingPriceFilter] = useState(false);
  const categoryRequestIdRef = useRef(0);

  // State for managing batched products and pagination
  const [allProducts, setAllProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalApiPages, setTotalApiPages] = useState(0);

  // New state to track fetched pages for category products
  const [categoryPageCache, setCategoryPageCache] = useState({});

  const selectedCategory = useSelector((state) => state.filters.categoryId);

  // Get Redux filter state
  const { activeFilters, minPrice, maxPrice } = useSelector(
    (state) => state.filters
  );
  useEffect(() => {
    if (!selectedCategory) {
      fetchProductsBatch(1, sortOption);
    }
  }, [selectedCategory, sortOption]);

  // Check if price filters are active
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [count, setCount] = useState(0);

  const {
    marginApi,
    backendUrl,
    fetchParamProducts,
    paramProducts,
    skeletonLoading,
    fetchMultipleParamPages,
  } = useContext(AppContext);

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

  // Clear filter handlers
  const handleClearFilter = (filterType) => {
    if (filterType === "category") dispatch(setSelectedCategory("all"));
    if (filterType === "brand") dispatch(setSelectedBrands([]));
    if (filterType === "price") {
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));
      // Reset filtered products when clearing price filter
      setAllFilteredProducts([]);
      setCategoryFilteredProducts([]);
      setTotalFilteredPages(0);
      setCategoryFilteredPages(0);
      setFilterError("");
      setCurrentPage(1);
    }
    dispatch(applyFilters());
  };

  // Function to fetch and filter ALL products with price range
  const fetchAndFilterAllProducts = async (minPrice, maxPrice, sortOption) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      let maxPages = 3;

      // Fetch products in parallel batches
      const fetchedProducts = await fetchMultipleAllProductsPages(
        maxPages,
        100,
        sortOption
      );
      setFetchedPagesCount(maxPages);

      if (fetchedProducts && fetchedProducts.length > 0) {
        const filteredProducts = fetchedProducts.filter((product) => {
          const price = getRealPrice(product);
          if (price <= 0) return false;
          return price >= minPrice && price <= maxPrice;
        });

        if (filteredProducts.length > 0) {
          const uniqueProducts = Array.from(
            new Map(
              filteredProducts.map((product) => [product.meta?.id, product])
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
          setFilterError(
            "No products found in the specified price range. Showing previous results"
          );
        }
      } else {
        setFilterError("No products found in the specified price range");
      }
    } catch (error) {
      console.error("Error filtering all products:", error);
      setFilterError("Error fetching filtered products. Please try again.");
    } finally {
      setIsFiltering(false);
    }
  };

  // Function to fetch and filter CATEGORY products with price range
  const fetchAndFilterCategoryProducts = async (
    categoryId,
    minPrice,
    maxPrice,
    sortOption
  ) => {
    setIsFiltering(true);
    setFilterError("");

    try {
      setCurrentPage(1);
      let maxPages = 3;

      // Fetch category products in parallel batches
      const fetchedProducts = await fetchMultipleParamPages(
        categoryId,
        maxPages,
        100,
        sortOption
      );
      setFetchedPagesCount(maxPages);

      if (fetchedProducts && fetchedProducts.length > 0) {
        const filteredProducts = fetchedProducts.filter((product) => {
          const price = getRealPrice(product);
          if (price <= 0) return false;
          return price >= minPrice && price <= maxPrice;
        });

        if (filteredProducts.length > 0) {
          const uniqueProducts = Array.from(
            new Map(
              filteredProducts.map((product) => [product.meta?.id, product])
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

          setCategoryFilteredProducts(sortedProducts);
          setCategoryFilteredPages(
            Math.ceil(sortedProducts.length / itemsPerPage)
          );
        } else {
          setFilterError(
            "No products found in the specified price range. Showing previous results"
          );
        }
      } else {
        setFilterError("No products found in the specified price range");
      }
    } catch (error) {
      console.error("Error filtering category products:", error);
      setFilterError("Error fetching filtered products. Please try again.");
    } finally {
      setIsFiltering(false);
    }
  };

  // Helper function to fetch multiple pages for all products
  const fetchMultipleAllProductsPages = async (
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    try {
      const endPage = startPage + maxPages - 1;
      const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      const fetchPromises = pageNumbers.map(async (page) => {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products?page=${page}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) return { data: [] };
        return await response.json();
      });

      const results = await Promise.allSettled(fetchPromises);
      const allProducts = [];

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.data) {
          allProducts.push(...result.value.data);
        }
      });

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple all product pages:", error);
      return [];
    }
  };

  // Fetch more products for price filtering
  const fetchMoreFilteredProducts = async () => {
    if (isFiltering) return;

    setIsFiltering(true);

    try {
      const startPage = fetchedPagesCount + 1;
      const pagesToFetch = 3;

      let additionalProducts;
      if (selectedCategory) {
        additionalProducts = await fetchMultipleParamPages(
          selectedCategory,
          pagesToFetch,
          100,
          sortOption,
          startPage
        );
      } else {
        additionalProducts = await fetchMultipleAllProductsPages(
          pagesToFetch,
          100,
          sortOption,
          startPage
        );
      }

      if (additionalProducts && additionalProducts.length > 0) {
        const currentFilteredProducts = selectedCategory
          ? categoryFilteredProducts
          : allFilteredProducts;
        const existingIds = new Set(
          currentFilteredProducts.map((p) => p.meta?.id)
        );

        const newFilteredProducts = additionalProducts.filter((product) => {
          const price = getRealPrice(product);
          const isInPriceRange =
            price >= minPrice && price <= maxPrice && price > 0;
          const notDuplicate = !existingIds.has(product.meta?.id);
          return isInPriceRange && notDuplicate;
        });

        if (newFilteredProducts.length > 0) {
          const sortedNewProducts = sortOption
            ? [...newFilteredProducts].sort((a, b) => {
                const priceA = getRealPrice(a);
                const priceB = getRealPrice(b);
                return sortOption === "lowToHigh"
                  ? priceA - priceB
                  : priceB - priceA;
              })
            : newFilteredProducts;

          if (selectedCategory) {
            const updatedProducts = [
              ...categoryFilteredProducts,
              ...sortedNewProducts,
            ];
            setCategoryFilteredProducts(updatedProducts);
            setCategoryFilteredPages(
              Math.ceil(updatedProducts.length / itemsPerPage)
            );
          } else {
            const updatedProducts = [
              ...allFilteredProducts,
              ...sortedNewProducts,
            ];
            setAllFilteredProducts(updatedProducts);
            setTotalFilteredPages(
              Math.ceil(updatedProducts.length / itemsPerPage)
            );
          }
        }

        setFetchedPagesCount((prev) => prev + pagesToFetch);
      }
    } catch (error) {
      console.error("Error fetching more products:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Check if user is near the end and needs more products (for price filtering)
  useEffect(() => {
    if (isPriceFilterActive) {
      const currentFilteredProducts = selectedCategory
        ? categoryFilteredProducts
        : allFilteredProducts;
      const currentFilteredPages = selectedCategory
        ? categoryFilteredPages
        : totalFilteredPages;

      if (currentFilteredProducts.length > 0) {
        const isNearEnd = currentPage >= currentFilteredPages - 1;
        const hasRoomForMore = currentFilteredProducts.length < 200;

        if (isNearEnd && hasRoomForMore) {
          fetchMoreFilteredProducts();
        }
      }
    }
  }, [
    currentPage,
    isPriceFilterActive,
    totalFilteredPages,
    categoryFilteredPages,
  ]);

  // Handle price filter changes
  useEffect(() => {
    // Don't apply price filters if we're currently switching categories or resetting
    if (isSwitchingCategory || isResettingPriceFilter) return;

    if (isPriceFilterActive) {
      if (selectedCategory) {
        setCurrentPage(1);
        fetchAndFilterCategoryProducts(
          selectedCategory,
          minPrice,
          maxPrice,
          sortOption
        );
      } else {
        setCurrentPage(1);
        fetchAndFilterAllProducts(minPrice, maxPrice, sortOption);
      }
    } else {
      // Reset filtered products when no price filter is active
      setCurrentPage(1);
      setAllFilteredProducts([]);
      setCategoryFilteredProducts([]);
      setTotalFilteredPages(0);
      setCategoryFilteredPages(0);
      setFilterError("");
      setFetchedPagesCount(0);
    }
  }, [
    minPrice,
    maxPrice,
    sortOption,
    selectedCategory,
    isPriceFilterActive,
    isSwitchingCategory,
    isResettingPriceFilter,
  ]);

  // Handle category selection - fetch category-specific products
  useEffect(() => {
    console.log("Selected Category ID:", selectedCategory);

    // Reset visible products and pagination immediately (UI)
    setCategoryProducts([]);
    setCategoryFilteredProducts([]);
    setCurrentPage(1);
    setIsSwitchingCategory(true);
    setError("");

    // Clear price filters immediately and reset filtered products state
    setAllFilteredProducts([]);
    setCategoryFilteredProducts([]);
    setTotalFilteredPages(0);
    setCategoryFilteredPages(0);
    setFilterError("");
    setFetchedPagesCount(0);

    // Set flag to indicate we're resetting price filters
    setIsResettingPriceFilter(true);

    // Clear price filters in Redux
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  }, [selectedCategory]);
  useEffect(() => {
    if (!isResettingPriceFilter) return;

    // Reset the flag
    setIsResettingPriceFilter(false);

    // If no category selected, load all-products
    if (!selectedCategory) {
      cacheRef.current = {};
      setCategoryPageCache({});
      if (allProducts.length === 0) {
        fetchProductsBatch(1, sortOption);
      }
      setIsSwitchingCategory(false);
      return;
    }

    // If category selected -> fetch page 1
    categoryRequestIdRef.current += 1;
    const requestId = categoryRequestIdRef.current;

    // Check cache
    const cached = cacheRef.current[selectedCategory]?.[1];
    if (cached) {
      setCategoryProducts(cached);
      setIsSwitchingCategory(false);
      return;
    }

    // Show skeleton while fetching
    setIsLoading(true);
    setError("");

    // Fetch category products
    fetchCategoryProducts(selectedCategory, 1, requestId);
    setIsSwitchingCategory(false);
  }, [isResettingPriceFilter, selectedCategory, sortOption]);

  // Function to fetch category-specific products (original logic)
  const fetchCategoryProducts = async (
    categoryId,
    page = 1,
    requestId = null
  ) => {
    if (isPriceFilterActive) return; // Skip if price filter is active

    const categoryCache = cacheRef.current[categoryId];
    if (categoryCache && categoryCache[page]) {
      setCategoryProducts(categoryCache[page]);
      return;
    }

    setError("");
    try {
      const response = await fetchParamProducts(categoryId, page);

      if (requestId && requestId !== categoryRequestIdRef.current) {
        return;
      }

      if (!response || !response.data) {
        throw new Error("Unexpected response");
      }

      const validProducts = response.data.filter((product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((g) => g?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        return priceBreaks.length > 0 && priceBreaks[0]?.price > 0;
      });

      cacheRef.current[categoryId] = {
        ...(cacheRef.current[categoryId] || {}),
        [page]: validProducts,
      };

      setCategoryPageCache((prev) => ({
        ...(prev || {}),
        [categoryId]: {
          ...(prev[categoryId] || {}),
          [page]: validProducts,
        },
      }));

      setCategoryProducts(validProducts);

      if (response.total_pages) {
        setTotalApiPages(response.total_pages);
      }
    } catch (err) {
      console.error("Error fetching category products:", err);
      setError("Error fetching category products. Please try again.");
    } finally {
      if (!requestId || requestId === categoryRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Function to fetch products in batches of 100 (for all products) - original logic
  const fetchProductsBatch = async (apiPage = 1, sortOption = "") => {
    if (isPriceFilterActive) return; // Skip if price filter is active

    setIsLoading(true);
    setError("");

    try {
      const limit = 100;
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/client-products?page=${apiPage}&limit=${limit}&sort=${sortOption}&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      if (!data || !data.data) {
        setIsLoading(false);
        throw new Error("Unexpected API response structure");
      }
      setCount(data.item_count);

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

      if (apiPage === 1) {
        setAllProducts(validProducts);
      } else {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.meta?.id));
          const newProducts = validProducts.filter(
            (product) => !existingIds.has(product.meta?.id)
          );
          return [...prev, ...newProducts];
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error fetching products. Please try again.");
      setIsLoading(false);
    }
  };

  // Get the current active products based on mode and price filter
  const getActiveProducts = () => {
    if (isPriceFilterActive) {
      return selectedCategory ? categoryFilteredProducts : allFilteredProducts;
    }
    return selectedCategory ? categoryProducts : allProducts;
  };

  // Apply sorting to active products
  const getSortedProducts = () => {
    const activeProducts = getActiveProducts();
    if (!sortOption || isPriceFilterActive) return activeProducts; // Skip sorting if price filter handles it

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

  // Calculate total pages based on current products and mode
  const getTotalPages = () => {
    if (isPriceFilterActive) {
      return selectedCategory ? categoryFilteredPages : totalFilteredPages;
    }

    if (selectedCategory) {
      return totalApiPages;
    } else {
      const sortedProducts = getSortedProducts();
      return Math.ceil(sortedProducts.length / itemsPerPage);
    }
  };

  // Handle sort changes
  useEffect(() => {
    // Don't change sort if we're currently switching categories
    if (isSwitchingCategory) return;

    if (isPriceFilterActive) {
      // Price filter handles sorting, just reset page
      setCurrentPage(1);
      return;
    }

    if (selectedCategory) {
      setCategoryPageCache({});
      setCurrentPage(1);
      fetchCategoryProducts(selectedCategory, 1);
    } else {
      fetchProductsBatch(1, sortOption);
      setCurrentPage(1);
    }
  }, [sortOption, isSwitchingCategory]);

  // Initial fetch when component mounts (only if no category is selected and no price filter)
  useEffect(() => {
    if (!selectedCategory && allProducts.length === 0 && !isPriceFilterActive) {
      fetchProductsBatch(1, sortOption);
    }
  }, []);

  // Handle page changes
  useEffect(() => {
    if (selectedCategory && currentPage > 0 && !isPriceFilterActive) {
      fetchCategoryProducts(selectedCategory, currentPage);
    }
  }, [currentPage, selectedCategory]);

  // Get current page products
  const getCurrentPageProducts = () => {
    const sortedProducts = getSortedProducts();

    if (isPriceFilterActive) {
      // For price filtered products, use client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedProducts.slice(startIndex, endIndex);
    }

    if (selectedCategory) {
      // For category products, return all products as they are already paginated
      return sortedProducts;
    } else {
      // For all products with client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedProducts.slice(startIndex, endIndex);
    }
  };

  // Fetch more products for infinite scroll (only for all products without price filter)
  const fetchMoreProducts = async () => {
    if (isLoading || selectedCategory || isPriceFilterActive) return;

    try {
      const nextApiPage = currentApiPage + 1;
      setCurrentApiPage(nextApiPage);
      await fetchProductsBatch(nextApiPage, sortOption);
    } catch (error) {
      console.error("Error fetching more products:", error);
    }
  };

  // Check if we need to fetch more products when near the end (only for all products without price filter)
  useEffect(() => {
    if (!selectedCategory && allProducts.length > 0 && !isPriceFilterActive) {
      const totalPages = getTotalPages();
      const isNearEnd = currentPage >= totalPages - 1;
      const hasRoomForMore = allProducts.length < 500;

      if (isNearEnd && hasRoomForMore && !isLoading) {
        fetchMoreProducts();
      }
    }
  }, [
    currentPage,
    allProducts.length,
    selectedCategory,
    isLoading,
    isPriceFilterActive,
  ]);

  // Rest of the useEffects remain the same...
  useEffect(() => {
    if (selectedCategory) {
      setCurrentPage(1);
    }
  }, [selectedCategory]);

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

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
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

  // Calculate total count for display
  const getTotalCount = () => {
    if (isPriceFilterActive) {
      const currentFilteredProducts = selectedCategory
        ? categoryFilteredProducts
        : allFilteredProducts;
      return currentFilteredProducts.length;
    } else {
      return paramProducts.item_count || count;
    }
  };

  const currentPageProducts = getCurrentPageProducts();
  const totalPages = getTotalPages();
  const showSkeleton =
    isLoading || skeletonLoading || isSwitchingCategory || isFiltering;

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[25%]">
          <Sidebar />
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4 mt-16">
          <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
            <div className="flex items-center justify-between px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
              {/* Search input removed as per requirements */}
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
              {categoryName && (
                <div className="filter-item">
                  <span className="text-md font-semibold">{categoryName}</span>

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
                {!isLoading &&
                  !skeletonLoading &&
                  !isFiltering &&
                  getTotalCount()}
              </span>
              <p className="">
                {isLoading || isFiltering
                  ? "Loading..."
                  : `Results found ${
                      selectedCategory ? "(Category)" : "(All Products)"
                    }${isPriceFilterActive ? " (Price filtered)" : ""}`}
                {isFiltering && " Please wait a while..."}
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
              showSkeleton && getActiveProducts().length === 0
                ? "grid grid-cols-3 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1"
                : ""
            }`}
          >
            {showSkeleton ||
            skeletonLoading ||
            (isLoading && getActiveProducts().length === 0) ? (
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

                  minPrice += marginFlat;
                  maxPrice += marginFlat;

                  const discountPct = product.discountInfo?.discount || 0;
                  const isGlobalDiscount =
                    product.discountInfo?.isGlobal || false;

                  return (
                    <div
                      key={productId}
                      className="relative border border-border2 cursor-pointer max-h-[280px] sm:max-h-[350px] h-full group"
                      onClick={() => handleViewProduct(product.meta.id)}
                    >
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

                      <div className="absolute top-2 right-2 z-20">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add your favorite logic here
                          }}
                          className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                        >
                          <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                        </div>
                      </div>

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
                                        .replace(" ", "") ||
                                      color.toLowerCase(),
                                  }}
                                  className="w-4 h-4 rounded-sm border border-slate-900"
                                />
                              ))
                            )}
                      </div>

                      <div className="p-2">
                        <div className="text-center">
                          <h2 className="text-sm sm:text-lg font-semibold text-brand leading-tight">
                            {product.overview.name &&
                            product.overview.name.length > 20
                              ? product.overview.name.slice(0, 20) + "..."
                              : product.overview.name || "No Name"}
                          </h2>

                          <p className="text-xs text-gray-500">
                            {product.product?.prices?.price_groups[0]
                              ?.base_price?.price_breaks[0]?.qty || 1}{" "}
                            minimum quantity
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
                  No Product Found
                </p>
              </div>
            )}
          </div>

          {(totalPages > 1 || (currentPageProducts.length <= itemsPerPage && hasMoreProducts)) && (
  <div className="flex items-center justify-center mt-16 space-x-2 pagination">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="flex items-center justify-center w-10 h-10 border rounded-full"
    >
      <IoMdArrowBack className="text-xl" />
    </button>

    {/* Always show current page */}
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

    {/* Show page 2 button when there's only one page but might be more products */}
    {totalPages === 1 && hasMoreProducts && (
      <button
        onClick={() => {
          setCurrentPage(2);
          if (isPriceFilterActive) {
            fetchMoreFilteredProducts();
          } else if (!selectedCategory) {
            fetchMoreProducts();
          }
        }}
        className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-200"
      >
        2
      </button>
    )}

    {/* Show normal pagination when there are multiple pages */}
    {totalPages > 1 &&
      getPaginationButtons(
        currentPage,
        totalPages,
        maxVisiblePages
      )
      .filter(page => page > 1) // Skip page 1 since we always show it
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

    <button
      onClick={() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        // Fetch more products if we're at the end
        if (currentPage === totalPages && hasMoreProducts) {
          if (isPriceFilterActive) {
            fetchMoreFilteredProducts();
          } else if (!selectedCategory) {
            fetchMoreProducts();
          }
        }
      }}
      disabled={currentPage === totalPages && !hasMoreProducts}
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

export default Cards;
