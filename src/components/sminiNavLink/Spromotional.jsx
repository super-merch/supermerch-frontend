import React, { useContext, useEffect, useRef, useState } from "react";
import { IoClose, IoMenu, IoSearchOutline } from "react-icons/io5";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
// import Sidebar from "./Sidebar";
import { setSearchText, applyFilters } from "../../redux/slices/filterSlice";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";

import Skeleton from "react-loading-skeleton";
// import { fetchcategoryProduct } from "../../redux/slices/categorySlice";

// import { selectProducts } from "../../redux/slices/filterSlice";
// import useFetchLatestProducts from "../../hooks/useFetchLatestDeals";
// import { setProducts } from "../../redux/slices/filterSlice";
import noimage from "/noimage.png";

import {
  setSelectedBrands,
  setMinPrice,
  setMaxPrice,
  setSelectedCategory,
} from "../../redux/slices/filterSlice";
import { AppContext } from "../../context/AppContext";
import { matchProduct } from "@/redux/slices/categorySlice";
import SpromotionalSidebar from "./SpromotionalSidebar";
import {
  matchPromotionalProduct,
  setAllProducts,
} from "@/redux/slices/promotionalSlice";
import PromotionalPriceFilter from "../miniNavLinks/promotionalComps/PromotionalPriceFilter";
import PromotionalBrandFilter from "../miniNavLinks/promotionalComps/PromotionalBrandFilter";
import PromotionalPopularTags from "../miniNavLinks/promotionalComps/PromotionalPopularTags";
import { toast } from "react-toastify";
import { megaMenu } from "@/assets/assets";
import { addToFavourite } from "@/redux/slices/favouriteSlice";

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

const Spromotional = () => {
  const [itemsPerPage] = useState(9);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [priceRangeFilter, setPriceRangeFilter] = useState([0, 1000]);

  const [clicked, setClicked] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const {
    fetchProducts,
    products: contextProducts,
    skeletonLoading,
    discountPromo,
    setDiscountPromo,
    categoryProducts,
    filterLocalProducts,
    setFilterLocalProducts,
    fetchParamProducts,
    paramProducts,
    setParamProducts,
    selectedParamCategoryId,
    setSelectedParamCategoryId,
    totalApiPages,
    setTotalApiPages,
    activeFilterCategory,
    setActiveFilterCategory,
    currentPage,
    setCurrentPage,
    v1categories,
    setV1categories,
    sidebarActiveCategory,
    setSidebarActiveCategory,
    sidebarActiveLabel,
    setSidebarActiveLabel,
  } = useContext(AppContext);

  const { searchText, activeFilters, filteredCount } = useSelector(
    (state) => state.filters
  );
  // console.log(filteredCount, 'filteredCount');

  const filteredProducts = useSelector(
    (state) => state.promotionals.filteredPromotionalProducts
  );

  // console.log(filteredProducts, "spromotionla");

  // const [filterLocalProducts, setFilterLocalProducts] = useState(filteredProducts)
  // useEffect(() => {
  //   setFilterLocalProducts(filteredProducts);
  // }, [filterLocalProducts, currentPage]);

  // console.log(filterLocalProducts, "locla state products");

  const matchedProducts = filteredProducts.filter((product) => {
    const typeId =
      product.product?.categorisation?.promodata_product_type?.type_id;
    if (!typeId) return false;
    // Check if this typeId exists in any of the categoryProducts subTypes
    return categoryProducts.some((category) =>
      category.subTypes.some((sub) => sub.id === typeId)
    );
  });

  useEffect(() => {
    if (contextProducts) {
      dispatch(setAllProducts(contextProducts));
    }
  }, [contextProducts, dispatch]);

  useEffect(() => {
    dispatch(applyFilters());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // useEffect(() => {
  //   dispatch(applyFilters());
  // }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  // const showPagination = sortedProducts.length > itemsPerPage;
  // const currentItems = sortedProducts.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  const handleClearFilter = (filterType) => {
    if (filterType === "category") dispatch(setSelectedCategory("all"));
    if (filterType === "brand") dispatch(setSelectedBrands([]));
    if (filterType === "price") {
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000));
    }
    dispatch(applyFilters());
  };

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "promotional" });
  };

  // const setSearchTextChanger = (e) => {
  //   dispatch(setSearchText(e.target.value));
  //   dispatch(applyFilters());
  // };

  const [searchProductName, setSearchProductName] = useState("");
  const setSearchTextChanger = (e) => setSearchProductName(e.target.value);

  const { categoryProduct, status, error } = useSelector(
    (state) => state.categoryProduct
  );

  // useEffect(() => {
  //   fetchProducts(currentPage);
  // }, [currentPage]);

  // Fetch products when currentPage (or sortOption) changes
  useEffect(() => {
    fetchProducts(currentPage, sortOption).then((response) => {
      // Assuming your API response includes total_pages
      if (response && response.total_pages) {
        setTotalApiPages(response.total_pages);
      }
    });
  }, [currentPage, sortOption]);

  useEffect(() => {
    setFilterLocalProducts(filteredProducts);
  }, [filteredProducts]);

  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage] = useState(9);
  // const [maxVisiblePages, setMaxVisiblePages] = useState(6);
  // const [sortOption, setSortOption] = useState("");
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const dropdownRef = useRef(null);

  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  // From AppContext, we fetch products and categoryProducts.
  // const { fetchProducts, products: contextProducts, skeletonLoading, categoryProducts } = useContext(AppContext);

  // Get filter-related data from Redux (if needed elsewhere).
  // const { searchText, activeFilters, filteredCount } = useSelector((state) => state.filters);

  // Define setSearchTextChanger if you use a search input.
  // const setSearchTextChanger = (e) => {
  //   dispatch(setSearchText(e.target.value));
  //   dispatch(applyFilters());
  // };

  // Use only the promotional slice filtered products for display.
  // const filteredProducts = useSelector((state) => state.promotionals.filteredPromotionalProducts);

  // Fetch products on mount.
  // useEffect(() => {
  //   fetchProducts();
  // }, [fetchProducts]);

  // When contextProducts updates, set all products in the promotional slice.
  useEffect(() => {
    if (contextProducts) {
      dispatch(setAllProducts(contextProducts));
    }
  }, [contextProducts, dispatch]);

  // Once both categoryProducts and contextProducts are available, filter them.
  useEffect(() => {
    if (categoryProducts && contextProducts) {
      dispatch(
        matchPromotionalProduct({
          categoryProducts,
          checkAllPro: contextProducts,
        })
      );
    }
  }, [categoryProducts, contextProducts, dispatch]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adjust visible pages on window resize.
  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth <= 767 ? 4 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // When a category button is clicked, save the categoryId and reset to page 1.
  const handleSubCategories = (
    subCategory,
    categoryId,
    titleName,
    labelName
  ) => {
    // console.log("Clicked category:", subCategory, "with ID:", categoryId);
    // if (!categoryId) {
    //   toast.error("Category ID is missing!");
    //   return;
    // }
    // setSearchParams({ categoryName: titleName, category: categoryId });
    const encodedTitleName = encodeURIComponent(titleName); // Encode the title
    const encodedlabelName = encodeURIComponent(labelName); // Encode the title
    setSearchParams({
      categoryName: encodedTitleName,
      category: categoryId,
      label: encodedlabelName,
    });
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlCategoryName = searchParams.get("categoryName");
    const decodedCategoryName = urlCategoryName
      ? decodeURIComponent(urlCategoryName)
      : "";
    const urlLabel = searchParams.get("label");
    const decodedLabel = urlLabel ? decodeURIComponent(urlLabel) : "";
    setSidebarActiveLabel(decodedLabel);

    if (urlCategory && decodedCategoryName) {
      // Set the selected category from URL
      setSelectedParamCategoryId(urlCategory);
      // Loop over v1categories and their subTypes to find a matching sub-category
      let foundSubCategory = null;
      // for (const category of v1categories) {
      //   const sub = category.subTypes.find((item) => item.id === urlCategory);
      //   if (sub) {
      //     foundSubCategory = sub;
      //     break;
      //   }
      // }

      for (const category of megaMenu) {
        // Check all subType groups in the category
        for (const subTypeGroup of category.subTypes) {
          // Search through items in each group
          const matchingItem = subTypeGroup.items.find(
            (item) => item.id === urlCategory
          );
          if (matchingItem) {
            foundSubCategory = matchingItem;
            break;
          }
        }
        if (foundSubCategory) break;
      }

      if (foundSubCategory) {
        setActiveFilterCategory(foundSubCategory.name);
        setSidebarActiveCategory(decodedCategoryName);
      }
    }
  }, [searchParams, setSelectedParamCategoryId, v1categories]);

  // Whenever the selected category or page changes, call the API.
  useEffect(() => {
    const fetchData = async () => {
      if (selectedParamCategoryId) {
        try {
          // fetchParamProducts should update the context state (paramProducts)
          await fetchParamProducts(selectedParamCategoryId, currentPage);
        } catch (error) {
          toast.error("Error fetching products for category");
        }
      }
    };
    fetchData();
  }, [selectedParamCategoryId, currentPage]);

  // Update total API pages based on the API response.
  useEffect(() => {
    if (paramProducts && paramProducts.total_pages) {
      setTotalApiPages(paramProducts.total_pages);
    }
  }, [paramProducts]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1025);
      if (window.innerWidth > 1025) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // console.log(paramProducts, "paramProducts");

  // console.log(activeFilterCategory, "activeFilterCategory");

  // console.log(sidebarActiveCategory, "sidebarActiveCategory");
  const filteredCategories = sidebarActiveCategory
    ? megaMenu.filter((category) => category.name === sidebarActiveCategory)
    : megaMenu;

  const getRealPrice = (product) => {
    const priceGroups = product.product?.prices?.price_groups || [];
    const basePrice = priceGroups.find((group) => group?.base_price) || {};
    const priceBreaks = basePrice.base_price?.price_breaks || [];
    return priceBreaks[0]?.price !== undefined ? priceBreaks[0].price : 0;
  };
  const filterParamProducts = (paramProducts.data || []).filter((product) => {
    const price = getRealPrice(product);
    return price >= priceRangeFilter[0] && price <= priceRangeFilter[1];
  });

  const sortedProducts = [...filterParamProducts].sort((a, b) => {
    const priceA = getRealPrice(a);
    const priceB = getRealPrice(b);

    if (sortOption === "lowToHigh") return priceA - priceB;
    if (sortOption === "highToLow") return priceB - priceA;
    return 0;
  });

  // After sorting products, add a filter for search text:
  const finalFilteredProducts = sortedProducts.filter((product) => {
    // Extract the price as before
    const priceGroups = product.product?.prices?.price_groups || [];
    const basePrice = priceGroups.find((group) => group?.base_price) || {};
    const priceBreaks = basePrice.base_price?.price_breaks || [];
    const realPrice =
      priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
        ? priceBreaks[0].price
        : "0";

    // Ensure the product has a valid price and that the product name includes the search text
    const productName = product.overview.name || "";
    return (
      realPrice !== "0" &&
      productName.toLowerCase().includes(searchProductName.toLowerCase())
    );
  });

  // console.log(activeFilterCategory, "activeFilterCategory");
  // console.log(sidebarActiveLabel, "sidbearactiveLabel");

  return (
    <>
      <div className="relative flex justify-between pt-2 Mycontainer lg:gap-4 md:gap-4">
        <div className="lg:w-[22%]">
          {/* <SpromotionalSidebar filterLocalProducts={filterLocalProducts} setFilterLocalProducts={setFilterLocalProducts} /> */}

          <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute px-2 py-1 text-white rounded top-4 bg-smallHeader"
              >
                {isSidebarOpen ? (
                  <IoClose className="text-xl" />
                ) : (
                  <IoMenu className="text-xl" />
                )}
              </button>
            )}

            {/* Sidebar */}
            <div
              className={`transition-all ${
                isSidebarOpen
                  ? "lg:w-[100%] z-10 mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen md:shadow-lg shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4"
                  : "hidden"
              }`}
            >
              <div className="h-full pr-3 overflow-y-auto">
                <div className="pb-6 border-b-2">
                  {filteredCategories.map((category) => (
                    <div key={category.id}>
                      <p className="text-lg font-semibold text-blue-500">
                        {category.name}
                      </p>
                      <ul>
                        {category.subTypes
                          .filter(
                            (group) =>
                              !sidebarActiveLabel ||
                              group.label === sidebarActiveLabel
                          )
                          .map((group) => (
                            <li key={group.label}>
                              <p className="mt-2 text-base font-semibold">
                                {group.label}
                              </p>
                              <ul>
                                {group?.items?.map((item) => (
                                  <li key={item.id} className="hover:underline">
                                    <button
                                      onClick={() =>
                                        handleSubCategories(
                                          item.name,
                                          item.id,
                                          category.name,
                                          group.label
                                        )
                                      }
                                      className={`font-medium text-[13px] block ${
                                        activeFilterCategory === item.name
                                          ? "text-blue-500"
                                          : ""
                                      }`}
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <PromotionalPriceFilter
                    priceRangeFilter={priceRangeFilter}
                    setPriceRangeFilter={setPriceRangeFilter}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* ************************************ */}
        </div>

        <div className="lg:w-[75%] w-full  lg:mt-0 md:mt-4 mt-16">
          <div className="flex flex-wrap items-center justify-end gap-3 lg:justify-between md:justify-between">
            <div className="flex items-center justify-between border border-border2 px-3 py-3 lg:w-[43%] md:w-[42%] w-full">
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full border-none outline-none"
                value={searchProductName}
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
                    <button
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100`}
                    >
                      Trending
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
              <p className="">Results found</p>
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
            ) : paramProducts &&
              paramProducts.data &&
              paramProducts.data.length > 0 ? (
              <div className="grid justify-center grid-cols-1 gap-6 mt-10 custom-card:grid-cols-2 lg:grid-cols-3 max-sm2:grid-cols-1">
                {paramProducts?.data?.length !== 0 &&
                  finalFilteredProducts
                    .slice(0, 9)
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

                      // Get an array of prices from priceBreaks
                      const prices = priceBreaks
                        .map((breakItem) => breakItem.price)
                        .filter((price) => price !== undefined);

                      // Calculate the minimum and maximum price values
                      const minPrice =
                        prices.length > 0 ? Math.min(...prices) : "0";
                      const maxPrice =
                        prices.length > 0 ? Math.max(...prices) : "0";
                      return (
                        <div
                          key={product.id}
                          // onClick={() => handleViewProduct(product.meta.id)}
                          className="relative w-full border border-border2 h-full flex flex-col cursor-pointer max-h-[350px] group"
                        >
                          <div className="max-h-[50%] h-full border-b overflow-hidden">
                            <img
                              src={
                                product.overview.hero_image
                                  ? product.overview.hero_image
                                  : noimage
                              }
                              alt=""
                              className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute top-[2%] left-[5%] grid grid-cols-2 gap-1">
                            {product?.product?.colours?.list.length > 0 &&
                              product?.product?.colours?.list?.map(
                                (colorObj, index) => (
                                  <p key={index}>
                                    {colorObj.colours.map((color, subIndex) => {
                                      return (
                                        <div
                                          key={`${index}-${subIndex}`}
                                          style={{
                                            backgroundColor:
                                              colorObj.swatch?.[subIndex] ||
                                              color.toLowerCase(),
                                          }} // Convert to lowercase
                                          className={`w-fit px-2 rounded-sm text-xs py-1.5 border-[1px] border-slate-900`}
                                        />
                                      );
                                    })}
                                  </p>
                                )
                              )}
                          </div>
                          <div className="flex flex-col h-full p-3">
                            <div className="flex flex-col justify-center flex-grow text-center ">
                              <h2 className="text-lg font-medium text-brand">
                                {product.overview.name &&
                                product.overview.name.length > 25
                                  ? product.overview.name.slice(0, 25) + "..."
                                  : product.overview.name || "No Name"}
                              </h2>

                              {/* <p className='font-normal text-brand'>
                              {' '}
                              Code: {product.overview.code}
                            </p> */}
                              <h2 className="pt-2 text-xl font-semibold text-heading">
                                {/* $<span>{realPrice}</span> */}$
                                {minPrice === maxPrice ? (
                                  <span>{minPrice}</span>
                                ) : (
                                  <span>
                                    {minPrice} - ${maxPrice}
                                  </span>
                                )}
                              </h2>
                            </div>
                            <div className="flex justify-between gap-1 mt-2 mb-1">
                              <p
                                onClick={() => {
                                  dispatch(addToFavourite(product));
                                  toast.success("product added to favourites");
                                }}
                                className="p-3 text-2xl rounded-sm bg-icons"
                              >
                                <CiHeart />
                              </p>
                              <div className="flex items-center justify-center w-full gap-1 px-2 py-3 text-white rounded-sm cursor-pointer bg-smallHeader">
                                <p className="text-xl">
                                  <IoCartOutline />
                                </p>
                                <button
                                  onClick={() =>
                                    handleViewProduct(product.meta.id)
                                  }
                                  className="text-sm uppercase"
                                >
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <h2>No Products Available for this category</h2>
              </div>
            )}
          </div>

          {totalApiPages > 1 && (
            <div className="flex items-center justify-center mt-16 space-x-2 pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 border rounded-full"
              >
                <IoMdArrowBack className="text-xl" />
              </button>

              {getPaginationButtons(
                currentPage,
                totalApiPages,
                maxVisiblePages
              ).map((page) => (
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalApiPages))
                }
                disabled={currentPage === totalApiPages}
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

export default Spromotional;
