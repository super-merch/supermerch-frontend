import { useState, useEffect, useContext } from "react";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory, applyFilters, setCategoryId } from "../../redux/slices/filterSlice";
import PriceFilter from "./PriceFilter";
import { AppContext } from "../../context/AppContext";
import { megaMenu, megaMenuClothing, headWear } from "../../assets/assets";
import PropTypes from "prop-types";

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { skeletonLoading, sidebarActiveCategory } = useContext(AppContext);

  const [categoriesData, setCategoriesData] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false); // <-- new
  const [filteredCategories, setFilteredCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1-categories`);
      const data = await response.json();
      setCategoriesData(data.data || []); // safe default
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesData([]); // fallback
    }
  };
  const filter = props.filter ? props.filter : false;

  // Filter categories based on active category
  useEffect(() => {
    if (sidebarActiveCategory) {
      let categoryToFilter = null;

      // Check in different category arrays
      if (sidebarActiveCategory === "Clothing") {
        categoryToFilter = megaMenuClothing[0];
      } else if (sidebarActiveCategory === "Headwear") {
        categoryToFilter = headWear[0];
      } else if (sidebarActiveCategory === "Promotional") {
        // For promotional, use the entire megaMenu array (all promotional categories)
        setFilteredCategories(megaMenu);
        return;
      } else {
        categoryToFilter = megaMenu.find((cat) => cat.name === sidebarActiveCategory);
      }

      if (categoryToFilter && categoryToFilter.subTypes) {
        // Flatten all subcategories from the active category
        const allSubCategories = categoryToFilter.subTypes.flatMap((subType) =>
          subType.items
            ? subType.items.map((item) => ({
                _id: item.id,
                id: item.id,
                name: item.name,
                parentCategory: sidebarActiveCategory,
              }))
            : []
        );
        setFilteredCategories(allSubCategories);
      } else {
        setFilteredCategories([]);
      }
    } else {
      // If no specific category is active, show all categories
      setFilteredCategories(categoriesData);
    }
  }, [sidebarActiveCategory, categoriesData]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // category is string in some places and object elsewhere in your code.
    // Here we expect category to be the category name (string).
    dispatch(setSelectedCategory(category));
    dispatch(applyFilters());

    // Clear sidebar filter when "all" is clicked
    if (category === "all") {
      // This will be handled by the parent component or context
      // The sidebar will automatically show all categories when sidebarActiveCategory is null
    }
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
  // Use filtered categories if a specific category is active, otherwise use all categories
  const categoriesToShow = sidebarActiveCategory ? filteredCategories : categoriesData;
  const visibleCategories = showAllCategories ? categoriesToShow : categoriesToShow.slice(0, visibleLimit);

  return (
    <div className=" z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
      {isMobile && (
        <button onClick={toggleSidebar} className="absolute  top-4   bg-smallHeader text-white px-2 py-1 rounded">
          {isSidebarOpen ? <IoClose className="text-xl" /> : <IoMenu className="text-xl" />}
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
                {sidebarActiveCategory ? `${sidebarActiveCategory} Categories` : "Categories"}
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
                    selectedCategory === "all" ? "underline text-smallHeader" : ""
                  }`}
                >
                  All Products
                </p>
              </div>

              {/* Visible categories (first 5 or all) */}
              {sidebarActiveCategory === "Promotional"
                ? // Render promotional categories with their subTypes
                  visibleCategories.map((category) => (
                    <div key={category.id} className="mb-4">
                      <h3 className="font-semibold text-sm text-brand mb-2">{category.name}</h3>
                      {category.subTypes &&
                        category.subTypes.map((subType) => (
                          <div key={subType.label} className="ml-2 mb-2">
                            <h4 className="font-medium text-xs text-gray-600 mb-1">{subType.label}</h4>
                            {subType.items &&
                              subType.items.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    if (skeletonLoading) return;
                                    handleCategoryClick(item.name);
                                    dispatch(setCategoryId(item.id));
                                  }}
                                  className="transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer ml-2"
                                >
                                  <p
                                    className={`text-category hover:underline ${
                                      skeletonLoading ? "hover:cursor-not-allowed" : ""
                                    } text-xs font-normal ${selectedCategory === item.name ? "underline text-smallHeader" : ""}`}
                                  >
                                    {item.name}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  ))
                : // Render regular categories (clothing, headwear, etc.)
                  visibleCategories.map((category) => (
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
                        } text-sm font-normal ${selectedCategory === category.name ? "underline text-smallHeader" : ""}`}
                      >
                        {category.name}
                      </p>
                    </div>
                  ))}

              {/* See all / Show less toggle */}
              {categoriesToShow.length > visibleLimit && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    disabled={skeletonLoading}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {showAllCategories ? "Show less" : `See all (${categoriesToShow.length})`}
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

Sidebar.propTypes = {
  filter: PropTypes.bool,
};

export default Sidebar;
