import { useEffect, useRef, useState, useCallback } from "react";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import UnifiedSidebar from "../shared/UnifiedSidebar";
import { getPageTypeFromRoute } from "../../config/sidebarConfig";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import noimage from "/noimage.png";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import useProductFiltering from "../../hooks/useProductFiltering";
import ProductSkeleton from "../shared/ProductSkeleton";

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

const CardsWithFiltering = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageType = getPageTypeFromRoute(location.pathname);

  // Get Redux filter state
  const { minPrice, maxPrice } = useSelector((state) => state.filters);
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  // Use the reusable product filtering hook
  const { isLoading, error, currentProducts, totalPages, urlCategoryName, filterInfo, resetFilters, isPriceFilterActive } =
    useProductFiltering({
      autoFetch: true,
      pageType: pageType === "SALE" ? "SALE" : pageType === "24HOUR" ? "24HOUR" : pageType === "AUSTRALIA" ? "AUSTRALIA" : null,
    });

  // Create a set of favorite product IDs for quick lookup
  const favSet = new Set(favouriteItems.map((item) => item.meta.id));

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
    const price = priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;

    // Cache the result
    priceCache.current.set(productId, price);
    return price;
  }, []);

  // Apply sorting to current products
  const getSortedProducts = () => {
    if (!currentProducts || currentProducts.length === 0) return [];

    const sorted = [...currentProducts].sort((a, b) => {
      const priceA = getRealPrice(a);
      const priceB = getRealPrice(b);

      switch (sortOption) {
        case "lowToHigh":
          return priceA - priceB;
        case "highToLow":
          return priceB - priceA;
        case "nameAsc":
          return (a.product?.name || "").localeCompare(b.product?.name || "");
        case "nameDesc":
          return (b.product?.name || "").localeCompare(a.product?.name || "");
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Get current page products
  const getCurrentPageProducts = () => {
    const sortedProducts = getSortedProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  };

  // Handle sort changes
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (product) => {
    dispatch(addToFavourite(product));
    toast.success(favSet.has(product.meta.id) ? "Removed from favorites" : "Added to favorites");
  };

  // Handle product click
  const handleProductClick = (product) => {
    navigate("/product", { state: product });
  };

  // Clear price filter
  const handleClearPriceFilter = () => {
    resetFilters();
    setCurrentPage(1);
  };

  // Get total count for display
  const getTotalCount = () => {
    return currentProducts ? currentProducts.length : 0;
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    if (filterInfo.type === "subcategory") {
      return `${filterInfo.category} - ${filterInfo.name}`;
    }
    if (filterInfo.type === "category") {
      return filterInfo.name;
    }
    if (filterInfo.type === "tag") {
      return filterInfo.name;
    }
    return "All Products";
  };

  // Update max visible pages based on total pages
  useEffect(() => {
    if (totalPages <= 6) {
      setMaxVisiblePages(totalPages);
    } else {
      setMaxVisiblePages(6);
    }
  }, [totalPages]);

  // Reset page when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentProducts, sortOption]);

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[25%]">
          <UnifiedSidebar pageType={pageType} />
        </div>

        <div className="lg:w-[75%] w-full lg:mt-0 md:mt-4 ">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Product Count - Left Side */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-brand">{!isLoading && getTotalCount()}</span>
              <p className="">
                {isLoading ? "Loading..." : `Results found for ${getFilterDisplayText()}${isPriceFilterActive ? " (Price filtered)" : ""}`}
              </p>
            </div>

            {/* Sort Dropdown - Right Side */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span>Sort by</span>
                  {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => handleSortChange("")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === "" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => handleSortChange("lowToHigh")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOption === "lowToHigh" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => handleSortChange("highToLow")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOption === "highToLow" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => handleSortChange("nameAsc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOption === "nameAsc" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      Name: A to Z
                    </button>
                    <button
                      onClick={() => handleSortChange("nameDesc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOption === "nameDesc" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      Name: Z to A
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters - Only show if there are active filters */}
          {(urlCategoryName || isPriceFilterActive) && (
            <div className="flex flex-wrap items-center gap-4 mt-4 px-2">
              {urlCategoryName && (
                <div className="filter-item">
                  <span className="text-md font-semibold">{getFilterDisplayText()}</span>
                </div>
              )}
              {isPriceFilterActive && (
                <div className="filter-item">
                  <span className="text-md font-semibold">
                    Price: ${minPrice} - ${maxPrice}
                  </span>
                  <button onClick={handleClearPriceFilter} className="ml-2 text-red-500 hover:text-red-700">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoading ? (
              <ProductSkeleton count={9} />
            ) : getCurrentPageProducts().length > 0 ? (
              getCurrentPageProducts().map((product) => {
                const isFavorite = favSet.has(product.meta.id);
                const price = getRealPrice(product);

                return (
                  <div
                    key={product.meta.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative">
                      <img
                        src={product.product?.images?.[0]?.url || noimage}
                        alt={product.product?.name || "Product"}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(product);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      >
                        {isFavorite ? <IoIosHeart className="text-red-500 text-xl" /> : <CiHeart className="text-gray-600 text-xl" />}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.product?.name || "Unnamed Product"}</h3>
                      <p className="text-lg font-bold text-brand">${price.toFixed(2)}</p>
                      {product.product?.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.product.description}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoMdArrowBack />
                Previous
              </button>

              {getPaginationButtons(currentPage, totalPages, maxVisiblePages).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md ${
                    currentPage === page ? "bg-brand text-white border-brand" : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <IoMdArrowForward />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{selectedProduct.product?.name}</h2>
            <p className="text-gray-600 mb-4">{selectedProduct.product?.description}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={() => {
                  handleProductClick(selectedProduct);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardsWithFiltering;
