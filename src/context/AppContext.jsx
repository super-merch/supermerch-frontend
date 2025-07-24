import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
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
      alert('An error occurred while fetching the address.');
    }
  };


  // *************************************************Client paginate api
   
  const fetchProducts = async (page = 1, sort = '') => {
    setSkeletonLoading(true);
    try {
      const limit = 100;
      const response = await fetch(
        `${backednUrl}/api/client-products?page=${page}&limit=${limit}&sort=${sort}?filter=true`
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Validate response structure if needed
      if (!data || !data.data) {
        throw new Error('Unexpected API response structure');
      }

      setProducts(data.data);
      // Uncomment if total_pages is needed
      // setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
      setSkeletonLoading(false);
    } finally {
      setSkeletonLoading(false);
    }
  };
  const [trendingProducts,setTrendingProducts] = useState([])
  const fetchTrendingProducts = async (page = 1, sort = '') => {
    setSkeletonLoading(true);
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
      setSkeletonLoading(false);
    } finally {
      setSkeletonLoading(false);
    }
  };
  const [arrivalProducts,setArrivalProducts] = useState([])
  const fetchNewArrivalProducts = async (page = 1, sort = '') => {
    setSkeletonLoading(true);
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
      setSkeletonLoading(false);
    } finally {
      setSkeletonLoading(false);
    }
  };
  const [discountedProducts,setDiscountedProducts] = useState([])
  const fetchDiscountedProducts = async (page = 1, sort = '') => {
    setSkeletonLoading(true);
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
      setSkeletonLoading(false);
    } finally {
      setSkeletonLoading(false);
    }
  };
const [bestSellerProducts,setBestSellerProducts] = useState([])
  const fetchBestSellerProducts = async (page = 1, sort = '') => {
    setSkeletonLoading(true);
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
      setSkeletonLoading(false);
    } finally {
      setSkeletonLoading(false);
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
    listDiscount();
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

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(); // Only fetch if products array is empty
    }
  }, []);

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
    discountPromo,
    setDiscountPromo,
    fetchNewArrivalProducts,
    arrivalProducts,
    listDiscount,
    filterLocalProducts,
    setFilterLocalProducts,
    discountPromo,
  globalDiscount,
  getGlobalDiscount,
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
