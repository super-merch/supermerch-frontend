import React, { useState, useEffect, useContext, useRef } from "react";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedCategory,
  applyFilters,
  setCategoryId,
} from "../../redux/slices/filterSlice";
import PriceFilter from "./PriceFilter";
import BrandCheckboxes from "./BrandFilter";
import PopularTags from "./PopularTags";
import { AppContext } from "../../context/AppContext";

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { products, skeletonLoading } = useContext(AppContext);

  const [categoriesData, setCategoriesData] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false); // <-- new
  // cache key (change suffix if you need to invalidate)
  const CATEGORIES_CACHE_KEY = "v1_categories_cache_v1";

  // load cache helper
  const loadCategoriesFromSession = () => {
    try {
      const raw = sessionStorage.getItem(CATEGORIES_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  // save cache helper
  const saveCategoriesToSession = (payload) => {
    try {
      sessionStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore write errors
    }
  };

  // in-memory ref + pending request ref
  const categoriesCacheRef = useRef(loadCategoriesFromSession()); // may be null or { data: [...] }
  const pendingCategoriesRequestRef = useRef(null);

  const fetchCategories = async () => {
    try {
      // If cache exists in memory, use it immediately
      if (categoriesCacheRef.current && categoriesCacheRef.current.data) {
        setCategoriesData(categoriesCacheRef.current.data);
        return;
      }

      // If there's already an in-flight request, await it
      if (pendingCategoriesRequestRef.current) {
        await pendingCategoriesRequestRef.current;
        if (categoriesCacheRef.current && categoriesCacheRef.current.data) {
          setCategoriesData(categoriesCacheRef.current.data);
        }
        return;
      }

      // create the fetch promise and store it so concurrent calls reuse it
      const p = (async () => {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1-categories`
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        const safeData = data && data.data ? data.data : [];

        // persist to both memory ref and sessionStorage
        categoriesCacheRef.current = { data: safeData, fetchedAt: Date.now() };
        saveCategoriesToSession(categoriesCacheRef.current);

        setCategoriesData(safeData);
      })();

      pendingCategoriesRequestRef.current = p;
      try {
        await p;
      } finally {
        pendingCategoriesRequestRef.current = null;
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesData([]); // fallback
    }
  };

  const filter = props.filter ? props.filter : false;

  useEffect(() => {
    if (!filter) {
      fetchCategories();
    }
  }, []);

  const handleCategoryClick = (category) => {
    // category is string in some places and object elsewhere in your code.
    // Here we expect category to be the category name (string).
    dispatch(setSelectedCategory(category));
    dispatch(applyFilters());
  };

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

  // derive list to render (first 5 or all)
  const visibleLimit = 5;
  const visibleCategories = showAllCategories
    ? categoriesData
    : categoriesData.slice(0, visibleLimit);

  return (
    <div className=" z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute  top-4   bg-smallHeader text-white px-2 py-1 rounded"
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
        className={`transition-all    ${
          isSidebarOpen
            ? "lg:w-[100%] z-10  mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen  md:shadow-lg  shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4  "
            : " hidden "
        }   `}
      >
        <div className="h-full overflow-y-auto pr-3 ">
          {!filter && (
            <div className="border-b-2 pb-6">
              <h1 className="font-medium text-base mb-1 uppercase text-brand">
                Categories
              </h1>

              {/* All Products */}
              <div
                onClick={() => {
                  handleCategoryClick("all");
                  dispatch(setCategoryId(null));
                }}
                className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
              >
                <p
                  className={`text-category hover:underline text-sm font-normal ${
                    selectedCategory === "all"
                      ? "underline text-smallHeader"
                      : ""
                  }`}
                >
                  All Products
                </p>
              </div>

              {/* Visible categories (first 5 or all) */}
              {visibleCategories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => {
                    // disable clicks while skeleton loading
                    if (skeletonLoading) return;
                    handleCategoryClick(category.name);
                    dispatch(setCategoryId(category.id));
                  }}
                  className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
                >
                  <p
                    className={`text-category  hover:underline ${
                      skeletonLoading ? "hover:cursor-not-allowed" : ""
                    } text-sm font-normal ${
                      selectedCategory === category.name
                        ? "underline text-smallHeader"
                        : ""
                    }`}
                  >
                    {category.name}
                  </p>
                </div>
              ))}

              {/* See all / Show less toggle */}
              {categoriesData.length > visibleLimit && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    disabled={skeletonLoading}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {showAllCategories
                      ? "Show less"
                      : `See all (${categoriesData.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <PriceFilter />
            {/* <BrandCheckboxes /> */}
            {/* <PopularTags /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
