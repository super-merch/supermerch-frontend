import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { backgroundColor, getProductPrice, slugify } from "@/utils/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoIosHeart,
  IoMdArrowBack,
  IoMdArrowForward,
} from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPageTypeFromRoute } from "../../config/sidebarConfig";
import { AppContext } from "../../context/AppContext";
import UnifiedSidebar from "../shared/UnifiedSidebar";
import noimage from "/noimage.png";
import SkeletonLoadingCards from "../Common/SkeletonLoadingCards";
import { Clock, Flag } from "lucide-react";

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

const Spromotional = () => {
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedCategory = useSelector((state) => state.filters.categoryId);
  const [cardHover, setCardHover] = useState(null);

  const { activeFilters, minPrice, maxPrice } = useSelector(
    (state) => state.filters
  );
  const isPriceFilterActive = minPrice !== 0 || maxPrice !== 1000;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageType = getPageTypeFromRoute(location.pathname);

  const {
    marginApi,
    productionIds,
    australiaIds,
    paginationData,
    setPaginationData,
    getProducts,
    totalCount,
    productsLoading,
    refetchProducts,
  } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const getProductsData = getProducts?.data;
  const itemsPerPage = getProducts?.items_per_page;
  const totalPages = getProducts?.total_pages;
  const itemCount = totalCount;
  const currentPage = paginationData.page;
  const favSet = new Set();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  useEffect(() => {
    if (searchParams.get("category")) {
      setPaginationData({
        ...paginationData,
        productTypeId: searchParams.get("category"),
      });
    }
  }, [searchParams.get("category")]);

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

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

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`, {
      state: productId,
    });
  };

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[280px]">
          <UnifiedSidebar pageType={pageType} />
        </div>

        <div className="flex-1 w-full lg:mt-0 md:mt-4 mt-4">
          {/* Mobile Layout */}
          <div className="lg:hidden px-4 py-3">
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
                className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-smallHeader shadow-sm hover:bg-smallHeader-dark transition-colors"
              >
                <IoMenu className="text-xl" />
              </button>

              {/* Sort By - Positioned to the right */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Sort by:</p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-between gap-2 px-4 py-3 border w-48 border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 transition-colors"
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
                    <div className="absolute right-0 z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                        onClick={() => handleSortSelection("revelancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg ${
                          sortOption === "revelancy" ? "bg-gray-50" : ""
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
            <div className="mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand text-base">
                  {!productsLoading && itemCount}
                </span>
                <p className="text-sm text-gray-600">
                  {productsLoading
                    ? "Loading..."
                    : `Results found ${
                        selectedCategory ? "(Category)" : "(All Products)"
                      }${isPriceFilterActive ? " (Price filtered)" : ""}`}
                  {productsLoading && " Please wait a while..."}
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
                  {!productsLoading && getProductsData?.length}
                </span>
                <p className="">
                  {productsLoading
                    ? "Loading..."
                    : `Results found ${
                        selectedCategory ? "(Category)" : "(All Products)"
                      }${isPriceFilterActive ? " (Price filtered)" : ""}`}
                  {productsLoading && " Please wait a while..."}
                </p>
              </div>

              {/* Sort Dropdown - Right Side */}
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
                        onClick={() => handleSortSelection("revelancy")}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                          sortOption === "highToLow" ? "bg-gray-100" : ""
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
                ? "grid grid-cols-3 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1"
                : ""
            }`}
          >
            {productsLoading ? (
              [1, 2, 3, 4, 5, 6].map((_, index) => (
                <SkeletonLoadingCards key={index} />
              ))
            ) : getProductsData?.length > 0 ? (
              <div className="grid justify-center grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {getProductsData?.map((product) => {
                  const productId = product.meta.id;
                  const discountPct = product.discountInfo?.discount || 0;
                  const isGlobalDiscount =
                    product.discountInfo?.isGlobal || false;

                  return (
                    <div
                      key={productId}
                      className="relative border border-border2 hover:border-1 hover:rounded-md transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                      onClick={() =>
                        handleViewProduct(
                          product.meta.id,
                          product.overview.name
                        )
                      }
                      onMouseEnter={() => setCardHover(product.meta.id)}
                      onMouseLeave={() => setCardHover(null)}
                    >
                      <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
                        {(productionIds.has(product.meta.id) ||
                          productionIds.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                            <Clock />
                            <span>24Hr Production</span>
                          </span>
                        )}

                        {(australiaIds.has(product.meta.id) ||
                          australiaIds.has(String(product.meta.id))) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
                            <Flag />
                            <span>Australia Made</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 z-20">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToFavourite(product));
                            toast.success("Product added to favourites");
                            // Add your favorite logic here
                          }}
                          className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                        >
                          {favSet.has(product.meta.id) ? (
                            <IoIosHeart className="text-lg text-red-500" />
                          ) : (
                            <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                          )}
                        </div>
                      </div>

                      <div className="max-h-[62%] sm:max-h-[71%] h-full border-b overflow-hidden relative">
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

                      <div className="p-2">
                        <div className=" flex justify-center mb-1 gap-1  z-10">
                          {product?.product?.colours?.list.length > 1 &&
                            (() => {
                              // Extract unique colors and filter out colors with spaces/multiple words
                              const uniqueColors = [
                                ...new Set(
                                  product?.product?.colours?.list
                                    .flatMap((colorObj) => colorObj.colours)
                                    .filter((color) => !color.includes(" ")) // Remove colors with spaces
                                ),
                              ];

                              return uniqueColors
                                .slice(0, 12)
                                .map((color, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      backgroundColor: backgroundColor(color),
                                    }}
                                    className="w-4 h-4 rounded-full border border-slate-900"
                                  />
                                ));
                            })()}
                        </div>
                        <div className="relative flex justify-between text-center">
                          <div className="flex-1">
                            <h2
                              className={`text-sm transition-all duration-300 ${
                                cardHover === product.meta.id &&
                                product.overview.name.length > 20
                                  ? "sm:text-[18px]"
                                  : "sm:text-lg"
                              } font-semibold text-brand sm:leading-[18px] `}
                            >
                              {(product.overview.name &&
                                // product.overview.name.length > 20 && cardHover!==product.meta.id
                                //   ? product.overview.name.slice(0, 20) + "..."
                                product.overview.name) ||
                                "No Name"}
                            </h2>
                            <p className="text-xs text-gray-500 pt-1">
                              Min Qty:{" "}
                              {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}{" "}
                            </p>
                            <div className="">
                              <h2 className="text-base sm:text-lg font-bold text-heading">
                                From $
                                {getProductPrice(product, product.meta.id)}
                              </h2>
                            </div>
                          </div>

                          {discountPct > 0 && (
                            <div className="absolute top-1 sm:top-0 right-1 sm:right-2 z-20">
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="pt-10 text-xl text-center text-red-500">
                  No products found. Explore our categories or refine your
                  search to discover more options
                </p>
              </div>
            )}
          </div>
          {totalPages > 1 && getProductsData.length > 0 && (
            <div className="flex items-center justify-center mt-16 space-x-1 sm:space-x-2 pagination">
              {/* Previous Button */}
              <button
                onClick={() =>
                  setPaginationData((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
                disabled={currentPage === 1}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoMdArrowBack className="text-lg sm:text-xl" />
              </button>

              {/* Page 1 - Always show */}
              <button
                ßonClick={() =>
                  setPaginationData((prev) => ({ ...prev, page: 1 }))
                }
                className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                1
              </button>

              {/* Show ellipsis if there are hidden pages at the start */}
              {currentPage > maxVisiblePages / 2 + 1 &&
                totalPages > maxVisiblePages && (
                  <span className="px-2 text-gray-500">...</span>
                )}

              {/* Middle pages */}
              {getPaginationButtons(currentPage, totalPages, maxVisiblePages)
                .filter((page) => page > 1 && page < totalPages)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setPaginationData((prev) => ({ ...prev, page: page }))
                    }
                    className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Show ellipsis if there are hidden pages at the end */}
              {currentPage < totalPages - maxVisiblePages / 2 &&
                totalPages > maxVisiblePages && (
                  <span className="px-2 text-gray-500">...</span>
                )}

              {/* Last page - Always show if more than 1 page */}
              {totalPages > 1 && (
                <button
                  onClick={() =>
                    setPaginationData((prev) => ({ ...prev, page: totalPages }))
                  }
                  className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              )}

              {/* Next Button */}
              <button
                onClick={() =>
                  setPaginationData((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, totalPages),
                  }))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoMdArrowForward className="text-lg sm:text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Spromotional;
