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
import axios from "axios";

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
import { LuX } from "react-icons/lu";
import LogoutModal from "../Common/LogoutModal";
import {
  buildBaseMenuItems,
  buildHeadwearEntry,
  CLOTHING_MENU_ORDER,
} from "./navigationConfig";

const resolveNavGroup = (category) => {
  const explicitGroup = String(category?.navGroup || "").trim().toLowerCase();
  if (["promotional", "clothing", "headwear"].includes(explicitGroup)) {
    return explicitGroup;
  }

  return null;
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const inferColumnTitle = (name) => {
  const words = String(name || "")
    .replace(/[^\w\s&-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "Misc";

  const lastWord = words[words.length - 1];
  if (lastWord.length >= 3) return toTitleCase(lastWord);

  return "Misc";
};

const buildCategoryColumns = (subTypes = [], maxColumns = 4) => {
  if (!Array.isArray(subTypes) || subTypes.length === 0) {
    return [];
  }

  const grouped = new Map();

  for (const subType of subTypes) {
    const title = String(subType?.menuColumnTitle || "").trim() || inferColumnTitle(subType?.name);
    if (!grouped.has(title)) grouped.set(title, { items: [], color: "primary", order: 0 });
    const group = grouped.get(title);
    group.items.push(subType);
    if (subType?.menuColumnColor) group.color = subType.menuColumnColor;
    if (Number.isFinite(Number(subType?.menuColumnOrder))) {
      group.order = Number(subType.menuColumnOrder);
    }
  }

  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const byOrder = (a[1].order || 0) - (b[1].order || 0);
    if (byOrder !== 0) return byOrder;
    return b[1].items.length - a[1].items.length;
  });

  const primaryGroups = sortedGroups.slice(0, maxColumns);
  const overflowGroups = sortedGroups.slice(maxColumns);

  if (overflowGroups.length > 0) {
    const overflowItems = overflowGroups.flatMap((entry) => entry[1].items);
    if (overflowItems.length > 0) {
      primaryGroups.push(["Misc", { items: overflowItems, color: "primary", order: 999 }]);
    }
  }

  return primaryGroups.map(([title, group]) => ({
    title: title.toUpperCase(),
    color: group.color || "primary",
    items: group.items.map((item) => item.name),
    sourceItems: group.items,
  }));
};

const buildDynamicMegaMenu = (categories = [], handlers, parentType) =>
  categories.map((category) => {
    const columns = buildCategoryColumns(category.subTypes, Number(category.menuColumnCount || 4));
    // parentType can be a fixed string, or a function of (category) => string, so
    // categories merged from different nav groups (e.g. Headwear nested inside
    // Clothing) still tag their own type for filtering/breadcrumbs.
    const resolvedParentType =
      typeof parentType === "function" ? parentType(category) : parentType;

    return {
      id: category.id,
      name: category.name,
      onClick: () => handlers.onCategory(category.name, category.id, resolvedParentType),
      columns,
      subItems: columns.flatMap((column) =>
        (column.sourceItems || []).map((item) => ({
          id: item.id,
          name: item.name,
          columnTitle: column.title,
          onClick: () =>
            handlers.onSubCategory(
              item.name,
              item.id,
              category.name,
              resolvedParentType,
            ),
        })),
      ),
    };
  });

const sortByExplicitOrder = (categories, order) =>
  [...categories].sort((a, b) => {
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

const EXPRESS_WINDOWS = [
  { id: "sameday", label: "Same day" },
  { id: "nextday", label: "Next day" },
  { id: "3days", label: "3 days" },
];

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
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7029';
        const res = await axios.get(`${apiUrl}/api/public/collections`);
        if (res.data?.success) {
          const sorted = (res.data.data || []).sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          );
          setCollections(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch collections", err);
      }
    };
    fetchCollections();
  }, []);

  const buildExpressPath = (windowId = "sameday") =>
    `/24hr-production?expressWindow=${encodeURIComponent(windowId)}`;

  // Create menu items from categories
  const createMenuItems = () => {
    const allCategories = Array.isArray(v1categories) ? v1categories : [];
    const promotionalCategories = allCategories.filter(
      (cat) => resolveNavGroup(cat) === "promotional",
    );
    const clothingCategories = allCategories.filter(
      (cat) => resolveNavGroup(cat) === "clothing",
    );
    const headwearCategories = allCategories.filter(
      (cat) => resolveNavGroup(cat) === "headwear",
    );

    const promoDefault = promotionalCategories[0];
    const clothingDefault = clothingCategories[0];

    const baseMenuItems = buildBaseMenuItems({
      promotionalDefault: promoDefault,
      clothingDefault,
      collections,
    });

    return baseMenuItems.map((item) => {
      if (item.name === "Promotional") {
        const megaMenu = buildDynamicMegaMenu(
          promotionalCategories,
          {
            onCategory: handleNameCategories,
            onSubCategory: handleSubCategories,
          },
          "Promotional",
        );

        return {
          ...item,
          id: "promotional",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Clothing") {
        // Headwear is nested inside the Clothing dropdown as a single
        // "Headwear" entry, rather than being its own top-level nav item.
        // Hovering it (like any other clothing category) reveals all
        // individual headwear types (Caps, Beanies, Visors, ...) in the
        // content panel; those still tag themselves as type=Headwear.
        const headwearEntry = buildHeadwearEntry(headwearCategories);

        const orderedClothingEntries = sortByExplicitOrder(
          headwearEntry ? [...clothingCategories, headwearEntry] : clothingCategories,
          CLOTHING_MENU_ORDER,
        );

        const megaMenu = buildDynamicMegaMenu(
          orderedClothingEntries,
          {
            onCategory: handleNameCategories,
            onSubCategory: handleSubCategories,
          },
          (category) => (category === headwearEntry ? "Headwear" : "Clothing"),
        );

        return {
          ...item,
          id: "clothing",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Hampers") {
        return {
          ...item,
          id: "hampers",
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
      if (item.name === "Rush Order") {
        return {
          ...item,
          id: "rush-order",
          submenu: EXPRESS_WINDOWS.map((window) => ({
            id: `express-${window.id}`,
            name: window.label,
            onClick: () => navigate(buildExpressPath(window.id)),
          })),
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Collections" && collections.length > 0) {
        return {
          ...item,
          id: "collections",
          submenu: collections.map((col) => ({
            id: `collection-${col.slug}`,
            name: col.name,
            onClick: () => navigate(`/collections/${col.slug}`),
          })),
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
    if (item?.name === "Hampers") {
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
        className="bg-white shadow-sm"
        data-chat-offset="main-nav"
      >
        {/* Row 1: Logo + Search + Icons */}
        <div className="Mycontainer px-4 lg:px-8 py-3">
          {/* Top line: hamburger + logo | search (desktop) | icons */}
          <div className="flex items-center gap-3">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3 xl:flex-1">
              {/* Mobile hamburger */}
              <div className="lg:hidden flex-shrink-0">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger className="text-gray-700 focus:outline-none p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto w-[90vw] sm:w-[450px] bg-white p-0 border-none scrollbar-hide" side="left">
                    <div className="p-6 border-b border-gray-100">
                      <SheetHeader>
                        <SheetTitle className="text-2xl text-primary font-bold">
                          <img src={supermerch} alt="SuperMerch" className="h-16 w-auto object-contain" />
                        </SheetTitle>
                      </SheetHeader>
                    </div>
                    <div className="py-4">
                      <NavigationMenu
                        menuItems={menuItems}
                        onItemClick={(item) => { handleMenuClick(item); setIsSheetOpen(false); }}
                        onSubItemClick={() => setIsSheetOpen(false)}
                        variant="vertical"
                        size="default"
                        className="px-2"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo */}
              <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
                <img src={supermerch} alt="SuperMerch" className="h-16 w-auto object-contain" />
              </div>
            </div>

            {/* Centre: Search Bar — desktop only */}
            <div className="hidden xl:flex w-full max-w-lg">
              <SearchBar
                onSearch={handleSearch}
                categoryData={v1categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                size="small"
                className="w-full"
              />
            </div>

            {/* Spacer on smaller screens to push icons right */}
            <div className="flex-1 xl:hidden" />

            {/* Right: Reorder + User Actions */}
            <div className="flex-shrink-0 xl:flex-1 flex items-center justify-end gap-3">
              <button
                onClick={() => navigate("/user/orders")}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reorder
              </button>
              <UserActions
                isAuthenticated={!!token}
                onLogout={() => setNavbarLogout(true)}
                cartQuantity={totalQuantity}
                favouriteQuantity={favouriteQuantity}
                size="default"
              />
            </div>
          </div>

          {/* Search bar — below the top line on smaller screens */}
          <div className="xl:hidden mt-2">
            <SearchBar
              onSearch={handleSearch}
              categoryData={v1categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              size="small"
              className="w-full"
            />
          </div>
        </div>

        {/* Row 2: Nav items — desktop only */}
        <div className="hidden lg:block">
          <div className="Mycontainer px-4 lg:px-8">
            <NavigationMenu
              menuItems={menuItems}
              onItemClick={handleMenuClick}
              size="default"
              className="justify-center"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
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
