import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  clearFavourites,
  loadFavouritesFromDB,
} from "@/redux/slices/favouriteSlice";
import {
  clearCart,
  initializeCartFromStorage,
  selectCurrentUserCartItems,
} from "@/redux/slices/cartSlice";
import { clearCurrentUser } from "@/redux/slices/cartSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [sidebarActiveLabel, setSidebarActiveLabel] = useState(null);
  const [gstCharges, setGstCharges] = useState(10);
  const paramProductsCacheRef = useRef({});
  const pendingParamRequestsRef = useRef({});
  const pendingParamMultiRequestsRef = useRef({});
  const [userStats, setUserStats] = useState({
    deliveredOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    totalOrders: 0,
    pages: 1,
  });
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [setupFee, setSetupFee] = useState(0);
  const items = useSelector(selectCurrentUserCartItems);
  useEffect(() => {
    const setup = items.reduce(
      (total, item) => total + (item.setupFee || 0),
      0
    );
    setSetupFee(setup);
  }, [items]);

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
    dispatch(selectCurrentUserCartItems());
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
  const queryClient = useQueryClient();
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
  const [userEmail, setUserEmail] = useState(null);

  const [totalApiPages, setTotalApiPages] = useState(0);
  const [selectedParamCategoryId, setSelectedParamCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopCategory, setShopCategory] = useState(null);
  // Best sellers
  const allProductsCacheRef = useRef({});
  const bestSellerCacheRef = useRef({});
  const pendingBestSellerRef = useRef({});

  // Discounted products
  const discountedCacheRef = useRef({});
  const pendingDiscountedRef = useRef({});

  // Trending products
  const trendingCacheRef = useRef({});
  const pendingTrendingRef = useRef({});

  // New arrivals
  const arrivalCacheRef = useRef({});
  const pendingArrivalRef = useRef({});

  // Function to get responsive limit based on screen size
  const getResponsiveLimit = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 1025 ? 8 : 9;
    }
    return 9; // Default for SSR
  };

  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: getResponsiveLimit(),
    sortOption: "",
    filter: true,
    productTypeId: null,
    category: null,
    searchTerm: "",
    attributes: null,
    sendAttributes: false,
    searchTerms: [],
  });
  const [totalCount, setTotalCount] = useState(0);

  const [australiaPaginationData, setAustraliaPaginationData] = useState({
    page: 1,
    limit: 9,
    sortOption: "",
    filter: true,
  });

  const getProductsFromApi = async () => {
    const params = new URLSearchParams({
      ...(paginationData.productTypeId && {
        product_type_ids: paginationData.productTypeId,
      }),
      page: paginationData.page,
      ...(paginationData.limit && { limit: paginationData.limit }),
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
    let searchTerms = ["gift pack", "HAM10"];
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
    } else if (paginationData.category === "allProducts") {
      url = `${backednUrl}/api/client-products?${params.toString()}`;
    } else if (paginationData.category === "return-gifts") {
      url = `${backednUrl}/api/client-products/search?searchTerms=${searchTerms.join(
        ","
      )}&page=${paginationData.page}&limit=${paginationData.limit}`;
    } else if (paginationData.category) {
      url = `${backednUrl}/api/client-products/category?${params.toString()}`;
    } else if (paginationData.productTypeId) {
      url = `${backednUrl}/api/params-products?${params.toString()}`;
    } else {
      url = `${backednUrl}/api/client-products?${params.toString()}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    setTotalCount(
      data.total_count ||
        data.totalCount ||
        data.item_count ||
        data.meta?.total ||
        0
    );
    return data;
  };

  const { data: getProducts, isLoading: productsLoading } = useQuery({
    queryKey: [
      paginationData.productTypeId,
      paginationData.page,
      paginationData.limit,
      paginationData.sortOption,
      paginationData.filter,
      paginationData.productTypeId,
      paginationData.category,
      paginationData.searchTerm,
      paginationData.pricerange?.min_price,
      paginationData.pricerange?.max_price,
      paginationData.colors,
      paginationData.attributes,
      paginationData.sendAttributes,
    ],
    queryFn: () => getProductsFromApi(),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const refetchProducts = () => {
    // queryClient.invalidateQueries({
    //   queryKey: [
    //     paginationData.productTypeId,
    //     paginationData.page,
    //     paginationData.limit,
    //     paginationData.sortOption,
    //     paginationData.filter,
    //     paginationData.category,
    //     paginationData.searchTerm,
    //     paginationData.pricerange?.min_price,
    //     paginationData.pricerange?.max_price,
    //     paginationData.colors,
    //     paginationData.attributes,
    //     paginationData.sendAttributes,
    //   ],
    // });
  };

  const getAustraliaProductsFromApi = async () => {
    const params = new URLSearchParams({
      ...(australiaPaginationData.sortOption && {
        sort: australiaPaginationData.sortOption,
      }),
      ...(australiaPaginationData.filter && {
        filter: australiaPaginationData.filter,
      }),
      page: australiaPaginationData.page,
      limit: australiaPaginationData.limit,
    });
    const response = await fetch(
      `${backednUrl}/api/australia/get-products?${params.toString()}`
    );
    const data = await response.json();
    return data;
  };

  const { data: getAustraliaProducts, isLoading: australiaProductsLoading } =
    useQuery({
      queryKey: [
        australiaPaginationData.sortOption,
        australiaPaginationData.filter,
        australiaPaginationData.page,
        australiaPaginationData.limit,
      ],
      queryFn: () => getAustraliaProductsFromApi(),
    });

  const refetchAustraliaProducts = () => {
    queryClient.invalidateQueries({
      queryKey: [
        australiaPaginationData.sortOption,
        australiaPaginationData.filter,
        australiaPaginationData.page,
        australiaPaginationData.limit,
      ],
    });
  };

  const loadUserOrder = async (page,limit=10) => {
    try {
      if(userData?._id){

        const { data } = await axios.get(
          `${backednUrl}/api/checkout/user-order/${userData._id}?page=${page}&limit=${limit}`,
          { headers: { token } }
      );
      if (data.success) {
        setUserOrder(data.orders);
        setUserStats({
        deliveredOrders: data.delivered,
        pendingOrders: data.pending,
        totalSpent: data.totalSpent,
        totalOrders: data.total,
        pages: data.pages,
      });
      }
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
        setUserEmail(data.user.email);
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
      toast.error("User Logged out");
      handleLogout();
    }
  };
  const [productsCategory, setProductsCategory] = useState([]);
  const [productsCategoryLoading, setProductsCategoryLoading] = useState(false);
  const fetchProductsCategory = async (
    category,
    page = 1,
    sort = "",
    limit
  ) => {
    setProductsCategoryLoading(true);
    try {
      const limitParam = limit ?? 10;
      // Fixed: Removed duplicate ? and properly formatted query string
      const response = await fetch(
        `${backednUrl}/api/client-products/category?category=${category}&page=${page}&limit=${limitParam}&sort=${sort}&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Validate response structure
      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setProductsCategory(data.data);
      setProductsCategoryLoading(false);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching category products:", err);
      setProductsCategoryLoading(false);
      setError(err.message);
    }
  };

  const [shippingCharges, setShippingCharges] = useState(20);
  const getShippingCharges = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shipping/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers if needed
          },
        }
      );

      const data = await response.json();
      setShippingCharges(data.shipping || 20);
      setGstCharges(data.gst || 10);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shipping charges");
      }

      return { data };
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    getShippingCharges();
  }, []);

  // *************************************************Client paginate api

  const fetchProducts = async (page = 1, sort = "", limit) => {
    // Check if cache exists and is valid
    if (productsCache && isCacheValid) {
      setProducts(productsCache);
      return;
    }

    setSkeletonLoading(true);
    try {
      if (!limit) limit = 10; // Default to 100 if limit is not provided
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
    limit = 10,
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
  const pendingSearchRequestsRef = useRef({});
  const searchCacheRef = useRef({});
  const fetchSearchedProducts = async (search, page = 1, sort = "") => {
    setSearchLoading(true);
    try {
      const limit = 9;
      const key = `${search}_${page}_${sort}`;

      // 1) Return cached result if exists
      const cachedPage =
        searchCacheRef.current?.[search]?.[sort]?.pages?.[page];
      if (cachedPage) {
        setSearchedProducts(cachedPage);
        setSearchLoading(false);
        return cachedPage;
      }

      // 2) Await in-flight request if one exists
      if (pendingSearchRequestsRef.current[key]) {
        const result = await pendingSearchRequestsRef.current[key];
        setSearchedProducts(result);
        setSearchLoading(false);
        return result;
      }

      // 3) Create and store promise
      const promise = (async () => {
        const response = await fetch(
          `${backednUrl}/api/client-products/search?searchTerm=${search}&page=${page}&limit=${limit}&sort=${sort}&filter=true`
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        // Save to cache
        searchCacheRef.current[search] = {
          ...(searchCacheRef.current[search] || {}),
          [sort]: {
            ...(searchCacheRef.current[search]?.[sort] || { pages: {} }),
            pages: {
              ...(searchCacheRef.current[search]?.[sort]?.pages || {}),
              [page]: data,
            },
            total_pages:
              data.total_pages ??
              searchCacheRef.current[search]?.[sort]?.total_pages,
          },
        };

        setSearchedProducts(data);
        return data;
      })();

      pendingSearchRequestsRef.current[key] = promise;

      try {
        const res = await promise;
        return res;
      } finally {
        delete pendingSearchRequestsRef.current[key];
        setSearchLoading(false);
      }
    } catch (err) {
      setError(err.message || "Error fetching search results");
      setSearchLoading(false);
      throw err;
    }
  };

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingProductsLoading, setTrendingProductsLoading] = useState(false);
  const fetchMultipleTrendingPages = async (
    maxPages = 1,
    limit = 10,
    sortOption = "",
    startPage = 1
  ) => {
    setTrendingProductsLoading(true);
    const allProducts = [];
    let currentPage = startPage;
    const endPage = startPage + maxPages - 1;

    try {
      while (currentPage <= endPage) {
        const response = await fetch(
          `${backednUrl}/api/client-products-trending?page=${currentPage}&limit=${limit}&sort=${sortOption}&filter=true`
        );

        if (!response.ok) break;
        setTrendingProductsLoading(false);

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
      setTrendingProductsLoading(false);
      return allProducts; // Return what we have so far
    } finally {
      setTrendingProductsLoading(false);
    }
  };

  const fetchTrendingProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 10; // Default to 100 if limit is not provided
      setTrendingProductsLoading(true);
      const key = `${page}_${sort}_${limit}`;

      if (trendingCacheRef.current[key]) {
        setTrendingProducts(trendingCacheRef.current[key]);
        return;
      }

      if (pendingTrendingRef.current[key]) {
        await pendingTrendingRef.current[key];
        return;
      }

      const p = (async () => {
        const response = await fetch(
          `${backednUrl}/api/client-products-trending?page=${page}&limit=${limit}&sort=${sort}?filter=true`
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        trendingCacheRef.current[key] = data.data;
        setTrendingProducts(data.data);
      })();

      pendingTrendingRef.current[key] = p;

      try {
        await p;
      } finally {
        delete pendingTrendingRef.current[key];
      }
    } catch (err) {
      setError(err.message);
      setTrendingProductsLoading(false);
    } finally {
      setTrendingProductsLoading(false);
    }
  };

  const [arrivalProducts, setArrivalProducts] = useState([]);
  const fetchNewArrivalProducts = async (page = 1, sort = "", limit) => {
    try {
      if (!limit) limit = 10;
      const key = `${page}_${sort}_${limit}`;

      if (arrivalCacheRef.current[key]) {
        setArrivalProducts(arrivalCacheRef.current[key]);
        return;
      }

      if (pendingArrivalRef.current[key]) {
        await pendingArrivalRef.current[key];
        return;
      }

      const p = (async () => {
        const response = await fetch(
          `${backednUrl}/api/client-products-newArrival?page=${page}&limit=${limit}&sort=${sort}?filter=true`
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        arrivalCacheRef.current[key] = data.data;
        setArrivalProducts(data.data);
      })();

      pendingArrivalRef.current[key] = p;

      try {
        await p;
      } finally {
        delete pendingArrivalRef.current[key];
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const fetchMultipleArrivalPages = async (
    maxPages = 1,
    limit = 10,
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
    limit = 10,
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
      if (!limit) limit = 10;
      const key = `${page}_${sort}_${limit}`;

      if (discountedCacheRef.current[key]) {
        setDiscountedProducts(discountedCacheRef.current[key]);
        return;
      }

      if (pendingDiscountedRef.current[key]) {
        await pendingDiscountedRef.current[key];
        return;
      }

      const p = (async () => {
        const response = await fetch(
          `${backednUrl}/api/client-products-discounted?page=${page}&limit=${limit}&sort=${sort}?filter=true`
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        discountedCacheRef.current[key] = data.data;
        setDiscountedProducts(data.data);
      })();

      pendingDiscountedRef.current[key] = p;

      try {
        await p;
      } finally {
        delete pendingDiscountedRef.current[key];
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const fetchMultipleBestSellerPages = async (
    maxPages = 1,
    limit = 10,
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
      if (!limit) limit = 10; // Default to 100 if limit is not provided
      const key = `${page}_${sort}_${limit}`;

      // Return cached result if present
      if (bestSellerCacheRef.current[key]) {
        setBestSellerProducts(bestSellerCacheRef.current[key]);
        return;
      }

      // Await in-flight request if exists
      if (pendingBestSellerRef.current[key]) {
        await pendingBestSellerRef.current[key];
        return;
      }

      // Create promise and store in pending map (dedupe)
      const p = (async () => {
        const response = await fetch(
          `${backednUrl}/api/client-products-bestSellers?page=${page}&limit=${limit}&sort=${sort}?filter=true`
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        // store array in cache (same shape your component expects)
        bestSellerCacheRef.current[key] = data.data;

        // keep original behavior
        setBestSellerProducts(data.data);
      })();

      pendingBestSellerRef.current[key] = p;

      try {
        await p;
      } finally {
        delete pendingBestSellerRef.current[key];
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const [paramProducts, setParamProducts] = useState([]);

  const fetchMultipleParamPages = async (
    categoryId,
    maxPages = 1,
    limit = 10,
    sortOption = "",
    startPage = 1
  ) => {
    try {
      const endPage = startPage + maxPages - 1;

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
      const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      const fetchPromises = pageNumbers.map(async (page) => {
        // Reuse fetchParamProducts for single-page fetching (it will itself use the single-page cache/dedupe)
        const single = await fetchParamProducts(categoryId, page);
        // fetchParamProducts returns the full response object with .data array
        return single?.data || [];
      });

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
  // States for storing data
  const [australia, setAustralia] = useState([]);
  const [totalAustraliaPages, setTotalAustraliaPages] = useState(0);

  // 🗄️ Caches
  const [australiaCache, setAustraliaCache] = useState({});
  const [allAustraliaCache, setAllAustraliaCache] = useState({});

  // Function to fetch Australia products with pagination
  const fetchAustraliaProducts = async (
    page = 1,
    limit = 9,
    sortOption = ""
  ) => {
    try {
      const cacheKey = `${page}-${limit}-${sortOption}`;

      // ✅ Check cache first
      if (australiaCache[cacheKey]) {
        const cachedData = australiaCache[cacheKey];
        setAustralia(cachedData.data || []);
        setTotalAustraliaPages(cachedData.totalPages || 0);
        return cachedData;
      }

      // Fetch from API if not in cache
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

      // Save in state
      setAustralia(data.data || []);
      setTotalAustraliaPages(data.totalPages || 0);

      // ✅ Store in cache
      setAustraliaCache((prev) => ({
        ...prev,
        [cacheKey]: data,
      }));

      return data;
    } catch (error) {
      console.error("Error fetching Australia products:", error);
      throw error;
    }
  };

  // Function to fetch all Australia products (for price filtering)
  const fetchAllAustraliaProducts = async (sortOption = "") => {
    try {
      const cacheKey = `all-${sortOption}`;

      // ✅ Check cache first
      if (allAustraliaCache[cacheKey]) {
        return allAustraliaCache[cacheKey];
      }

      // Fetch from API if not cached
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

      // ✅ Store in cache
      setAllAustraliaCache((prev) => ({
        ...prev,
        [cacheKey]: data,
      }));

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

  // 🗄️ Caches
  const [hourCache, setHourCache] = useState({});
  const [allHourCache, setAllHourCache] = useState({});

  // Function to fetch 24 Hour products with pagination
  const fetchHourProducts = async (page = 1, limit = 9, sortOption = "") => {
    try {
      const cacheKey = `${page}-${limit}-${sortOption}`;

      // ✅ Check cache first
      if (hourCache[cacheKey]) {
        const cachedData = hourCache[cacheKey];
        setHourProd(cachedData.data || []);
        setTotalHourPages(cachedData.totalPages || 0);
        return cachedData;
      }

      // Fetch from API if not in cache
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/24hour/get-products?page=${page}&limit=${limit}&sort=${sortOption}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch 24 Hour products");

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      // Save in state
      setHourProd(data.data || []);
      setTotalHourPages(data.totalPages || 0);

      // ✅ Store in cache
      setHourCache((prev) => ({
        ...prev,
        [cacheKey]: data,
      }));

      return data;
    } catch (error) {
      console.error("Error fetching 24 Hour products:", error);
      throw error;
    }
  };

  // Function to fetch all 24 Hour products (for price filtering)
  const fetchAllHourProducts = async (sortOption = "") => {
    try {
      const cacheKey = `all-${sortOption}`;

      // ✅ Check cache first
      if (allHourCache[cacheKey]) {
        return allHourCache[cacheKey];
      }

      // Fetch from API if not cached
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/24hour/get-products?all=true&sort=${sortOption}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch all 24 Hour products");

      const data = await response.json();

      // ✅ Store in cache
      setAllHourCache((prev) => ({
        ...prev,
        [cacheKey]: data,
      }));

      return data;
    } catch (error) {
      console.error("Error fetching all 24 Hour products:", error);
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

  /*useEffect(() => {
    fetchDiscountedProducts(1, "", 6);
    fetchProducts(1, "", 8);
    fetchTrendingProducts(1, "", 16);
  }, []); 

  // console.log(products, "api productss");

  useEffect(() => {
    fetchBlogs();
    fetchV1Categories();
    // listDiscount();
  }, []);

  useEffect(() => {
    marginAdd();
  }, []); */

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

  useEffect(() => {
    if (token) {
      fetchWebUser();
    }
  }, [token]);
  useEffect(()=>{
    if(userData?._id){
      loadUserOrder(1);
    }

  },[userData])

  const value = {
    token,
    setToken,
    userOrder,
    setUserOrder,
    loadUserOrder,
    userStats,
    loading,
    setLoading,
    shippingCharges,
    setShippingCharges,
    userEmail,
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
    trendingProductsLoading,
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
    gstCharges,
    fetchHour,
    hourProd,
    totalHourPages,
    setTotalHourPages,
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
    allProductsCacheRef,
    totalCount,
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
    setupFee,
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
    marginAdd,
    setMarginApi,

    openLoginModal,
    setOpenLoginModal,
    productsCategoryLoading,
    setProductsCategory,

    paginationData,
    setPaginationData,
    getProducts,
    productsLoading,
    refetchProducts,

    australiaPaginationData,
    setAustraliaPaginationData,
    getAustraliaProducts,
    australiaProductsLoading,
    refetchAustraliaProducts,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

// export default AppContextProvider;
export { AppContextProvider };
