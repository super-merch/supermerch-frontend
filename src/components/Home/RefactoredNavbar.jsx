import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { googleLogout } from "@react-oauth/google";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { toast } from "react-toastify";

// Import reusable components
import { AppContext } from "../../context/AppContext";
import { NavigationMenu, SearchBar, UserActions } from "../Common";

import { useCoupons } from "@/hooks/useCoupons";
import { clearCurrentUser } from "@/redux/slices/cartSlice";
import { clearFavourites } from "@/redux/slices/favouriteSlice";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";

const RefactoredNavbar = ({ onCouponClick }) => {
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
    setSidebarActiveCategory,
    setSidebarActiveLabel,
  } = useContext(AppContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalQuantity = useSelector((state) => state.cart.items.length);
  const { favouriteQuantity } = useSelector((state) => state.favouriteProducts);

  // State management
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [navbarLogout, setNavbarLogout] = useState(false);
  const [coupenModel, setCoupenModel] = useState(false);
  const { coupons, coupenLoading } = useCoupons();

  // Create menu items from categories
  const createMenuItems = () => {
    const baseMenuItems = [
      { name: "Promotional", path: "/Spromotional", hasSubmenu: true },
      { name: "Clothing", path: "/Clothing", hasSubmenu: true },
      { name: "Headwear", path: "/Headwear", hasSubmenu: true },
      { name: "Return Gifts", path: "/shop" },
      { name: "24hr Prod", path: "/production" },
      { name: "Sale", path: "/sales" },
      { name: "Australia Made", path: "/Australia" },
    ];

    return baseMenuItems.map((item) => {
      if (item.name === "Promotional") {
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
              subItems:
                category.subTypes?.map((subType) => ({
                  id: subType.id,
                  name: subType.name,
                  onClick: () =>
                    handleSubCategories(
                      subType.name,
                      subType.id,
                      category.name
                    ),
                })) || [],
            })) || [];

        return {
          ...item,
          id: "promotional",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }

      if (item.name === "Clothing") {
        const clothingCategory = v1categories?.find(
          (cat) => cat.name === "Clothing"
        );
        return {
          ...item,
          id: "clothing",
          submenu:
            clothingCategory?.subTypes?.map((subType) => ({
              id: subType.id,
              name: subType.name,
              onClick: () =>
                handleSubCategories(
                  subType.name,
                  subType.id,
                  clothingCategory.name
                ),
            })) || [],
          onClick: () => handleMenuClick(item),
        };
      }

      if (item.name === "Headwear") {
        const headwearCategory = v1categories?.find(
          (cat) => cat.name === "Headwear"
        );
        return {
          ...item,
          id: "headwear",
          submenu:
            headwearCategory?.subTypes?.map((subType) => ({
              id: subType.id,
              name: subType.name,
              onClick: () =>
                handleSubCategories(
                  subType.name,
                  subType.id,
                  headwearCategory.name
                ),
            })) || [],
          onClick: () => handleMenuClick(item),
        };
      }

      return {
        ...item,
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        onClick: () => handleMenuClick(item),
      };
    });
  };

  // Category data for search dropdown
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
  ];

  // Event handlers
  const handleSearch = (searchTerm) => {
    navigate(`/search?search=${searchTerm}`);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleNameCategories = (titleName, NameId) => {
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
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());

    // Determine the correct route based on the category name
    let targetRoute = "/Spromotional"; // Default fallback

    // if (titleName === "Clothing") {
    //   targetRoute = "/Clothing";
    // } else if (titleName === "Headwear") {
    //   targetRoute = "/Headwear";
    // } else if (titleName === "Capital Equipment") {
    //   targetRoute = "/Spromotional"; // Keep as promotional for now
    // }
    // For all other categories, use /Spromotional

    navigate(
      `${targetRoute}?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}`
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    googleLogout();
    dispatch(clearCurrentUser());
    dispatch(clearFavourites());
    navigate("/login");
  };

  useEffect(() => {
    if (navbarLogout) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navbarLogout]);

  // Close search when clicking outside

  const menuItems = createMenuItems();

  return (
    <>
      {/* Main Navbar */}
      <div className="bg-line shadow-xl py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 text-white !px-0 md:px-0 Mycontainer flex-wrap">
          <Sheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            className="xl:hidden"
          >
            <SheetTrigger className="text-black focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors xl:hidden">
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
            </SheetTrigger>
            <SheetContent
              className="overflow-y-auto w-[85vw] sm:w-[400px]"
              side="left"
            >
              <SheetHeader>
                <SheetTitle className="mb-6 text-2xl text-smallHeader font-bold">
                  SuperMerch
                </SheetTitle>
              </SheetHeader>
              <NavigationMenu
                menuItems={menuItems}
                onItemClick={(item) => {
                  handleMenuClick(item);
                  setIsSheetOpen(false);
                }}
                variant="vertical"
                size="default"
              />
            </SheetContent>
          </Sheet>
          {/* Navigation Menu - Left side */}
          <div className="hidden xl:block">
            <NavigationMenu
              menuItems={menuItems}
              onItemClick={handleMenuClick}
              size="default"
              className="justify-start"
            />
          </div>
          <div className="w-full flex-1 mx-2 sm:mx-4 order-3 lg:order-2">
            <SearchBar
              onSearch={handleSearch}
              categoryData={categoryData}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              size="small"
              className="w-full"
            />
          </div>

          {/* Search Bar and User Actions on the right */}
          <div className="flex items-center gap-4 order-2 lg:order-3">
            {/* User Actions */}
            <UserActions
              isAuthenticated={!!token}
              onLogout={() => setNavbarLogout(true)}
              cartQuantity={totalQuantity}
              favouriteQuantity={favouriteQuantity}
              size="default"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="xl:hidden">
          <div className="flex items-center justify-between px-2 sm:px-4 py-2">
            {/* Mobile Search */}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
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
                  handleLogout();
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
      {/* Coupon Modal */}
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
                    <p className="text-lg font-bold text-blue-600">
                      {coupon.coupen}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Get <strong>{coupon.discount}% OFF</strong> on your order
                    </p>
                    <p
                      className="text-blue-600 text-sm cursor-pointer hover:underline"
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
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RefactoredNavbar;
