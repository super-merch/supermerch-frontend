import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LucideAlertCircle } from "lucide-react";
import { googleLogout } from "@react-oauth/google";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Import reusable components
import { buildMegaMenu, clothingNavConfig, promotionalNavConfig } from "@/config/navCategoryConfig";
import { ProductsContext } from "../../context/ProductsContext";
import { AuthContext } from "../../context/AuthContext";
import { NavigationMenu, SearchBar, UserActions } from "../Common";
import supermerch from "@/assets/logo.png";
import { useCoupons } from "@/hooks/useCoupons";
import {
  clearCurrentUser,
  currentUserCartAmount,
} from "@/redux/slices/cartSlice";
import { clearFavourites } from "@/redux/slices/favouriteSlice";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";
import { LuX, LuXCircle } from "react-icons/lu";
import LogoutModal from "../Common/LogoutModal";

const RefactoredNavbar = ({ onCouponClick }) => {
  const { token, setToken } = useContext(AuthContext);
  const {
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
    setPaginationData,
  } = useContext(ProductsContext);

  useEffect(() => {
    if (!v1categories?.length) {
      fetchV1Categories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v1categories?.length]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalQuantity = useSelector(currentUserCartAmount);
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
      {
        name: "Promotional",
        path: "/promotional?categoryName=Bags&category=PA&type=Promotional",
        hasSubmenu: true,
      },
      {
        name: "Clothing",
        path: "/promotional?categoryName=Bottoms&category=PB&type=Clothing",
        hasSubmenu: true,
      },
      {
        name: "Headwear",
        path: "/promotional?categoryName=Headwear&category=PK&type=Headwear",
        hasSubmenu: true,
      },
      { name: "Gifts", path: "/return-gifts", hasSubmenu: true },
      { name: "24hr Prod", path: "/24hr-production" },
      { name: "Deals", path: "/sales" },
      { name: "Australia Made", path: "/australia-made" },
    ];

    return baseMenuItems.map((item) => {
      if (item.name === "Promotional") {
        const megaMenu = buildMegaMenu(promotionalNavConfig, v1categories, {
          onCategory: handleNameCategories,
          onSubCategory: handleSubCategories,
        }, "Promotional");

        return {
          ...item,
          id: "promotional",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Clothing") {
        const megaMenu = buildMegaMenu(clothingNavConfig, v1categories, {
          onCategory: handleNameCategories,
          onSubCategory: handleSubCategories,
        }, "Clothing");

        return {
          ...item,
          id: "clothing",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }


      if (item.name === "Headwear") {
        const headwearCategory = v1categories?.find(
          (cat) => cat.name === "Headwear",
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
                  headwearCategory.name,
                  "Headwear",
                ),
            })) || [],
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Gifts") {
        return {
          ...item,
          id: "gifts",
          submenu: [
            {
              id: "gift-hampers",
              name: "Gift Hampers",
              onClick: () => handleMenuClick(item),
            },
          ],
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

  const handleSearch = (searchTerm) => {
    navigate(
      `/search?search=${searchTerm}${selectedCategory.id ? `&categoryId=${selectedCategory.id}` : ""}`,
    );
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleMenuClick = (item) => {
    if (item?.name === "Gifts") {
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  const handleNameCategories = (titleName, NameId, parentType) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedType = encodeURIComponent(parentType || titleName);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
    //also add weather it is promotional, clothing or headwear in url in type
    navigate(
      `/promotional?categoryName=${encodedTitleName}&category=${NameId}&type=${encodedType}`,
    );
    setSelectedParamCategoryId(NameId);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
    setActiveFilterCategory(null);
  };

  const handleSubCategories = (
    subCategory,
    categoryId,
    titleName,
    parentType,
  ) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    const encodedType = encodeURIComponent(parentType || titleName);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());

    // Determine the correct route based on the category name
    let targetRoute = "/promotional"; // Default fallback

    // if (titleName === "Clothing") {
    //   targetRoute = "/Clothing";
    // } else if (titleName === "Headwear") {
    //   targetRoute = "/Headwear";
    // } else if (titleName === "Capital Equipment") {
    //   targetRoute = "/promotional"; // Keep as promotional for now
    // }
    // For all other categories, use /Spromotional

    navigate(
      `${targetRoute}?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}&type=${encodedType}`,
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  const logout = () => {
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
      <div
        className="bg-white border-b border-gray-200 shadow-sm sm:py-2 sticky top-0 z-[50] pb-4"
        data-chat-offset="main-nav"
      >
        <div className="flex items-center justify-between gap-3 !px-0 md:px-0 Mycontainer flex-wrap">
          {/* Mobile Menu Button */}
          <Sheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            className="xl:hidden"
          >
            <SheetTrigger className="text-gray-700 focus:outline-none p-1 hover:bg-gray-100 rounded-lg transition-colors xl:hidden">
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
              className="overflow-y-auto w-[85vw] sm:w-[400px] bg-white"
              side="left"
            >
              <SheetHeader>
                <SheetTitle className="mb-6 text-2xl text-primary font-bold">
                  <img
                    src={supermerch}
                    alt="SuperMerch"
                    className="h-20 w-auto object-contain mx-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <NavigationMenu
                menuItems={menuItems}
                onItemClick={(item) => {
                  handleMenuClick(item);
                  setIsSheetOpen(false);
                }}
                onSubItemClick={() => setIsSheetOpen(false)}
                variant="vertical"
                size="default"
              />
            </SheetContent>
          </Sheet>

          {/* Navigation Menu - Desktop */}
          <div className="hidden xl:block">
            <NavigationMenu
              menuItems={menuItems}
              onItemClick={handleMenuClick}
              size="default"
              className="justify-start"
            />
          </div>

          {/* Search Bar - Center */}
          <div className="w-full flex-1 mx-2 sm:mx-4 order-3 lg:order-2">
            <SearchBar
              onSearch={handleSearch}
              categoryData={v1categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              size="small"
              className="w-full"
            />
          </div>

          {/* User Actions - Right */}
          <div className="flex items-center gap-3 order-2 lg:order-3">
            <UserActions
              isAuthenticated={!!token}
              onLogout={() => setNavbarLogout(true)}
              cartQuantity={totalQuantity}
              favouriteQuantity={favouriteQuantity}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {navbarLogout && (
        <LogoutModal
          showLogoutPopup={navbarLogout}
          setShowLogoutPopup={setNavbarLogout}
          handleLogout={logout}
        />
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
                    <p className="text-lg font-bold text-primary">
                      {coupon.coupen}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Get <strong>{coupon.discount}% OFF</strong> on your order
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
    </>
  );
};

export default RefactoredNavbar;
