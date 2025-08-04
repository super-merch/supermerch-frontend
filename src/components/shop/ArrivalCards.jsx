import React, { useContext, useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { setSearchText, applyFilters } from "../../redux/slices/filterSlice";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";

import { setProducts } from "../../redux/slices/filterSlice";
import noimage from "/noimage.png";

import {
  setSelectedBrands,
  setMinPrice,
  setMaxPrice,
  setSelectedCategory,
} from "../../redux/slices/filterSlice";
import { AppContext } from "../../context/AppContext";
import SideBar2 from "./SideBar2";

const ArrivalCards = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    fetchNewArrivalProducts,
    arrivalProducts: contextTrendingProducts,
    skeletonLoading,
    marginApi,
    totalDiscount,
  } = useContext(AppContext);

  const { searchText, activeFilters, filteredCount } = useSelector(
    (state) => state.filters
  );
  console.log(filteredCount, "filteredCount");

  const filteredProducts = useSelector(
    (state) => state.filters.filteredProducts
  );

  useEffect(() => {
    if (contextTrendingProducts) {
      dispatch(setProducts(contextTrendingProducts));
    }
  }, [contextTrendingProducts, dispatch]);

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
    dispatch(applyFilters());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getRealPrice = (product) => {
      const priceGroups = product.product?.prices?.price_groups || [];
      const basePrice = priceGroups.find((group) => group?.base_price) || {};
      const priceBreaks = basePrice.base_price?.price_breaks || [];
      
      const prices = priceBreaks
        .map((breakItem) => breakItem.price)
        .filter((price) => price !== undefined);
      
      let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      // Apply margin
      const productId = product.meta.id;
      const marginEntry = marginApi[productId] || {};
      const marginFlat = typeof marginEntry.marginFlat === "number" ? marginEntry.marginFlat : 0;
      minPrice += marginFlat;
      
      return minPrice;
    };

    const priceA = getRealPrice(a);
    const priceB = getRealPrice(b);

    if (sortOption === "lowToHigh") return priceA - priceB;
    if (sortOption === "highToLow") return priceB - priceA;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const showPagination = sortedProducts.length > itemsPerPage;
  const currentItems = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilter = (filterType) => {
    if (filterType === "category") dispatch(setSelectedCategory("all"));
    if (filterType === "brand") dispatch(setSelectedBrands([]));
    if (filterType === "price") {
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));
    }
    dispatch(applyFilters());
  };

  useEffect(() => {
    fetchNewArrivalProducts(currentPage);
  }, [currentPage]);

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
  };

  const setSearchTextChanger = (e) => {
    dispatch(setSearchText(e.target.value));
    dispatch(applyFilters());
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[25%]">
          <SideBar2 />
        </div>

        <div className="lg:w-[75%] w-full  lg:mt-0 md:mt-4 mt-16">
          <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
            <div className="flex items-center justify-between border border-border2 px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
              <input
                type="text"
                placeholder="Search for new arrival products..."
                className="w-full border-none outline-none"
                value={searchText}
                onChange={setSearchTextChanger}
              />
              <IoSearchOutline className="text-2xl" />
            </div>
            <div className="flex items-center gap-3">
              <p>Sort by:</p>
              <div className="relative " ref={dropdownRef}>
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
              {activeFilters.category && activeFilters.category !== "all" && (
                <div className="filter-item">
                  <span className="text-sm">{activeFilters.category}</span>
                  <button
                    className="px-2 text-lg"
                    onClick={() => handleClearFilter("category")}
                  >
                    x
                  </button>
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

            <div className="flex items-center gap-1 pt-3 lg:pt-0 md:pt-0 sm:pt-0 ">
              {" "}
              <span className="font-semibold text-brand">{filteredCount}</span>
              <p className="">New Arrivals Results found</p>
            </div>
          </div>

          <div
            className={`${
              skeletonLoading
                ? "grid grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1"
                : ""
            }`}
          >
            {skeletonLoading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="relative p-4 border rounded-lg shadow-md border-border2 "
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
            ) : (
              <div className="grid grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {currentItems.length !== 0 &&
                  currentItems
                    .filter((product) => {
                      const priceGroups =
                        product.product?.prices?.price_groups || [];
                      const basePrice =
                        priceGroups.find((group) => group?.base_price) || {};
                      const priceBreaks =
                        basePrice.base_price?.price_breaks || [];
                      // Check if there's at least one valid price
                      return (
                        priceBreaks.length > 0 &&
                        priceBreaks[0]?.price !== undefined
                      );
                    })
                    .map((product) => {
                      const priceGroups =
                        product.product?.prices?.price_groups || [];
                      const basePrice =
                        priceGroups.find((group) => group?.base_price) || {};
                      const priceBreaks =
                        basePrice.base_price?.price_breaks || [];

                      // Get an array of prices from priceBreaks (these are already discounted)
                      const prices = priceBreaks
                        .map((breakItem) => breakItem.price)
                        .filter((price) => price !== undefined);

                      // 1) compute raw min/max
                      let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                      // 2) pull margin info (guarding against undefined)
                      const productId = product.meta.id;
                      const marginEntry = marginApi[productId] || {};
                      const marginFlat =
                        typeof marginEntry.marginFlat === "number"
                          ? marginEntry.marginFlat
                          : 0;
                      const baseMarginPrice =
                        typeof marginEntry.baseMarginPrice === "number"
                          ? marginEntry.baseMarginPrice
                          : 0;

                      // 3) apply the flat margin to both ends of the range
                      minPrice += marginFlat;
                      maxPrice += marginFlat;

                      // Get discount percentage from product's discount info
                      const discountPct = product.discountInfo?.discount || 0;
                      const isGlobalDiscount = product.discountInfo?.isGlobal || false;

                      return (
                        <div
                          key={product.id}
                          
                          className="relative border border-border2 cursor-pointer max-h-[350px] h-full group"
                        >
                          {/* Show discount badge */}
                          {discountPct > 0 && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                                {discountPct}%
                              </span>
                              {isGlobalDiscount && (
                                <span className="block px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded mt-1">
                                  Global
                                </span>
                              )}
                            </div>
                          )}
                          {/* Add trending badge */}
                          {/* <span className="absolute px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded top-2 left-2">
                            New Arrival
                          </span> */}
                          <div onClick={() => handleViewProduct(product.meta.id)} className="max-h-[50%] h-full border-b overflow-hidden">
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
                          <div className="absolute w-18 grid grid-cols-2 gap-1 top-[2%] left-[5%]">
                          {product?.product?.colours?.list.length > 0 &&
                            product?.product?.colours?.list
                              .slice(0, 15) // Limit to 15 colors
                              .flatMap((colorObj, index) =>
                                colorObj.colours.map((color, subIndex) => (
                                  <div
                                    key={`${index}-${subIndex}`}
                                    style={{
                                      backgroundColor:
                                        colorObj.swatch?.[subIndex] ||
                                        color.toLowerCase(),
                                    }}
                                    className="w-4 h-4 rounded-sm border border-slate-900"
                                  />
                                ))
                              )}
                        </div>
                          <div className="p-3">
                            <div className="text-center ">
                              <h2 className="text-lg font-medium text-brand ">
                                {product.overview.name ||
                                product.overview.name.length > 22
                                  ? product.overview.name.slice(0, 22) + "..."
                                  : "No Name "}
                              </h2>
                              <p className="font-normal text-brand">
                                {" "}
                                Code: {product.overview.code}
                              </p>
                              {/* Updated Price display matching AllProducts logic */}
                              <div className="pt-2">
                                <h2 className="text-xl font-semibold text-heading">
                                  $
                                  {minPrice === maxPrice ? (
                                    <span>{minPrice.toFixed(2)}</span>
                                  ) : (
                                    <span>
                                      {minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                                    </span>
                                  )}
                                </h2>
                                {discountPct > 0 && (
                                  <p className="text-xs text-green-600 font-medium">
                                    {discountPct}% discount applied
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between gap-1 mt-2 mb-1">
                              <p className="p-3 text-2xl rounded-sm bg-icons">
                                <CiHeart />
                              </p>
                              <div onClick={() => handleViewProduct(product.meta.id)} className="flex items-center justify-center w-full gap-1 px-2 py-3 text-white rounded-sm cursor-pointer bg-smallHeader">
                                <p className="text-xl">
                                  <IoCartOutline />
                                </p>
                                <button className="text-sm uppercase">
                                  Add to cart
                                </button>
                              </div>
                              <p
                                onClick={() => handleOpenModal(product)}
                                className="p-2 sm:p-3 flex items-center text-lg sm:text-2xl rounded-sm bg-icons cursor-pointer hover:bg-opacity-80 transition-colors"
                              >
                                <AiOutlineEye />
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            )}
          </div>

          {showPagination && (
            <div className="flex items-center justify-center mt-16 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 px-2 border-2 rounded-full border-smallHeader hover:bg-gray-200"
              >
                <IoMdArrowBack className="text-xl text-smallHeader" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 border rounded-full ${
                      currentPage === page
                        ? "bg-smallHeader text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 px-2 border-2 rounded-full border-smallHeader hover:bg-gray-200"
              >
                <IoMdArrowForward className="text-xl text-smallHeader" />
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
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            {/* Image container */}
            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Product info */}
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-brand mb-2">
                  {selectedProduct.overview.name || "No Name"}
                </h2>
                <p className="text-gray-600 mb-2">
                  Code: {selectedProduct.overview.code}
                </p>
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

export default ArrivalCards;