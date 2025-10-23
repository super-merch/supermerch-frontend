import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { clearCurrentUser } from "@/redux/slices/cartSlice";
import { clearFavourites } from "@/redux/slices/favouriteSlice";
import { googleLogout } from "@react-oauth/google";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineUser,
} from "react-icons/hi";
import { IoSearchSharp } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supermerch from "../../assets/supermerch.png";
import { AppContext } from "../../context/AppContext";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";

const SMiniNav = () => {
  // Dynamic categories from v1categories
  const {
    token,
    setToken,
    products,
    categoryProducts,
    setActiveFilterCategory,
    setSelectedParamCategoryId,
    setCurrentPage,
    setParamProducts,
    v1categories,
    fetchV1Categories,
    setSidebarActiveCategory,
    setSidebarActiveLabel,
    userEmail,
  } = useContext(AppContext);

  // const getNav = async () => {
  //   await fetchV1Categories();
  // };

  // useEffect(() => {
  //   getNav();
  // }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Create megaMenu from v1categories data
  const megaMenu =
    v1categories
      ?.filter(
        (category) =>
          category.name !== "Clothing" &&
          category.name !== "Headwear" &&
          category.name !== "Capital Equipment"
      )
      .map((category) => ({
        id: category.id,
        name: category.name,
        subTypes: category.subTypes || [],
      })) || [];

  // Separate clothing category for special handling
  const clothingCategory = v1categories?.find((cat) => cat.name === "Clothing");
  const megaMenuClothing = clothingCategory
    ? [
        {
          id: clothingCategory.id,
          name: clothingCategory.name,
          subTypes: clothingCategory.subTypes || [],
        },
      ]
    : [];
  const headwearCategory = v1categories?.find((cat) => cat.name === "Headwear");

  // Other component state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [megaMenuMobile, setMegaMenuMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (index) => {
    setActiveCategory(activeCategory === index ? null : index);
  };

  const dispatch = useDispatch();
  const [navbarLogout, setNavbarLogout] = useState(false);

  let totalQuantity = useSelector((state) => state.cart.items.length);
  const myItems = useSelector((state) => state.cart.items);
  if (!userEmail) {
    const guest = myItems.filter(
      (item) => item.userEmail === "guest@gmail.com"
    );
    totalQuantity = guest.length;
  }
  const { favouriteQuantity } = useSelector((state) => state.favouriteProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [isnav, setIsnav] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const toggleNavbar = () => setIsnav((prev) => !prev);
  const handleChange = (e) => setInputValue(e.target.value.toLowerCase());

  const toggleLogout = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    setIsDropdownOpen(false);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Simplified route structure
  const route = [
    { name: "Promotional", path: "/Spromotional" },
    { name: "Clothing", path: "/Clothing" },
    { name: "Headwear", path: "/Headwear" },
    { name: "Return Gifts", path: "/ReturnGifts" },
    { name: "24 Hour production", path: "/production" },
    { name: "Sale", path: "/sales" },
    { name: "Australia Made", path: "/Australia" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsnav(false);
        setDropDown(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    googleLogout();
    dispatch(clearCurrentUser());
    dispatch(clearFavourites());
    navigate("/signup");
  };

  useEffect(() => {
    if (navbarLogout) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navbarLogout]);

  const productCategory = () => {
    navigate(`/Spromotional`);
    const matchedProducts = products.filter((product) => {
      const typeId =
        product.product?.categorisation?.promodata_product_type?.type_id;
      if (!typeId) return false;
      return categoryProducts.some((category) =>
        category.subTypes.some((sub) => sub.id === typeId)
      );
    });
    setParamProducts({ data: matchedProducts, total_pages: 1 });
    setSelectedParamCategoryId(null);
    setActiveFilterCategory(null);
    setSidebarActiveCategory(null);
  };

  const [hoverMegaMenu, sethoverMegaMenu] = useState(false);
  const [hoverClothingMenu, sethoverClothingMenu] = useState(false);
  const [hoverHeadwearMenu, setHoverHeadwearMenu] = useState(false);

  const handleNameCategories = (titleName, NameId) => {
    sethoverMegaMenu(false);
    sethoverClothingMenu(false);
    const encodedTitleName = encodeURIComponent(titleName);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
    navigate(
      `/Spromotional?categoryName=${encodedTitleName}&category=${NameId}`
    );
    setSelectedParamCategoryId(NameId);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
    setActiveFilterCategory(null);
  };

  const handleSubCategories = (subCategory, categoryId, titleName) => {
    sethoverMegaMenu(false);
    sethoverClothingMenu(false);
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
    navigate(
      `/Spromotional?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}`
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  const conditionalCategoryNameHandler = (link) => {
    if (link.name === "Promotional") {
      sethoverMegaMenu(false);
      const clothingCategory = v1categories.find(
        (category) => category.name === "Bags"
      );
      if (clothingCategory) {
        handleNameCategories(clothingCategory.name, clothingCategory.id);
      }
    }
    if (link.name === "Clothing") {
      sethoverClothingMenu(false);
      const clothingCategory = v1categories.find(
        (category) => category.name === "Clothing"
      );
      if (clothingCategory) {
        handleNameCategories(clothingCategory.name, clothingCategory.id);
      }
    }
    if (link.name === "Headwear") {
      // Add this block
      setHoverHeadwearMenu(false);
      const headwearCategory = v1categories.find(
        (category) => category.name === "Headwear"
      );
      if (headwearCategory) {
        handleNameCategories(headwearCategory.name, headwearCategory.id);
      }
    }
    if (link.name === "Return Gifts") {
      navigate("/shop");
    } else if (link.name === "Sale") {
      navigate("/sales");
    } else if (link.name === "Australia Made") {
      navigate("/australia-made");
    } else if (link.name === "24 Hour production") {
      navigate("/hour-production");
    }
  };
  const [activeItem, setActiveItem] = useState(megaMenu[0]?.id);
  const [activeClothingItem, setActiveClothingItem] = useState(
    megaMenuClothing[0]?.id
  );
  const [openPromoId, setOpenPromoId] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categoryDropdownRef = useRef(null);

  // Hardcoded category data for sample
  const categoryData = [
    {
      id: "promotional",
      name: "Promotional",
      subcategories: [
        {
          id: "apparel",
          name: "Apparel",
          subcategories: ["T-Shirts", "Polo Shirts", "Hoodies"],
        },
        {
          id: "drinkware",
          name: "Drinkware",
          subcategories: ["Mugs", "Water Bottles", "Tumblers"],
        },
        {
          id: "bags",
          name: "Bags",
          subcategories: ["Tote Bags", "Backpacks", "Laptop Bags"],
        },
        {
          id: "accessories",
          name: "Accessories",
          subcategories: ["Keychains", "Lanyards", "Badges"],
        },
      ],
    },
    {
      id: "clothing",
      name: "Clothing",
      subcategories: [
        {
          id: "mens",
          name: "Men's",
          subcategories: ["Shirts", "Pants", "Jackets"],
        },
        {
          id: "womens",
          name: "Women's",
          subcategories: ["Blouses", "Dresses", "Skirts"],
        },
        {
          id: "unisex",
          name: "Unisex",
          subcategories: ["T-Shirts", "Hoodies", "Caps"],
        },
      ],
    },
    {
      id: "headwear",
      name: "Headwear",
      subcategories: [
        {
          id: "caps",
          name: "Caps",
          subcategories: ["Baseball Caps", "Snapbacks", "Beanies"],
        },
        {
          id: "hats",
          name: "Hats",
          subcategories: ["Fedoras", "Bucket Hats", "Visors"],
        },
      ],
    },
    {
      id: "office",
      name: "Office Supplies",
      subcategories: [
        {
          id: "writing",
          name: "Writing",
          subcategories: ["Pens", "Pencils", "Markers"],
        },
        {
          id: "stationery",
          name: "Stationery",
          subcategories: ["Notebooks", "Staplers", "Clips"],
        },
      ],
    },
  ];

  const handleSearch = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    navigate(`/search?search=${inputValue}`);
    setInputValue(inputValue.trim());
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  };

  const [coupenModel, setCoupenModel] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [coupenLoading, setCoupenLoading] = useState(false);

  const fetchCurrentCoupon = async () => {
    try {
      setCoupenLoading(true);
      const response = await fetch(`${API_BASE}/api/coupen/get`);
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setCoupons(data);
        setCoupenLoading(false);
      } else {
        setCoupons([]);
        setCoupenLoading(false);
      }
    } catch (error) {
      setCoupenLoading(false);
      setCoupons([]);
      console.error("Error fetching current coupon:", error);
    }
  };

  return (
    <>
      <div className="bg-line">
        {coupenModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center space-y-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-800">
                🎁 Exclusive Offers!
              </h2>

              {coupenLoading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : coupons.length > 0 ? (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3"
                    >
                      <p className="text-lg font-bold text-primary">
                        {coupon.coupen}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Get <strong>{coupon.discount}% OFF</strong> on your
                        order
                      </p>
                      <p
                        className="text-primary text-sm cursor-pointer hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.coupen);
                          toast.success(`${coupon.coupen} copied!`);
                        }}
                      >
                        📋 Copy Coupon
                      </p>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-3">
                    Use any code at checkout • Valid on all products
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-lg text-gray-600">No Coupons Available</p>
                  <p className="text-sm text-gray-500">
                    Check back soon for deals!
                  </p>
                </div>
              )}

              <button
                onClick={() => setCoupenModel(false)}
                className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition duration-200"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 text-white Mycontainer">
          {/* Mobile hamburger menu - positioned on left */}
          <div className="lg:hidden flex items-center gap-3 flex-shrink-0">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <div className="flex items-center justify-between">
                <SheetTrigger>
                  <div
                    onClick={toggleNavbar}
                    className="text-black focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                </SheetTrigger>
              </div>
              {/* Mobile sheet content */}
              <SheetContent className="overflow-y-auto" side={"left"}>
                <SheetHeader>
                  <SheetTitle className="mb-3 text-2xl text-smallHeader">
                    SuperMerch
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {route.map((link, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        if (link.name == "Sale") {
                          navigate("/sales");
                          setIsSheetOpen(false);
                        } else if (link.name == "24 Hour production") {
                          navigate("/hour-production");
                          setIsSheetOpen(false);
                        } else if (link.name == "Return Gifts") {
                          navigate("/shop");
                          setIsSheetOpen(false);
                        } else if (link.name == "Australia Made") {
                          navigate("/australia-made");
                          setIsSheetOpen(false);
                        }
                      }}
                      className="list-none cursor-pointer"
                    >
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center capitalize cursor-pointer">
                          {link.name}
                          {(link.name === "Promotional" ||
                            link.name === "Clothing" ||
                            link.name === "Headwear") && (
                            <RiArrowDropDownLine className="text-xl transition-all duration-300" />
                          )}
                        </CollapsibleTrigger>
                        {link.name === "Promotional" && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {megaMenu?.map((item) => (
                              <Collapsible
                                key={item.id}
                                open={openPromoId === item.id}
                                onOpenChange={(isOpen) =>
                                  setOpenPromoId(isOpen ? item.id : null)
                                }
                              >
                                <div>
                                  <CollapsibleTrigger className="flex items-center justify-between gap-2 text-sm font-medium text-black transition-colors text-start">
                                    {item.name}
                                    <ChevronRight
                                      className={`h-3 w-3 ${
                                        openPromoId === item.id && "rotate-90"
                                      }`}
                                    />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="ml-6 space-y-2">
                                      {item.subTypes?.map(
                                        (subType, subIndex) => (
                                          <button
                                            key={subIndex}
                                            onClick={() => {
                                              handleSubCategories(
                                                subType.name,
                                                subType.id,
                                                item.name
                                              );
                                              setIsSheetOpen(false);
                                            }}
                                            className="font-semibold hover:underline text-[13px] block text-start text-black"
                                          >
                                            {subType.name}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ))}
                          </CollapsibleContent>
                        )}
                        {link.name === "Clothing" && clothingCategory && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {clothingCategory.subTypes?.map(
                              (subType, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => {
                                    handleSubCategories(
                                      subType.name,
                                      subType.id,
                                      clothingCategory.name
                                    );
                                    setIsSheetOpen(false);
                                  }}
                                  className="font-semibold hover:underline text-[13px] block text-start text-black"
                                >
                                  {subType.name}
                                </button>
                              )
                            )}
                          </CollapsibleContent>
                        )}
                        {link.name === "Headwear" && headwearCategory && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {headwearCategory.subTypes?.map(
                              (subType, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => {
                                    handleSubCategories(
                                      subType.name,
                                      subType.id,
                                      headwearCategory.name
                                    );
                                    setIsSheetOpen(false);
                                  }}
                                  className="font-semibold hover:underline text-[13px] block text-start text-black"
                                >
                                  {subType.name}
                                </button>
                              )
                            )}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </li>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Link to={"/"} className="relative z-10 flex-shrink-0">
              <img
                src={supermerch}
                className="object-contain w-24 lg:w-36 pl-2 lg:pl-8"
                alt=""
              />
            </Link>
          </div>

          {/* Logo */}
          <Link to={"/"} className="relative hidden lg:flex z-10 flex-shrink-0">
            <img
              src={supermerch}
              className="object-contain w-24 lg:w-30 xl:w-36 pl-2"
              alt=""
            />
          </Link>

          {/* Navigation - Desktop Only */}
          <div className="hidden lg:flex flex-1 justify-center max-w-4xl mx-auto">
            <nav className="py-3 z-20 text-white">
              <ul className="flex space-x-3 xl:space-x-5  ">
                {route.map((link, index) => (
                  <li
                    key={index}
                    onMouseLeave={() => {
                      sethoverMegaMenu(false);
                      sethoverClothingMenu(false);
                      setHoverHeadwearMenu(false);
                    }}
                    className={`cursor-pointer whitespace-nowrap ${
                      link.name === "Promotional" ||
                      link.name === "Clothing" ||
                      link.name === "Headwear"
                        ? "group relative"
                        : ""
                    }`}
                  >
                    <div className="text-customBlue">
                      <span
                        className="flex items-center capitalize text-sm xl:text-base"
                        onMouseEnter={() => {
                          if (link.name === "Promotional") {
                            sethoverMegaMenu(true);
                          } else if (link.name === "Clothing") {
                            sethoverClothingMenu(true);
                          } else if (link.name === "Headwear") {
                            setHoverHeadwearMenu(true);
                          }
                        }}
                        onClick={() => {
                          // if (link.name === "Promotional") return;
                          conditionalCategoryNameHandler(link);
                        }}
                      >
                        {link.name}
                        {(link.name === "Promotional" ||
                          link.name === "Clothing" ||
                          link.name === "Headwear") && (
                          <RiArrowDropDownLine className="-rotate-90 group-hover:rotate-[52px] text-xl transition-all duration-300 ml-1" />
                        )}
                      </span>

                      {/* Dropdown menus */}
                      {link.name === "Promotional" && (
                        <div
                          className={`absolute -left-[120px] lg:-left-[150px] top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverMegaMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[900px] shadow-lg">
                              <div className="grid grid-cols-[1fr_3fr]">
                                <div className="border-r backdrop-blur-sm">
                                  <nav className="flex flex-col py-2">
                                    {megaMenu?.map((item) => (
                                      <button
                                        key={item.id}
                                        className={cn(
                                          "flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted",
                                          activeItem === item.id
                                            ? "bg-muted font-medium text-primary"
                                            : "text-white"
                                        )}
                                        onMouseEnter={() =>
                                          setActiveItem(item.id)
                                        }
                                        onClick={() =>
                                          handleNameCategories(
                                            item.name,
                                            item.id
                                          )
                                        }
                                      >
                                        {item.name}
                                        <ChevronRight className="w-4 h-4" />
                                      </button>
                                    ))}
                                  </nav>
                                </div>
                                <div className="w-full p-5">
                                  <div className="grid grid-cols-3 gap-4">
                                    {megaMenu
                                      .find((item) => item.id === activeItem)
                                      ?.subTypes?.map((subType, index) => (
                                        <button
                                          key={index}
                                          onClick={() =>
                                            handleSubCategories(
                                              subType.name,
                                              subType.id,
                                              megaMenu.find(
                                                (item) => item.id === activeItem
                                              )?.name
                                            )
                                          }
                                          className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                        >
                                          {subType.name}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {link.name === "Clothing" && clothingCategory && (
                        <div
                          className={`absolute -left-[120px] lg:-left-[150px] top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverClothingMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[600px] shadow-lg">
                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-blue-500 mb-4">
                                  {clothingCategory.name}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                  {clothingCategory.subTypes?.map(
                                    (subType, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleSubCategories(
                                            subType.name,
                                            subType.id,
                                            clothingCategory.name
                                          )
                                        }
                                        className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                      >
                                        {subType.name}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {link.name === "Headwear" && headwearCategory && (
                        <div
                          className={`absolute -left-[120px] lg:-left-[150px] top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverHeadwearMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[600px] shadow-lg">
                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-blue-500 mb-4">
                                  {headwearCategory.name}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                  {headwearCategory.subTypes?.map(
                                    (subType, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          handleSubCategories(
                                            subType.name,
                                            subType.id,
                                            headwearCategory.name
                                          );
                                          setHoverHeadwearMenu(false);
                                        }}
                                        className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                      >
                                        {subType.name}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Search Modal */}
          {showSearchModal && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-60">
              <motion.div
                ref={searchRef}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-lg sm:max-w-2xl mt-20 mx-4 bg-white rounded-xl shadow-lg flex items-center md:px-4 md:py-3 px-2 py-2"
              >
                <input
                  value={inputValue}
                  onChange={handleChange}
                  type="text"
                  placeholder="Search for products..."
                  autoFocus
                  className="flex-1 text-black bg-transparent outline-none text-base md:text-lg placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                      setShowSearchModal(false);
                    }
                  }}
                />
                <IoSearchSharp
                  onClick={() => {
                    handleSearch();
                    setShowSearchModal(false);
                  }}
                  className="text-2xl cursor-pointer text-primary ml-3 hover:scale-110 transition-transform"
                />
              </motion.div>
            </div>
          )}

          {/* Right side icons */}
          <div className="relative z-20 flex items-center gap-3  xl:gap-6 flex-shrink-0">
            <div>
              <IoSearchSharp
                onClick={() => setShowSearchModal(true)}
                className="text-xl xl:text-2xl cursor-pointer text-black"
              />
            </div>
            <Link to={"/cart"} className="relative">
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white border border-red-500 text-red-500 text-[11px] lg:text-[13px] rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
              <IoCartOutline className="text-2xl xl:text-3xl text-customBlue" />
            </Link>
            <Link to={"/favourites"} className="relative">
              {favouriteQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white border border-red-500 text-red-500 text-[11px] lg:text-[13px] rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {favouriteQuantity}
                </span>
              )}
              <CiHeart className="text-2xl xl:text-3xl text-customBlue" />
            </Link>
            {!token ? (
              <Link to={"/signup"}>
                <BiUser className="text-2xl lg:text-3xl text-customBlue" />
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <HiOutlineUser
                  onClick={toggleLogout}
                  className="text-2xl xl:text-3xl cursor-pointer text-customBlue"
                />
                {isDropdownOpen && (
                  <div className="absolute right-0 w-48 mt-2 bg-white border rounded shadow-lg">
                    <ul>
                      <Link
                        onClick={() => setIsDropdownOpen(false)}
                        to="/admin"
                        className="px-4 py-2 block text-black cursor-pointer hover:bg-gray-100"
                      >
                        Manage Orders
                      </Link>
                      <li
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setNavbarLogout(true);
                        }}
                        className="px-4 py-2 text-black cursor-pointer hover:bg-gray-100"
                      >
                        Log Out
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="relative bg-line">
        <div className="absolute flex items-center gap-1 Mycontainer lg:relative md:relative -top-10 lg:-top-0 md:-top-0 sm:left-7 left-4 lg:left-0 lg:justify-center">
          <nav className="py-3 z-20 text-white lg:px-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <div className="flex items-center justify-between">
                <SheetTrigger>
                  <div
                    onClick={toggleNavbar}
                    className="text-black focus:outline-none lg:hidden"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                </SheetTrigger>
              </div>
              <SheetContent className="overflow-y-auto" side={"left"}>
                <SheetHeader>
                  <SheetTitle className="mb-3 text-2xl text-smallHeader">
                    SuperMerch
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {route.map((link, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        if (link.name == "Sale") {
                          navigate("/sales");
                          setIsSheetOpen(false);
                        } else if (link.name == "24 Hour production") {
                          navigate("/hour-production");
                          setIsSheetOpen(false);
                        } else if (link.name == "Return Gifts") {
                          navigate("/shop");
                          setIsSheetOpen(false);
                        } else if (link.name == "Australia Made") {
                          navigate("/australia-made");
                          setIsSheetOpen(false);
                        }
                      }}
                      className="list-none cursor-pointer"
                    >
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center capitalize cursor-pointer">
                          {link.name}
                          {(link.name === "Promotional" ||
                            link.name === "Clothing" ||
                            link.name === "Headwear") && ( // Add "Headwear" here
                            <RiArrowDropDownLine className="text-xl transition-all duration-300" />
                          )}
                        </CollapsibleTrigger>
                        {link.name === "Promotional" && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {megaMenu?.map((item) => (
                              <Collapsible
                                key={item.id}
                                open={openPromoId === item.id}
                                onOpenChange={(isOpen) =>
                                  setOpenPromoId(isOpen ? item.id : null)
                                }
                              >
                                <div>
                                  <CollapsibleTrigger className="flex items-center justify-between gap-2 text-sm font-medium text-black transition-colors text-start">
                                    {item.name}
                                    <ChevronRight
                                      className={`h-3 w-3 ${
                                        openPromoId === item.id && "rotate-90"
                                      }`}
                                    />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="ml-6 space-y-2">
                                      {item.subTypes?.map(
                                        (subType, subIndex) => (
                                          <button
                                            key={subIndex}
                                            onClick={() => {
                                              handleSubCategories(
                                                subType.name,
                                                subType.id,
                                                item.name
                                              );
                                              setIsSheetOpen(false);
                                            }}
                                            className="font-semibold hover:underline text-[13px] block text-start text-black"
                                          >
                                            {subType.name}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ))}
                          </CollapsibleContent>
                        )}
                        {link.name === "Clothing" && clothingCategory && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {clothingCategory.subTypes?.map(
                              (subType, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => {
                                    handleSubCategories(
                                      subType.name,
                                      subType.id,
                                      clothingCategory.name
                                    );
                                    setIsSheetOpen(false);
                                  }}
                                  className="font-semibold hover:underline text-[13px] block text-start text-black"
                                >
                                  {subType.name}
                                </button>
                              )
                            )}
                          </CollapsibleContent>
                        )}
                        {link.name === "Headwear" && headwearCategory && (
                          <CollapsibleContent className="ml-4 space-y-2">
                            {headwearCategory.subTypes?.map(
                              (subType, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => {
                                    handleSubCategories(
                                      subType.name,
                                      subType.id,
                                      headwearCategory.name
                                    );
                                    setIsSheetOpen(false);
                                  }}
                                  className="font-semibold hover:underline text-[13px] block text-start text-black"
                                >
                                  {subType.name}
                                </button>
                              )
                            )}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </li>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden lg:block">
              <ul className="space-y-3 lg:space-y-0 lg:flex lg:space-x-6">
                {route.map((link, index) => (
                  <li
                    key={index}
                    onMouseLeave={() => {
                      sethoverMegaMenu(false);
                      sethoverClothingMenu(false);
                      setHoverHeadwearMenu(false); // Add this line
                    }}
                    className={`cursor-pointer ${
                      link.name === "Promotional" ||
                      link.name === "Clothing" ||
                      link.name === "Headwear" // Add this line
                        ? "group relative"
                        : ""
                    }`}
                  >
                    <div className="text-customBlue">
                      <span
                        className="flex capitalize"
                        onMouseEnter={() => {
                          if (link.name === "Promotional") {
                            sethoverMegaMenu(true);
                          } else if (link.name === "Clothing") {
                            sethoverClothingMenu(true);
                          } else if (link.name === "Headwear") {
                            // Add this block
                            setHoverHeadwearMenu(true);
                          }
                        }}
                        onClick={() => {
                          // if (link.name === "Promotional") return;
                          conditionalCategoryNameHandler(link);
                        }}
                      >
                        {link.name}
                        {(link.name === "Promotional" ||
                          link.name === "Clothing" ||
                          link.name === "Headwear") && ( // Update this line
                          <RiArrowDropDownLine className="-rotate-90 group-hover:rotate-[52px] text-xl transition-all duration-300" />
                        )}
                      </span>

                      {link.name === "Promotional" && (
                        <div
                          className={`absolute left-0 top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverMegaMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[500px] max-w-[80vw] max-h-[60vh] shadow-lg">
                              <div className="grid grid-cols-[1fr_3fr] max-h-[60vh] overflow-y-auto">
                                <div className="border-r backdrop-blur-sm">
                                  <nav className="flex flex-col py-2">
                                    {megaMenu?.map((item) => (
                                      <button
                                        key={item.id}
                                        className={cn(
                                          "flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted",
                                          activeItem === item.id
                                            ? "bg-muted font-medium text-primary"
                                            : "text-white"
                                        )}
                                        onMouseEnter={() =>
                                          setActiveItem(item.id)
                                        }
                                        onClick={() =>
                                          handleNameCategories(
                                            item.name,
                                            item.id
                                          )
                                        }
                                      >
                                        {item.name}
                                        <ChevronRight className="w-4 h-4" />
                                      </button>
                                    ))}
                                  </nav>
                                </div>
                                <div className="w-full p-5">
                                  <div className="grid grid-cols-3 gap-4">
                                    {megaMenu
                                      .find((item) => item.id === activeItem)
                                      ?.subTypes?.map((subType, index) => (
                                        <button
                                          key={index}
                                          onClick={() =>
                                            handleSubCategories(
                                              subType.name,
                                              subType.id,
                                              megaMenu.find(
                                                (item) => item.id === activeItem
                                              )?.name
                                            )
                                          }
                                          className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                        >
                                          {subType.name}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {link.name === "Clothing" && clothingCategory && (
                        <div
                          className={`absolute left-0 top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverClothingMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[600px] shadow-lg">
                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-blue-500 mb-4">
                                  {clothingCategory.name}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                  {clothingCategory.subTypes?.map(
                                    (subType, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleSubCategories(
                                            subType.name,
                                            subType.id,
                                            clothingCategory.name
                                          )
                                        }
                                        className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                      >
                                        {subType.name}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {link.name === "Headwear" && headwearCategory && (
                        <div
                          className={`absolute left-0 top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden ${
                            hoverHeadwearMenu ? "group-hover:flex" : "hidden"
                          }`}
                        >
                          <div className="container mx-auto">
                            <div className="overflow-hidden rounded-lg border bg-[#333333] w-[600px] shadow-lg">
                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-blue-500 mb-4">
                                  {headwearCategory.name}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                  {headwearCategory.subTypes?.map(
                                    (subType, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          handleSubCategories(
                                            subType.name,
                                            subType.id,
                                            headwearCategory.name
                                          );
                                          setHoverHeadwearMenu(false);
                                        }}
                                        className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                                      >
                                        {subType.name}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div> */}

      <div className="Mycontainer">
        <div className="mt-2 lg:hidden md:hidden">
          <div className="relative" ref={categoryDropdownRef}>
            <div className="flex items-center bg-white border-2 border-blue-100 rounded-lg px-3 py-2 hover:border-blue-200 transition-colors">
              {/* Dropdown selector */}
              <div
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md mr-3 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
              >
                <span className="text-primary font-semibold text-sm">
                  {selectedCategory}
                </span>
                <svg
                  className={`w-3 h-3 text-primary transition-transform ${
                    isCategoryDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Search input */}
              <input
                value={inputValue}
                onChange={handleChange}
                type="text"
                placeholder="Search for anything..."
                className="flex-1 text-gray-700 bg-transparent outline-none placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              {/* Search icon */}
              <IoSearchSharp
                onClick={handleSearch}
                className="text-primary text-xl cursor-pointer hover:text-blue-700 transition-colors ml-2"
              />
            </div>

            {/* Category Dropdown for Mobile */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {/* All option */}
                  <div
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => {
                      setSelectedCategory("All");
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    <span className="text-gray-700 font-medium">
                      All Categories
                    </span>
                  </div>

                  {/* Category tree */}
                  {categoryData.map((category) => (
                    <div key={category.id} className="border-t border-gray-100">
                      <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <span className="text-gray-800 font-semibold">
                          {category.name}
                        </span>
                      </div>
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="ml-4">
                          <div className="px-3 py-1 hover:bg-gray-50 rounded cursor-pointer">
                            <span className="text-gray-600 text-sm">
                              {subcategory.name}
                            </span>
                          </div>
                          {subcategory.subcategories.map((item, index) => (
                            <div
                              key={index}
                              className="ml-6 px-3 py-1 hover:bg-gray-50 rounded cursor-pointer"
                              onClick={() => {
                                setSelectedCategory(item);
                                setIsCategoryDropdownOpen(false);
                              }}
                            >
                              <span className="text-gray-500 text-xs">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {navbarLogout && (
        <motion.div className="fixed inset-0 top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className="flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white p-5 rounded-md"
          >
            <p className="text-sm font-semibold">
              Are you sure you want to logout?
            </p>
            <p className="text-sm text-gray-500">
              You can login back at any time. All the changes you've been made
              will not be lost.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 text-gray-700 transition duration-300 border rounded hover:bg-gray-100"
                onClick={() => setNavbarLogout(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setNavbarLogout(false);
                }}
                className="px-3 py-1 text-white transition-all bg-red-600 rounded hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default SMiniNav;
