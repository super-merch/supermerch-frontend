import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [gstCharges, setGstCharges] = useState(10);
  const [shippingCharges, setShippingCharges] = useState(20);
  const [setupFee, setSetupFee] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newId, setNewId] = useState(null);

  const items = useSelector(selectCurrentUserCartItems);

  useEffect(() => {
    const setup = items.reduce(
      (total, item) => total + (item.setupFee || 0),
      0
    );
    setSetupFee(setup);
  }, [items]);

  useEffect(() => {
    const getShippingCharges = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/shipping/get`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        setShippingCharges(data.shipping || 20);
        setGstCharges(data.gst || 10);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch shipping charges");
        }
<<<<<<< HEAD
=======

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

  const fetchBlogs = async () => {
    try {
      setBlogLoading(true);
      const { data } = await axios.get(`${backednUrl}/api/blogs/get-blogs`);
      setBlogs(data.blogs);
      setBlogLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
      setBlogLoading(false);
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
>>>>>>> 4b6d1c80ff5b98813b386bbf5304bca9fa2816f7
      } catch (error) {
        console.error("Failed to fetch shipping charges:", error);
      }
    };

<<<<<<< HEAD
    getShippingCharges();
  }, []);
=======
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
>>>>>>> 4b6d1c80ff5b98813b386bbf5304bca9fa2816f7

  const value = {
    backendUrl,
    activeTab,
    setActiveTab,
    newId,
    setNewId,
<<<<<<< HEAD
=======
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
    blogs, //direct way to load blogs 
    setBlogs,
    fetchBlogs,
    allProductsCacheRef,
    blogs,
    setBlogs,
    totalCount,
    options,
    categoryProducts,
    fetchDiscountedProducts,
    blogLoading,
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

>>>>>>> 4b6d1c80ff5b98813b386bbf5304bca9fa2816f7
    openLoginModal,
    setOpenLoginModal,
    shippingCharges,
    gstCharges,
    setupFee,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export { AppContextProvider };
