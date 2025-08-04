import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { clearFavourites, loadFavouritesFromDB } from '@/redux/slices/favouriteSlice';
import { clearCart } from '@/redux/slices/cartSlice';

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backednUrl = import.meta.env.VITE_BACKEND_URL;
  const [filterLocalProducts, setFilterLocalProducts] = useState([])
  const [activeFilterCategory, setActiveFilterCategory] = useState(null)
  const [sidebarActiveCategory, setSidebarActiveCategory] = useState(null)
  const [categoryProducts, setCategoryProducts] = useState([]);
const [globalDiscount, setGlobalDiscount] = useState(null);

  const [sidebarActiveLabel, setSidebarActiveLabel] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem('token') ? localStorage.getItem('token') : false
  );

  const [blogs, setBlogs] = useState([])

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
  const dispatch = useDispatch()
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearFavourites());
    setToken('');
    googleLogout()
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    dispatch(clearCart())
    navigate('/signup');
  };

  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    addressLine: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    email: '',
    phone: '',
  });

  const [userOrder, setUserOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  // const [sliderLoading,setSliderLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newId, setNewId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const [totalApiPages, setTotalApiPages] = useState(0);
  const [selectedParamCategoryId, setSelectedParamCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopCategory, setShopCategory] = useState(null)
  
  const options = { day: '2-digit', month: 'short', year: 'numeric' };

  const loadUserOrder = async () => {
    try {
      const { data } = await axios.get(
        `${backednUrl}/api/checkout/user-order`,
        { headers: { token } }
      );
      if (data.success) {
        setUserOrder(data.orders);
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
        if (data.success) {
          setUserData(data.user);
        }
      }
    } catch (error) {
      // console.error('Error fetching user data:', error);
      toast.error('An error occurred while fetching the address.');
    }
  };
  const [productsCategory,setProductsCategory] = useState([])
  const fetchProductsCategory = async (category, page = 1, sort = '') => {
  setSkeletonLoading(true);
  try {
    const limit = 10;
    // Fixed: Removed duplicate ? and properly formatted query string
    const response = await fetch(
      `${backednUrl}/api/client-products/category?category=${category}&page=${page}&limit=${limit}&sort=${sort}&filter=true`
    );

    if (!response.ok) throw new Error('Failed to fetch products');

    const data = await response.json();

    // Validate response structure
    if (!data || !data.data) {
      throw new Error('Unexpected API response structure');
    }

    setProductsCategory(data.data);
    setSkeletonLoading
    // Uncomment if total_pages is needed
    // setTotalPages(data.total_pages);
  } catch (err) {
    console.error('Error fetching category products:', err);
    setSkeletonLoading(false);
    setError(err.message);
  }
};

  // *************************************************Client paginate api
   
  const CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const fetchProducts = async (page = 1, sort = '', limit) => {
  // Check if we have cached data first
  const cachedData = getCachedProducts(page, sort, limit);
  if (cachedData) {
    console.log('Loading products from cache');
    setProducts(cachedData);
    setSkeletonLoading(false);
    return; // Exit early, no API call needed
  }

  // If no cache, proceed with API call
  console.log('Loading products from API');
  setSkeletonLoading(true);
  
  try {
    if (!limit) limit = 100; // Default to 100 if limit is not provided
    const response = await fetch(
      `${backednUrl}/api/client-products?page=${page}&limit=${limit}&sort=${sort}?filter=true`
    );

    if (!response.ok) throw new Error('Failed to fetch products');

    const data = await response.json();

    // Validate response structure if needed
    if (!data || !data.data) {
      setSkeletonLoading(false);
      throw new Error('Unexpected API response structure');
    }

    setProducts(data.data);
    
    // Cache the fetched data
    setCachedProducts(data.data, page, sort, limit);
    
    setSkeletonLoading(false);
    // Uncomment if total_pages is needed
    // setTotalPages(data.total_pages);
  } catch (err) {
    setError(err.message);
    setSkeletonLoading(false);
  }
};

// Helper function to get cached products
const getCachedProducts = (page, sort, limit) => {
  try {
    const cacheKey = `${CACHE_KEY}_${page}_${sort}_${limit}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within cache duration)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    } else {
      // Cache expired, remove it
      sessionStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Helper function to set cached products
const setCachedProducts = (data, page, sort, limit) => {
  try {
    const cacheKey = `${CACHE_KEY}_${page}_${sort}_${limit}`;
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

// Optional: Function to clear cache manually if needed
const clearProductsCache = () => {
  try {
    // Get all keys from sessionStorage
    const keys = Object.keys(sessionStorage);
    
    // Remove all cache keys that match our pattern
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Products cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
  // In your AppContext:

const [searchedProducts, setSearchedProducts] = useState([]);
  const fetchSearchedProducts = async (search, page = 1, sort = '') => {
  setSearchLoading(true);
  try {
    const limit = 9; // Changed from 100 to 9 to match itemsPerPage
    const response = await fetch(
      `${backednUrl}/api/client-products/search?searchTerm=${search}&page=${page}&limit=${limit}&sort=${sort}&filter=true`
    );

    if (!response.ok) throw new Error('Failed to fetch products');

    const data = await response.json();

    // Validate response structure if needed
    if (!data || !data.data) {
      setSearchLoading(false);
      throw new Error('Unexpected API response structure');
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

  const [trendingProducts,setTrendingProducts] = useState([])
  const fetchTrendingProducts = async (page = 1, sort = '') => {
    try {
      const limit = 100;
      const response = await fetch(
        `${backednUrl}/api/client-products-trending?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setTrendingProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
  const [arrivalProducts,setArrivalProducts] = useState([])
  const fetchNewArrivalProducts = async (page = 1, sort = '') => {
    try {
      const limit = 100;
      const response = await fetch(
        `${backednUrl}/api/client-products-newArrival?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setArrivalProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
  const [discountedProducts,setDiscountedProducts] = useState([])
  const fetchDiscountedProducts = async (page = 1, sort = '') => {
    try {
      const limit = 100;
      const response = await fetch(
        `${backednUrl}/api/client-products-discounted?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setDiscountedProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    }
  };
const [bestSellerProducts,setBestSellerProducts] = useState([])
  const fetchBestSellerProducts = async (page = 1, sort = '') => {
    try {
      const limit = 100;
      const response = await fetch(
        `${backednUrl}/api/client-products-bestSellers?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setBestSellerProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);

    } catch (err) {
      setError(err.message);
    }
  };
  

  

  const [paramProducts, setParamProducts] = useState([])


  const fetchParamProducts = async (categoryId, page) => {
    try {
      setSkeletonLoading(true);
      const itemCount = 17;
      const response = await fetch(
        `${backednUrl}/api/params-products?product_type_ids=${categoryId}&items_per_page=${itemCount}&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setSkeletonLoading(false);

      if (!data || !data.data) {
        setSkeletonLoading(false);
        throw new Error('Unexpected API response structure');

      }

      // Always get exactly 9 products (or less if not enough exist)
      setParamProducts(data);
      setTotalApiPages(data.total_pages);
      setSkeletonLoading(false);
    } catch (err) {
      setError(err.message);
      setSkeletonLoading(false);
    }
  };



  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backednUrl}/api/category-products`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      // console.log('API Response:', data);

      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setCategoryProducts(data.data);
      // console.log(data.data, "category products");
    } catch (err) {
      // console.error('Error fetching products:', err);
      setError(err.message);
    }
  };

  const [v1categories, setV1categories] = useState([])
  // ********************************************************************v1 categories
  const fetchV1Categories = async () => {
    // setSkeletonLoading(true);
    try {
      const response = await fetch(`${backednUrl}/api/v1-categories`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      // console.log('API Response:', data);

      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setV1categories(data.data);
    } catch (err) {
      console.log('Error fetching products:', err);
      setError(err.message);
    }
    // finally {
    //   setSkeletonLoading(false);
    // }
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
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (res.data && res.data.data) {
      return { 
        productId, 
        discount: res.data.data.discount || 0,
        discountPrice: res.data.data.discountPrice || 0
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
      message: error.message
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
      toast.error(error.message)
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
      console.error('Error fetching discounts:', error);
    }
  };

  fetchDiscounts();
}, [products]);
  useEffect(()=>{
    dispatch(loadFavouritesFromDB(backednUrl))
  },[])
  // useEffect(() => {
  //   if (products.length === 0) {
  //     fetchProducts(); // Only fetch if products array is empty
  //   }
  // }, []);

  useEffect(() => {
    if (categoryProducts.length === 0) {
      fetchCategories(); // Only fetch if products array is empty
    }
  }, []);


  useEffect(() => {
    if (v1categories.length === 0) {
      fetchV1Categories(); // Only fetch if products array is empty
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchWebUser();
      loadUserOrder();
    }
  }, [token]);
  const value = {
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
    activeTab,
    setActiveTab,
    newId,
    setNewId,
    userData,
    fetchTrendingProducts,
    trendingProducts,
    fetchProductDiscount,
    fetchSearchedProducts,
    fetchProductsCategory,
    productsCategory,
    searchedProducts,
    fetchBestSellerProducts,
    bestSellerProducts,
    backednUrl,
    totalDiscount,
    setTotalDiscount,
    fetchProducts,
    products,
    error,
    skeletonLoading,
    setProducts,
    handleLogout,
    blogs,
    setBlogs,
    options,
    categoryProducts,
    fetchDiscountedProducts,
    discountedProducts,
    setCategoryProducts,
    fetchCategories,
    setDiscountPromo,
    fetchNewArrivalProducts,
    arrivalProducts,
    filterLocalProducts,
    setFilterLocalProducts,
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
    shopCategory, setShopCategory,
    sidebarActiveLabel, setSidebarActiveLabel,

   
    marginApi,
    setMarginApi,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};


// export default AppContextProvider;
export { AppContextProvider };
