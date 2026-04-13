import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { ProductsContext } from "../../context/ProductsContext";

const Breadcrumb = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    setSelectedParamCategoryId,
    setCurrentPage,
    setSidebarActiveCategory,
    setActiveFilterCategory,
  } = useContext(ProductsContext);

  // Get URL parameters
  const categoryName = searchParams.get("categoryName")
    ? decodeURIComponent(searchParams.get("categoryName"))
    : null;
  const subCategory = searchParams.get("subCategory")
    ? decodeURIComponent(searchParams.get("subCategory"))
    : null;
  const category = searchParams.get("category");

  // Determine the current page type and breadcrumb text
  const getCurrentPageInfo = () => {
    const pathname = location.pathname;

    // Special pages
    if (pathname === "/australia-made" || pathname === "/australia-made") {
      return { pageName: "Australia Made", isSpecialPage: true };
    }
    if (pathname === "/hour-production" || pathname === "/24hr-production") {
      return { pageName: "24 Hour Production", isSpecialPage: true };
    }
    if (pathname === "/Sale" || pathname === "/sales") {
      return { pageName: "Sale", isSpecialPage: true };
    }
    if (pathname === "/return-gifts") {
      return { pageName: "Return Gifts", isSpecialPage: true };
    }
    if (pathname === "/search") {
      return { pageName: searchParams.get("search"), isSpecialPage: true };
    }

    // Category pages
    // if (pathname === "/Clothing") {
    //   return { pageName: "Clothing", isSpecialPage: false };
    // }
    // if (pathname === "/Headwear") {
    //   return { pageName: "Headwear", isSpecialPage: false };
    // }
    // if (pathname === "/Promotional" || pathname === "/Spromotional") {
    //   return { pageName: "Promotional", isSpecialPage: false };
    // }

    // Default fallback
    return { pageName: "Shop", isSpecialPage: false };
  };

  const { pageName, isSpecialPage } = getCurrentPageInfo();

  // Handle category navigation
  const handleCategoryClick = () => {
    if (categoryName && category) {
      // Navigate to the main category page
      const encodedCategoryName = encodeURIComponent(categoryName);
      let targetRoute = "/promotional"; // Default fallback
      window.location.href = `${targetRoute}?categoryName=${encodedCategoryName}&category=${category}`;
      setSelectedParamCategoryId(category);
      setCurrentPage(1);
      setSidebarActiveCategory(categoryName);
      setActiveFilterCategory(null);
    }
  };

  return (
    <div className="Mycontainer">
      {/* Mobile Layout */}
      <div className="lg:hidden px-0 md:py-8 py-4">
        <div className="flex flex-wrap items-center gap-1 text-smallHeader text-xs">
          {/* Home */}
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-smallHeader-dark transition-colors"
          >
            <p className="truncate">Home</p>/
          </Link>

          {/* Category */}
          {location.pathname === "/promotional" && (
            <Link
              to="/return-gifts"
              className="flex items-center gap-1 hover:text-smallHeader-dark transition-colors"
            >
              <p className="truncate">Category</p>/
            </Link>
          )}

          {/* Main Category */}
          {categoryName && (
            <>
              <span
                className="hover:underline hover:text-smallHeader-dark transition-colors truncate"
                onClick={handleCategoryClick}
              >
                {categoryName}
              </span>
              /
            </>
          )}

          {/* Subcategory or Page Name */}
          {subCategory ? (
            <span className="text-gray-600 truncate">{subCategory}</span>
          ) : (
            <span className="text-gray-600 truncate">{pageName}</span>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-2 text-smallHeader py-2 text-lg">
          {/* Home */}
          <Link to="/" className="flex items-center gap-1">
            <p>Home</p>/
          </Link>

          {/* Category */}
          {location.pathname === "/promotional" && (
            <Link to="/return-gifts" className="flex items-center gap-1">
              <p>Category</p>/
            </Link>
          )}

          {/* Main Category */}
          {categoryName && (
            <>
              <span
                className="cursor-pointer hover:underline"
                onClick={handleCategoryClick}
              >
                {categoryName}
              </span>
              /
            </>
          )}

          {/* Subcategory or Page Name */}
          {subCategory ? (
            <span>{subCategory}</span>
          ) : (
            <span>{pageName == "Shop" ? "" : pageName}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
