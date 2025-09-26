import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import { setMinPrice, setMaxPrice, applyFilters } from "../redux/slices/filterSlice";

/**
 * Reusable hook for handling URL parameter-based product filtering
 * 
 * Features:
 * - Reads categoryName, subCategory, and category from URL parameters
 * - Automatically sets Redux state for category filtering
 * - Provides filtered products based on URL parameters
 * - Handles special cases like Sale, 24 Hour Production, Australia Made
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to automatically fetch products (default: true)
 * @param {string} options.pageType - Page type for special filtering (Sale, 24Hour, Australia)
 * @returns {Object} - Filtering state and utilities
 */
export const useProductFiltering = (options = {}) => {
  const { autoFetch = true, pageType = null } = options;
  
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { 
    setSelectedParamCategoryId, 
    setCurrentPage, 
    setSidebarActiveCategory, 
    setActiveFilterCategory,
    fetchParamProducts,
    paramProducts,
    fetchProducts,
    products: contextProducts,
    fetchHourProducts,
    hourProd,
    fetchAustraliaProducts,
    australiaProd
  } = useContext(AppContext);

  // Redux state
  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentProducts, setCurrentProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  // Extract URL parameters
  const urlCategory = searchParams.get("category");
  const urlCategoryName = searchParams.get("categoryName");
  const urlSubCategory = searchParams.get("subCategory");
  const urlLabel = searchParams.get("label");
  
  // Decode URL parameters
  const decodedCategoryName = urlCategoryName ? decodeURIComponent(urlCategoryName) : "";
  const decodedSubCategory = urlSubCategory ? decodeURIComponent(urlSubCategory) : "";
  const decodedLabel = urlLabel ? decodeURIComponent(urlLabel) : "";

  // Determine filtering mode based on page type and URL parameters
  const getFilteringMode = () => {
    if (pageType === "SALE") return "sale";
    if (pageType === "24HOUR") return "24hour";
    if (pageType === "AUSTRALIA") return "australia";
    if (urlCategory && decodedCategoryName) return "category";
    return "all";
  };

  const filteringMode = getFilteringMode();

  // Handle URL parameter changes and set Redux state
  useEffect(() => {
    if (urlCategory && decodedCategoryName) {
      setSelectedParamCategoryId(urlCategory);
      setSidebarActiveCategory(decodedCategoryName);
      
      if (decodedSubCategory) {
        setActiveFilterCategory(decodedSubCategory);
      } else if (decodedLabel) {
        setActiveFilterCategory(decodedLabel);
      }
      
      setCurrentPage(1);
    }
  }, [urlCategory, decodedCategoryName, decodedSubCategory, decodedLabel, 
      setSelectedParamCategoryId, setSidebarActiveCategory, setActiveFilterCategory, setCurrentPage]);

  // Fetch products based on filtering mode
  useEffect(() => {
    if (!autoFetch) return;

    const fetchProductsByMode = async () => {
      setIsLoading(true);
      setError("");

      try {
        switch (filteringMode) {
          case "category":
            if (urlCategory && !isPriceFilterActive) {
              await fetchParamProducts(urlCategory, 1);
            }
            break;
            
          case "sale":
            // Fetch products with sale tag
            await fetchProducts(1, "", "sale");
            break;
            
          case "24hour":
            // Fetch 24-hour production products
            await fetchHourProducts(1, 9, "");
            break;
            
          case "australia":
            // Fetch Australia-made products
            await fetchAustraliaProducts(1, 9, "");
            break;
            
          case "all":
          default:
            // Fetch all products
            await fetchProducts(1, "");
            break;
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error fetching products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsByMode();
  }, [filteringMode, urlCategory, autoFetch, isPriceFilterActive, 
      fetchParamProducts, fetchProducts, fetchHourProducts, fetchAustraliaProducts]);

  // Update current products based on filtering mode
  useEffect(() => {
    switch (filteringMode) {
      case "category":
        if (paramProducts?.data) {
          setCurrentProducts(paramProducts.data);
          setTotalPages(paramProducts.total_pages || 0);
        }
        break;
        
      case "sale":
        if (contextProducts) {
          setCurrentProducts(contextProducts);
          setTotalPages(Math.ceil(contextProducts.length / 9));
        }
        break;
        
      case "24hour":
        if (hourProd?.data) {
          setCurrentProducts(hourProd.data);
          setTotalPages(hourProd.total_pages || 0);
        }
        break;
        
      case "australia":
        if (australiaProd?.data) {
          setCurrentProducts(australiaProd.data);
          setTotalPages(australiaProd.total_pages || 0);
        }
        break;
        
      case "all":
      default:
        if (contextProducts) {
          setCurrentProducts(contextProducts);
          setTotalPages(Math.ceil(contextProducts.length / 9));
        }
        break;
    }
  }, [filteringMode, paramProducts, contextProducts, hourProd, australiaProd]);

  // Reset filters when URL changes
  const resetFilters = () => {
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  };

  // Get current filter info for display
  const getFilterInfo = () => {
    if (decodedSubCategory) {
      return { type: "subcategory", name: decodedSubCategory, category: decodedCategoryName };
    }
    if (decodedLabel) {
      return { type: "label", name: decodedLabel, category: decodedCategoryName };
    }
    if (decodedCategoryName) {
      return { type: "category", name: decodedCategoryName };
    }
    if (pageType === "SALE") {
      return { type: "tag", name: "Sale" };
    }
    if (pageType === "24HOUR") {
      return { type: "tag", name: "24 Hour Production" };
    }
    if (pageType === "AUSTRALIA") {
      return { type: "tag", name: "Australia Made" };
    }
    return { type: "all", name: "All Products" };
  };

  return {
    // State
    isLoading,
    error,
    currentProducts,
    totalPages,
    
    // URL parameters
    urlCategory,
    urlCategoryName: decodedCategoryName,
    urlSubCategory: decodedSubCategory,
    urlLabel: decodedLabel,
    
    // Filtering info
    filteringMode,
    filterInfo: getFilterInfo(),
    
    // Utilities
    resetFilters,
    isPriceFilterActive
  };
};

export default useProductFiltering;
