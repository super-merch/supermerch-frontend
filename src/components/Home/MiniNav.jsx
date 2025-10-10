import React, { useState, useEffect, useRef } from "react";
import { IoSearchSharp, IoCartOutline } from "react-icons/io5";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { BiUser } from "react-icons/bi";
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";
import { googleLogout } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoPricetagSharp } from "react-icons/io5";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import { motion } from "framer-motion";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  setSelectedCategory,
  applyFilters,
} from "../../redux/slices/filterSlice";
import {
  fetchcategoryProduct,
  matchProduct,
} from "@/redux/slices/categorySlice";
import supermerch from "../../assets/supermerch.png";
import { clearFavourites } from "@/redux/slices/favouriteSlice";
import { clearCart, clearCurrentUser } from "@/redux/slices/cartSlice";
import { toast } from "react-toastify";
import { useCoupons } from "@/hooks/useCoupons";

const MiniNav = () => {
  const megaMenu = [
    [
      { title: "PENS", path: "/promotional" },
      { label: "Plastic Pens", path: "/promotional" },
      { label: "Face Masks", path: "/promotional" },
      { label: "Health & Personal", path: "/promotional" },
      { label: "Metal Pens", path: "/promotional" },
      { label: "Stylus Pens", path: "/promotional" },
      { label: "Markers", path: "/promotional" },
      { label: "Highlighters", path: "/promotional" },
      { label: "Coloured Pencils", path: "/promotional" },
      { label: "Grey-Lead Pencils", path: "/promotional" },
      { label: "Pencil Sharpeners", path: "/promotional" },
      { label: "Other Pens", path: "/promotional" },
      { label: "Erasers", path: "/promotional" },
      { label: "Pen Packaging", path: "/promotional" },
      { label: "More", path: "/promotional" },
    ],
    [
      { title: "Woman", path: "/" },
      { label: "Automotive", path: "/" },
      { label: "Bar and Counter Mats", path: "/" },
      { label: "Bottled Water", path: "/" },
      { label: "Calculators", path: "/" },
      { label: "Balloons", path: "/" },
      { label: "Clocks", path: "/" },
      { label: "Coin Banks", path: "/" },
      { label: "Compendiums", path: "/" },
      { label: "Confectionery", path: "/" },
      { label: "Desk Accessories", path: "/" },
      { label: "Drinkware Accessories", path: "/" },
      { label: "Enviro Bags", path: "/" },
    ],
    [
      { title: "Kids", path: "/" },
      { label: "Enviro Products", path: "/" },
      { label: "Fitness Watches", path: "/" },
      { label: "Glassware", path: "/" },
      { label: "Golf Products", path: "/" },
      { label: "Headphones", path: "/" },
      { label: "Health & Fitness", path: "/" },
      { label: "Coin Banks", path: "/" },
      { label: "Lanyards & ID Products", path: "/" },
      { label: "MagicCubes", path: "/" },
      { label: "Magnets", path: "/" },
      { label: "Micro Fibre Cloth", path: "/" },
      { label: "Mouse Mats", path: "/" },
    ],
    [
      { title: "TopWear", path: "/" },
      { label: "Packaging Boxes", path: "/" },
      { label: "Pencils", path: "/" },
      { label: "Pens", path: "/" },
      { label: "Personal Care", path: "/" },
      { label: "Personal Hygiene", path: "/" },
      { label: "Pet Products", path: "/" },
      { label: "Ribbons", path: "/" },
      { label: "Rubik's Cube", path: "/" },
      { label: "Sports Bags", path: "/" },
      { label: "Sports Bags", path: "/" },
      { label: "Stress Shapes", path: "/" },
    ],
    [
      { title: "BottomWear", path: "/" },
      { label: "Stubby Holders", path: "/" },
      { label: "Sunscreen & After Sun", path: "/" },
      { label: "Tablecloths", path: "/" },
      { label: "Socks and Thongs", path: "/" },
      { label: "Tools", path: "/" },
      { label: "Torches & Lighting", path: "/" },
      { label: "Toys & Games", path: "/" },
      { label: "Travel", path: "/" },
      { label: "Watches", path: "/" },
      { label: "USB Drives", path: "/" },
    ],
  ];

  const {
    token,
    setToken,
    products,
    setProducts,
    fetchProducts,
    handleLogout,
    categoryProducts,
    setCategoryProducts,
    fetchCategories,
  } = useContext(AppContext);
  const { coupons, coupenLoading } = useCoupons();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [megaMenuMobile, setMegaMenuMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (index) => {
    setActiveCategory(activeCategory === index ? null : index); // Toggle category
  };

  const dispatch = useDispatch();

  const [navbarLogout, setNavbarLogout] = useState(false);

  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [isOpen, setIsOpen] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [isnav, setIsnav] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate();

  const toggleNavbar = () => setIsnav((prev) => !prev);

  const handleChange = (e) => setInputValue(e.target.value.toLowerCase());

  // const applyFilter = () => {
  //   if (inputValue) {
  //     setProducts(
  //       products.filter((product) =>
  //         product.overview.name.toLowerCase().includes(inputValue.toLowerCase())
  //       )
  //     );
  //   } else {
  //     fetchProducts();
  //   }
  // };

  const toggleLogout = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  // useEffect(() => {
  //   applyFilter();
  // }, [inputValue]);

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    setIsDropdownOpen(false);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const route = [
    { name: "Promotional", path: "/Spromotional" },
    { name: "Clothing", path: "/Clothing" },
    { name: "Headwear", path: "/Headwear" },
    { name: "Return Gifts", path: "/ReturnGifts" },
    { name: "24 Hour production", path: "/production" },
    { name: "Sale", path: "/Sale" },
    { name: "australia Made", path: "/Australia" },
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

  const mobileNavDropHeading = [
    {
      title: "Men's and Unisex Apparel",
      children: [
        { title: "Men's and Unisex T-Shirts" },
        { title: "Men's and Unisex Polos" },
        { title: "Men's and Unisex Dress-Shirts" },
        { title: "Men's and Unisex Sweat-Shirts" },
        { title: "Men's and Unisex Quarter-Zip" },
        { title: "Men's and Unisex Jackets" },
        { title: "Other Apparel" },
      ],
    },
    {
      title: "Headwear",
      children: [
        { title: "Hats and Caps" },
        { title: "Beanies" },
        { title: "Other Headwear" },
      ],
    },
    {
      title: "Awards and Recognition",
      children: [
        { title: "Office Essentials" },
        { title: "Journals and Notebooks" },
        { title: "Desk Accessories" },
        { title: "Calendars" },
        { title: "Notepads and Flags" },
        { title: "Padfolios" },
      ],
    },
    {
      title: "Awards and Recognition",
      children: [
        { title: "Office Essentials" },
        { title: "Journals and Notebooks" },
        { title: "Desk Accessories" },
        { title: "Calendars" },
        { title: "Notepads and Flags" },
        { title: "Padfolios" },
      ],
    },
    {
      title: "Pens and Writing Instruments",
      children: [
        { title: "Pens" },
        { title: "Pencils" },
        { title: "Markers & Highlighters" },
        { title: "Writing Sets" },
      ],
    },
  ];

  const handleCategoryClick = (category) => {
    dispatch(setSelectedCategory(category));
    // dispatch(applyFilters());

    // Ensure filters are applied AFTER the state is updated
    setTimeout(() => {
      dispatch(applyFilters());
    }, 0);

    // navigate('/category')
  };

  const [isPromotionClickeed, setIsPromotionClickeed] = useState(false);

  // console.table([...new Set(products.map(p => p.product.categorisation.supplier_category))]);
  let checkcatPro = useSelector(
    (state) => state.categoryProduct.categoryProduct
  );

  // const filteredProducts = useSelector(
  //   (state) => state.categoryProduct.filteredProducts
  // );

  const productCategory = () => {
    dispatch(matchProduct({ categoryProducts, checkcatPro }));
    setProducts(filteredProducts);
    setIsPromotionClickeed(true);
  };

  useEffect(() => {
    dispatch(fetchcategoryProduct());
  }, []);

  const handleSubCategories = (subCategory) => {
    dispatch(matchProduct({ categoryProducts, checkcatPro }));
    setIsPromotionClickeed(true);

    // const subFilterProducts = filteredProducts.filter((product) =>
    //   product.product?.categorisation?.promodata_product_type?.type_name_text.includes(subCategory))

    const subFilterProducts = products.filter((product) => {
      const typeName =
        product.product?.categorisation?.promodata_product_type?.type_name_text;
      return typeName?.toLowerCase().includes(subCategory.toLowerCase());
    });
    setProducts(subFilterProducts);
  };

  const handleSearch = () => {
    navigate(`/search?search=${inputValue}`);
  };
  const [coupenModel, setCoupenModel] = useState(false);
  const [coupen, setCoupen] = useState("");
  const [discount, setDiscount] = useState("");

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const fetchCurrentCoupon = async () => {
    try {
      setCoupenLoading(true);
      const response = await fetch(`${API_BASE}/api/coupen/get`);
      const data = await response.json();
      if (response.ok) {
        setCoupen(data[0].coupen);
        setDiscount(data[0].discount);
        setCoupenLoading(false);
      }
      setCoupenLoading(false);
    } catch (error) {
      setCoupenLoading(false);
      console.error("Error fetching current coupon:", error);
    }
  };

  return (
    <>
      <div className="bg-line">
        {coupenModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🎁 Get Your Coupon!
              </h2>
              <p className="text-lg font-bold text-blue-600">
                {coupenLoading
                  ? "Loading..."
                  : coupen
                  ? coupen
                  : "No Coupen available"}
              </p>
              <p className="text-sm text-gray-600">
                Add this coupon at checkout to enjoy{" "}
                <strong>
                  {coupenLoading
                    ? "Loading..."
                    : discount
                    ? discount + "%"
                    : "No Discount"}
                </strong>
                .
                {coupen && (
                  <p
                    className="text-blue-600 block cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(coupen);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    Copy Coupen
                  </p>
                )}
              </p>
              <button
                onClick={() => setCoupenModel(false)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              >
                Got It
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-6 pt-2 text-white Mycontainer">
          <Link to={"/"} className="relative z-10">
            <img
              src={supermerch}
              className="object-contain w-24  lg:w-36"
              alt=""
            />
          </Link>

          <div className="lg:flex md:flex hidden gap-2 border border-black   items-center bg-white lg:w-[55%] md:w-[55%] w-full h-[48px] px-4">
            <input
              value={inputValue}
              onChange={handleChange}
              type="text"
              placeholder="Search for anything..."
              className="w-full text-black bg-transparent outline-none"
            />
            <IoSearchSharp
              onClick={handleSearch}
              className="text-xl cursor-pointer text-black"
            />
          </div>
          <div className="relative z-20 flex items-center gap-4 lg:gap-6 md:gap-6 sm:gap-4">
            <Link to={"/cart"} className="relative">
              {totalQuantity > 0 && (
                <span
                  className={`absolute -top-1.5 right-[75%] bg-white border border-red-500 text-red-500 ${
                    totalQuantity > 999 ? "text-[10px]" : "text-[11px]"
                  } rounded-full w-6 h-6 flex items-center justify-center`}
                >
                  {totalQuantity > 999 ? "+999" : totalQuantity}
                </span>
              )}
              <HiOutlineShoppingCart className="text-3xl text-customBlue hover:text-blue-600 transition-colors" />
            </Link>
            <HiOutlineHeart className="text-3xl text-customBlue hover:text-red-500 transition-colors cursor-pointer" />
            {!token ? (
              <Link to={"/signup"}>
                <HiOutlineUser className="text-3xl text-customBlue hover:text-blue-600 transition-colors" />
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <HiOutlineUser
                  onClick={toggleLogout}
                  className="text-3xl cursor-pointer text-customBlue hover:text-blue-600 transition-colors"
                />
                {isDropdownOpen && (
                  <div className="absolute right-0 w-48 mt-2 bg-white border rounded shadow-lg">
                    <ul>
                      <Link
                        onClick={() => setIsDropdownOpen(false)}
                        to="/admin"
                      >
                        <p className="px-4 py-2 text-black cursor-pointer hover:bg-gray-100">
                          Manage Orders
                        </p>
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

      <div className="relative bg-line">
        <div className="absolute flex items-center gap-1 Mycontainer lg:relative md:relative -top-10 lg:-top-0 md:-top-0 sm:left-7 left-4 lg:left-0 lg:justify-center">
          <div className="relative z-10 hidden lg:block">
            {isOpen && (
              <div
                className={`absolute mt-2 bg-white border border-gray-300 rounded-md shadow-lg w-48 
                  transform transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }`}
              >
                <ul className="py-1">
                  {route.map((link, index) => (
                    <li key={index} onClick={() => setIsOpen(false)}>
                      <Link
                        to={link.path}
                        className="block px-4 py-2 text-gray-700 capitalize hover:bg-blue-500 hover:text-white"
                      >
                        <p className="capitalize ">{link.name}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <nav className="py-3 z-20 text-white lg:px-4">
            <div className="flex   items-center justify-between">
              <button
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
                    d={
                      isnav ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>

            <div
              className={`${
                isnav
                  ? "block z-10 mt-3 lg:hidden absolute bg-white shadow-lg px-8 md:px-12 py-4 right-0 w-[100%] transition-all duration-300 ease-in-out"
                  : "hidden lg:block"
              }`}
            >
              <ul className="space-y-3 lg:space-y-0 lg:flex lg:space-x-6">
                {route.map((link, index) => (
                  <li
                    className={`${
                      link.name === "Promotional" ? "group relative" : ""
                    }`}
                    key={index}
                  >
                    <Link
                      to={link.path}
                      className="text-customBlue"
                      // onClick={() => setIsnav(false)}
                      // onClick={() => handleCategoryClick(link.name)}
                    >
                      <p
                        className="capitalize flex"
                        onClick={() => {
                          if (link.name === "Promotional") {
                            setMegaMenuMobile(!megaMenuMobile);
                            productCategory();
                          }
                        }}
                      >
                        {link.name}
                        {link.name === "Promotional" && (
                          <RiArrowDropDownLine className="-rotate-90 group-hover:rotate-[52px] text-xl transition-all duration-300" />
                        )}
                      </p>

                      {link.name === "Promotional" && megaMenuMobile && (
                        <div className="absolute md:hidden left-0 mt-2 bg-white shadow-lg p-3 w-64">
                          {mobileNavDropHeading.map((category, index) => (
                            <div key={index} className="mb-2">
                              <h6
                                className="text-base flex justify-between items-center text-[#007bff] font-semibold cursor-pointer"
                                onClick={() => toggleCategory(index)}
                              >
                                {category.title}
                                <RiArrowDropDownLine
                                  className={`text-xl transition-all duration-300 ${
                                    activeCategory === index
                                      ? "rotate-0"
                                      : "-rotate-90"
                                  }`}
                                />
                              </h6>

                              {activeCategory === index && (
                                <ul className="mt-2 pl-4 space-y-1">
                                  {category.children.map((child, i) => (
                                    <li key={i}>
                                      <Link
                                        to={child.path}
                                        className=" font-semibold text-[15px] block"
                                      >
                                        {child.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Link>
                    {link.name === "Promotional" && (
                      <div className="absolute max-lg:top-8 -left-[100px] lg:-left-[80px] z-50 flex shadow-lg bg-[#333333] max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[700px] px-8 group-hover:pb-8 group-hover:pt-6 transition-all duration-500 gap-5 max-sm2:hidden">
                        {megaMenu.map((category, categoryIndex) => (
                          <div
                            key={categoryIndex}
                            className="lg:min-w-[180px] max-lg:min-w-[140px]"
                          >
                            <ul>
                              {category.map((item, index) => (
                                <li
                                  key={index}
                                  className="max-lg:border-b py-1 hover:underline rounded"
                                >
                                  <p className="text-lg font-semibold text-blue-500 cursor-pointer">
                                    {item?.title}
                                  </p>
                                  <Link
                                    onClick={() =>
                                      handleSubCategories(item.label)
                                    }
                                    to={item.path}
                                    className="font-semibold text-[13px] block"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
      <div className="Mycontainer">
        <div className="  mt-2  lg:hidden md:hidden flex gap-2 border border-black  items-center bg-white w-full h-[48px] px-4">
          <input
            value={inputValue}
            onChange={handleChange}
            type="text"
            placeholder="Search for anything..."
            className="w-full text-black bg-transparent outline-none"
          />
          <IoSearchSharp
            onClick={handleSearch}
            className="text-xl cursor-pointer text-black"
          />
        </div>
      </div>

      <div className="py-3 mt-1 bg-shipping lg:mt-0 md:mt-0">
        <div className="flex flex-wrap items-center justify-center gap-2 Mycontainer lg:gap-8 md:gap-8">
          <h1 className="text-sm font-medium lg:text-lg md:text-lg text-smallHeader">
            {discount ? discount : "0"}% OFF + FREE Shipping on $150
          </h1>
          <div
            onClick={() => {
              setCoupenModel(true);
              fetchCurrentCoupon();
            }}
            className="flex items-center gap-2 px-4 py-1 border-2 border-smallHeader"
          >
            <IoPricetagSharp className="text-sm font-bold lg:text-lg md:text-lg text-smallHeader" />
            <button className="text-sm font-bold uppercase lg:text-lg md:text-lg text-smallHeader">
              Get Code
            </button>
          </div>
        </div>
      </div>
      {navbarLogout && (
        <motion.div className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-2">
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
            <div className="flex gap-2 justify-end">
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
                className="px-3 py-1 bg-red-600 text-white hover:bg-red-500 rounded transition-all"
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

export default MiniNav;
