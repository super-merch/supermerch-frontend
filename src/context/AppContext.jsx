import { createContext, useEffect, useRef, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  clearFavourites,
  loadFavouritesFromDB,
} from "@/redux/slices/favouriteSlice";
import { clearCart } from "@/redux/slices/cartSlice";
import { clearCurrentUser } from "@/redux/slices/cartSlice";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backednUrl = import.meta.env.VITE_BACKEND_URL;
  const [filterLocalProducts, setFilterLocalProducts] = useState([]);
  const [activeFilterCategory, setActiveFilterCategory] = useState(null);
  const [sidebarActiveCategory, setSidebarActiveCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [productsCache, setProductsCache] = useState(null);
  const [isCacheValid, setIsCacheValid] = useState(false);

  const [sidebarActiveLabel, setSidebarActiveLabel] = useState(null);
  const paramProductsCacheRef = useRef({});
  const pendingParamRequestsRef = useRef({});
  const pendingParamMultiRequestsRef = useRef({});
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );

  const [blogs, setBlogs] = useState([]);

  const getGlobalDiscount = async () => {
    try {
      const response = await axios.get(
        `${backednUrl}/api/add-discount/global-discount`
      );
      if (response.data.data) {
        setGlobalDiscount(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching global discount:", error);
      return null;
    }
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(clearFavourites());
    dispatch(clearCurrentUser());
    setToken("");
    googleLogout();
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    navigate("/login");
  };
  const [shippingAddressData, setShippingAddressData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    addressLine: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
    email: "",
    phone: "",
  });
  const [addressData, setAddressData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    addressLine: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
  });

  const [userOrder, setUserOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  // const [sliderLoading,setSliderLoading] = useState(true)
  const [fetchedPagesCount, setFetchedPagesCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newId, setNewId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const [totalApiPages, setTotalApiPages] = useState(0);
  const [selectedParamCategoryId, setSelectedParamCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopCategory, setShopCategory] = useState(null);

  const options = { day: "2-digit", month: "short", year: "numeric" };

  const loadUserOrder = async () => {
    try {
      const { data } = await axios.get(
        `${backednUrl}/api/checkout/user-order`,
        { headers: { token } }
      );
      if (data.success) {
        setUserOrder(data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebUser = async () => {
    try {
      const { data } = await axios.get(`${backednUrl}/api/auth/get-web-user`, {
        headers: { token },
      });
      if (data.success) {
        if (data.user.defaultAddress) {
          setAddressData(data.user.defaultAddress);
        }
        if (data.user.defaultShippingAddress) {
          setShippingAddressData(data.user.defaultShippingAddress);
        }
        if (data.success) {
          setUserData(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("An error occurred while fetching the address.");
      handleLogout();
    }
  };
  const [productsCategory, setProductsCategory] = useState([]);
  const fetchProductsCategory = async (category, page = 1, sort = "") => {
    setSkeletonLoading(true);
    try {
      const limit = 10;
      // Fixed: Removed duplicate ? and properly formatted query string
      const response = await fetch(
        `${backednUrl}/api/client-products/category?category=${category}&page=${page}&limit=${limit}&sort=${sort}&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setProductsCategory(data.data);
      setSkeletonLoading;
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching category products:", err);
      setSkeletonLoading(false);
      setError(err.message);
    }
  };

  // *************************************************Client paginate api

  const fetchProducts = async (page = 1, sort = "", limit) => {
    // Check if cache exists and is valid
    if (productsCache && isCacheValid) {
      setProducts(productsCache);
      return;
    }

    setSkeletonLoading(true);
    try {
      if (!limit) limit = 100; // Default to 100 if limit is not provided
      const response = await fetch(
        `${backednUrl}/api/client-products?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        setSkeletonLoading(false);
        throw new Error("Unexpected API response structure");
      }

      // Store in both products state and cache
      setProducts(data.data);
      setProductsCache(data.data);
      setIsCacheValid(true);
      setSkeletonLoading(false);

      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
      setSkeletonLoading(false);
    }
  };

  // Add a function to clear cache (optional - can be called when needed)
  const clearProductsCache = () => {
    setProductsCache(null);
    setIsCacheValid(false);
  };
  // In your AppContext:

  const [searchedProducts, setSearchedProducts] = useState([]);
  // Add this method to your AppContext

  const fetchMultipleSearchPages = async (
    searchTerm,
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    try {
      const endPage = startPage + maxPages - 1;

      // Create array of page numbers to fetch
      const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      // Fetch all pages in parallel
      const fetchPromises = pageNumbers.map(async (page) => {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products/search?searchTerm=${searchTerm}&page=${page}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) return { data: [] };
        return await response.json();
      });

      // Wait for all requests to complete
      const results = await Promise.allSettled(fetchPromises);

      // Combine all successful results
      const allProducts = [];
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.data) {
          allProducts.push(...result.value.data);
        }
      });

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple pages:", error);
      return [];
    }
  };
  const fetchSearchedProducts = async (search, page = 1, sort = "") => {
    setSearchLoading(true);
    try {
      const limit = 9; // Changed from 100 to 9 to match itemsPerPage
      const response = await fetch(
        `${backednUrl}/api/client-products/search?searchTerm=${search}&page=${page}&limit=${limit}&sort=${sort}&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        setSearchLoading(false);
        throw new Error("Unexpected API response structure");
      }

      setSearchedProducts(data); // Store the full response object, not just data.data
      setSearchLoading(false);

      // Return the full response so the component can access total_pages
      return data;
    } catch (err) {
      setError(err.message);
      setSearchLoading(false);
      throw err; // Re-throw so the component can handle it
    }
  };

  const [trendingProducts, setTrendingProducts] = useState([]);

  const fetchMultipleTrendingPages = async (
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    const allProducts = [];
    let currentPage = startPage;
    const endPage = startPage + maxPages - 1;

    try {
      while (currentPage <= endPage) {
        const response = await fetch(
          `${backednUrl}/api/client-products-trending?page=${currentPage}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) break;

        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          allProducts.push(...data.data);

          // Check if we've reached the last page
          if (currentPage >= data.total_pages) break;

          currentPage++;
        } else {
          break;
        }
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple trending pages:", error);
      return allProducts; // Return what we have so far
    }
  };

  const fetchTrendingProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 100; // Default to 100 if limit is not provided
      const response = await fetch(
        `${backednUrl}/api/client-products-trending?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setTrendingProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
  const [arrivalProducts, setArrivalProducts] = useState([]);
  const fetchNewArrivalProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 100; // Default to 100 if limit is not provided
      const response = await fetch(
        `${backednUrl}/api/client-products-newArrival?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setArrivalProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
  const fetchMultipleArrivalPages = async (
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    const allProducts = [];
    let currentPage = startPage;
    const endPage = startPage + maxPages - 1;

    try {
      while (currentPage <= endPage) {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products-newArrival?page=${currentPage}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) break;

        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          allProducts.push(...data.data);

          // Check if we've reached the last page
          if (currentPage >= data.total_pages) break;

          currentPage++;
        } else {
          break;
        }
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple arrival pages:", error);
      return allProducts;
    }
  };
  const fetchMultipleDiscountedPages = async (
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    const allProducts = [];
    let currentPage = startPage;
    const endPage = startPage + maxPages - 1;

    try {
      while (currentPage <= endPage) {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products-discounted?page=${currentPage}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) break;

        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          allProducts.push(...data.data);

          // Check if we've reached the last page
          if (currentPage >= data.total_pages) break;

          currentPage++;
        } else {
          break;
        }
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple arrival pages:", error);
      return allProducts;
    }
  };
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const fetchDiscountedProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 100; // Default to 100 if limit is not provided
      const response = await fetch(
        `${backednUrl}/api/client-products-discounted?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setDiscountedProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const fetchMultipleBestSellerPages = async (
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    const allProducts = [];
    let currentPage = startPage;
    const endPage = startPage + maxPages - 1;

    try {
      while (currentPage <= endPage) {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products-bestSellers?page=${currentPage}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) break;

        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          allProducts.push(...data.data);

          // Check if we've reached the last page
          if (currentPage >= data.total_pages) break;

          currentPage++;
        } else {
          break;
        }
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching multiple best seller pages:", error);
      return allProducts; // Return what we have so far
    }
  };
  const fetchBestSellerProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 100; // Default to 100 if limit is not provided
      const response = await fetch(
        `${backednUrl}/api/client-products-bestSellers?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setBestSellerProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };

  const [paramProducts, setParamProducts] = useState([]);

  const fetchMultipleParamPages = async (
    categoryId,
    maxPages = 1,
    limit = 100,
    sortOption = "",
    startPage = 1
  ) => {
    try {
      const endPage = startPage + maxPages - 1;

      // Create array of page numbers to fetch
      // Try to short-circuit if ALL requested pages are cached
      const categoryCache = paramProductsCacheRef.current[categoryId];
      let allCached = true;
      const cachedProducts = [];

      if (categoryCache && categoryCache.pages) {
        for (let p = startPage; p <= endPage; p++) {
          const pageEntry = categoryCache.pages[p];
          if (!pageEntry) {
            allCached = false;
            break;
          }
          // pageEntry.data is the array of products for that page
          cachedProducts.push(...(pageEntry.data || []));
        }
      } else {
        allCached = false;
      }

      if (allCached) {
        // Return combined products from cache (same shape as your original function: array of products)
        return cachedProducts;
      }

      // Build a key for deduping this specific range
      const multiKey = `${categoryId}_${startPage}_${maxPages}_${limit}_${sortOption}`;

      // If a request for this same range is already in-flight, await it
      if (pendingParamMultiRequestsRef.current[multiKey]) {
        try {
          const res = await pendingParamMultiRequestsRef.current[multiKey];
          return res;
        } catch (e) {
          // fallback to performing requests
        }
      }

      // Otherwise fetch the pages in parallel (same approach you already had)
      // Create array of page numbers to fetch
      const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      // Fetch all pages in parallel
      const fetchPromises = pageNumbers.map(async (page) => {
        // Reuse fetchParamProducts for single-page fetching (it will itself use the single-page cache/dedupe)
        const single = await fetchParamProducts(categoryId, page);
        // fetchParamProducts returns the full response object with .data array
        return single?.data || [];
      });

      // Wait for all requests to complete
      const multiPromise = (async () => {
        const settled = await Promise.allSettled(fetchPromises);
        const allProducts = [];
        settled.forEach((r) => {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            allProducts.push(...r.value);
          }
        });
        return allProducts;
      })();

      // Combine all successful results
      pendingParamMultiRequestsRef.current[multiKey] = multiPromise;
      try {
        const result = await multiPromise;
        return result;
      } finally {
        delete pendingParamMultiRequestsRef.current[multiKey];
      }
    } catch (error) {
      console.error("Error fetching multiple param pages:", error);
      return [];
    }
  };
  const fetchParamProducts = async (categoryId, page) => {
    try {
      setSkeletonLoading(true);
      const key = `${categoryId}_${page}`;

      // 1) Return cached page if exists
      const cachedPage =
        paramProductsCacheRef.current?.[categoryId]?.pages?.[page];
      if (cachedPage) {
        // cachedPage is the full API response object (same shape as data)
        setParamProducts(cachedPage);
        if (cachedPage.total_pages) setTotalApiPages(cachedPage.total_pages);
        setSkeletonLoading(false);
        return cachedPage;
      }

      // 2) If there's an in-flight request for same category+page, await it
      if (pendingParamRequestsRef.current[key]) {
        try {
          const result = await pendingParamRequestsRef.current[key];
          // result should be the full response
          setParamProducts(result);
          if (result?.total_pages) setTotalApiPages(result.total_pages);
          setSkeletonLoading(false);
          return result;
        } catch (e) {
          // fallthrough to try fetching again
        }
      }

      // 3) Make the request and store promise in pending map (dedupe)
      const promise = (async () => {
        const itemCount = 9;
        const response = await fetch(
          `${backednUrl}/api/params-products?product_type_ids=${categoryId}&items_per_page=${itemCount}&page=${page}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        // store in cache per-category -> pages -> page = full response
        paramProductsCacheRef.current[categoryId] = {
          ...(paramProductsCacheRef.current[categoryId] || { pages: {} }),
          pages: {
            ...(paramProductsCacheRef.current[categoryId]?.pages || {}),
            [page]: data,
          },
          // keep a canonical total_pages (useful)
          total_pages:
            data.total_pages ??
            paramProductsCacheRef.current[categoryId]?.total_pages,
        };

        // update exposed state exactly as before
        setParamProducts(data);
        if (data.total_pages) setTotalApiPages(data.total_pages);
        return data;
      })();

      pendingParamRequestsRef.current[key] = promise;

      try {
        const res = await promise;
        return res;
      } finally {
        // cleanup pending entry & loading state
        delete pendingParamRequestsRef.current[key];
        setSkeletonLoading(false);
      }
    } catch (err) {
      setError(err?.message || "Error fetching param products");
      setSkeletonLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backednUrl}/api/category-products`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      // console.log('API Response:', data);

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setCategoryProducts(data.data);
      // console.log(data.data, "category products");
    } catch (err) {
      // console.error('Error fetching products:', err);
      setError(err.message);
    }
  };

  const [v1categories, setV1categories] = useState([]);
  // ********************************************************************v1 categories
  const fetchV1Categories = async () => {
    // setSkeletonLoading(true);
    try {
      const response = await fetch(`${backednUrl}/api/v1-categories`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      // console.log('API Response:', data);

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setV1categories(data.data);
      return data.data;
    } catch (err) {
      console.log("Error fetching products:", err);
      setError(err.message);
    }
    // finally {
    //   setSkeletonLoading(false);
    // }
  };
  const [australia, setAustralia] = useState([]);
  const [totalAustraliaPages, setTotalAustraliaPages] = useState(0);

  // Function to fetch Australia products with pagination
  const fetchAustraliaProducts = async (
    page = 1,
    limit = 9,
    sortOption = ""
  ) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/australia/get-products?page=${page}&limit=${limit}&sort=${sortOption}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch Australia products");

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setAustralia(data);
      setTotalAustraliaPages(data.totalPages);

      return data;
    } catch (error) {
      console.error("Error fetching Australia products:", error);

      throw error;
    }
  };

  // Function to fetch all Australia products (for price filtering)
  const fetchAllAustraliaProducts = async (sortOption = "") => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/australia/get-products?all=true&sort=${sortOption}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("Failed to fetch all Australia products");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all Australia products:", error);
      throw error;
    }
  };

  // Legacy function (keep for backward compatibility)
  const fetchAustralia = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/australia/get-products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setAustralia(data);
      return data;
    } catch (error) {
      console.error("Error fetching Australia products:", error);
    }
  };
  const [hourProd, setHourProd] = useState([]);
  const [totalHourPages, setTotalHourPages] = useState(0);

  // Function to fetch Australia products with pagination
  const fetchHourProducts = async (page = 1, limit = 9, sortOption = "") => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/24hour/get-products?page=${page}&limit=${limit}&sort=${sortOption}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch 24 Hour products");

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setHourProd(data);
      setTotalHourPages(data.totalPages);

      return data;
    } catch (error) {
      console.error("Error fetching Australia products:", error);

      throw error;
    }
  };

  // Function to fetch all Australia products (for price filtering)
  const fetchAllHourProducts = async (sortOption = "") => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/24hour/get-products?all=true&sort=${sortOption}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch all 24 hour products");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all 24 hour products:", error);
      throw error;
    }
  };

  // Legacy function (keep for backward compatibility)
  const fetchHour = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/24hour/get-products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setHourProd(data);
      return data;
    } catch (error) {
      console.error("Error fetching Australia products:", error);
    }
  };

  // discountAPI
  const [discountPromo, setDiscountPromo] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState({});

  const listDiscount = async () => {
    try {
      const { data } = await axios.get(
        `${backednUrl}/api/add-discount/list-discounts`
      );
      if (data.success) {
        setDiscountPromo(data.discounts);
        if (data.globalDiscount) {
          setGlobalDiscount(data.globalDiscount);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // AppContext.jsx
  const fetchProductDiscount = async (productId) => {
    if (!productId) return { productId, discount: 0, discountPrice: 0 };

    try {
      const res = await axios.get(
        `${backednUrl}/api/add-discount/discounts/${productId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data && res.data.data) {
        return {
          productId,
          discount: res.data.data.discount || 0,
          discountPrice: res.data.data.discountPrice || 0,
        };
      } else {
        return { productId, discount: 0, discountPrice: 0 };
      }
    } catch (error) {
      // Log error details for debugging
      console.error(`Error fetching discount for product ${productId}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Return default values instead of failing
      return { productId, discount: 0, discountPrice: 0 };
    }
  };
  // ADD MARGIN API

  const [marginApi, setMarginApi] = useState({});

  const marginAdd = async () => {
    try {
      const { data } = await axios.get(
        `${backednUrl}/api/product-margin/list-margin`
      );

      if (data.success) {
        const marginMap = {};
        data.margins.forEach((item) => {
          marginMap[item.productId] = {
            marginFlat: item.margin,
            baseMarginPrice: item.marginPrice,
          };
        });

        setMarginApi(marginMap);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(`${backednUrl}/api/blogs/get-blogs`);
      setBlogs(data);
    } catch (error) {
      toast.error(error.message);
      toast.error(error.message);
      console.error(error);
    }
  };

  // console.log(products, "api productss");

  useEffect(() => {
    fetchBlogs();
    // listDiscount();
  }, []);

  useEffect(() => {
    marginAdd();
  }, []);

  useEffect(() => {
    if (!products.length) return;

    const fetchDiscounts = async () => {
      try {
        // ... complex discount fetching logic
      } catch (error) {
        console.error("Error fetching discounts:", error);
      }
    };

    fetchDiscounts();
  }, [products]);
  useEffect(() => {
    dispatch(loadFavouritesFromDB(backednUrl));
  }, []);
  // useEffect(() => {
  //   if (products.length === 0) {
  //     fetchProducts(); // Only fetch if products array is empty
  //   }
  // }, []);

  // useEffect(() => {
  //   if (categoryProducts.length === 0) {
  //     fetchCategories(); // Only fetch if products array is empty
  //   }
  // }, []);

  // useEffect(() => {
  //   if (v1categories.length === 0) {
  //     fetchV1Categories(); // Only fetch if products array is empty
  //   }
  // }, []);

  const [productionIds, setProductionIds] = useState(new Set());
  const getAll24HourProduction = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/24hour/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const productIds = data.map((item) => Number(item.id));
        setProductionIds(new Set(productIds));
      } else {
        console.error(
          "Failed to fetch 24 Hour Production products:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error fetching 24 Hour Production products:", error);
    }
  };
  const [australiaIds, setAustraliaIds] = useState(new Set());
  const getAllAustralia = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/australia/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Ensure consistent data types (convert to strings)
        const productIds = data.map((item) => Number(item.id));
        setAustraliaIds(new Set(productIds));
      } else {
        console.error("Failed to fetch Australia products:", response.status);
      }
    } catch (error) {
      console.error("Error fetching Australia products:", error);
    }
  };
  useEffect(() => {
    getAll24HourProduction();
    getAllAustralia();
  }, []);

  useEffect(() => {
    if (token) {
      fetchWebUser();
      loadUserOrder();
    }
  }, [token]);
  const value = {
    productionIds,
    getAll24HourProduction,
    getAllAustralia,
    australiaIds,
    token,
    setToken,
    userOrder,
    setUserOrder,
    loadUserOrder,
    loading,
    setLoading,
    fetchWebUser,
    addressData,
    setAddressData,
    fetchMultipleParamPages,
    activeTab,
    setActiveTab,
    newId,
    setNewId,
    userData,
    clearProductsCache,
    fetchTrendingProducts,
    trendingProducts,
    fetchProductDiscount,
    fetchSearchedProducts,
    fetchProductsCategory,
    productsCategory,
    searchedProducts,
    fetchBestSellerProducts,
    bestSellerProducts,
    australia,
    setAustralia,
    totalAustraliaPages,
    fetchAustraliaProducts,
    fetchAllAustraliaProducts,
    fetchHourProducts,
    fetchAllHourProducts,
    fetchHour,
    hourProd,
    totalHourPages,
    setTotalHourPages,
    fetchAustralia,
    backednUrl,
    totalDiscount,
    setTotalDiscount,
    fetchProducts,
    fetchMultipleArrivalPages,
    products,
    error,
    skeletonLoading,
    setProducts,
    handleLogout,
    fetchV1Categories,
    blogs,
    setBlogs,
    options,
    categoryProducts,
    fetchDiscountedProducts,

    discountedProducts,
    fetchMultipleBestSellerPages,
    setCategoryProducts,
    fetchCategories,
    setDiscountPromo,
    fetchNewArrivalProducts,
    fetchMultipleSearchPages,
    arrivalProducts,
    filterLocalProducts,
    setFilterLocalProducts,
    shippingAddressData,
    setShippingAddressData,
    discountPromo,
    globalDiscount,
    getGlobalDiscount,
    searchLoading,
    listDiscount,
    activeFilterCategory,
    setActiveFilterCategory,
    fetchParamProducts,
    paramProducts,
    setParamProducts,
    selectedParamCategoryId,
    setSelectedParamCategoryId,

    totalApiPages,
    setTotalApiPages,
    v1categories,
    setV1categories,
    currentPage,
    setCurrentPage,
    sidebarActiveCategory,
    setSidebarActiveCategory,
    shopCategory,
    setShopCategory,
    sidebarActiveLabel,
    setSidebarActiveLabel,
    fetchMultipleTrendingPages,
    fetchMultipleDiscountedPages,

    marginApi,
    setMarginApi,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

// export default AppContextProvider;
export { AppContextProvider };
