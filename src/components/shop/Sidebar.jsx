import React, { useState, useEffect, useContext } from "react";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedCategory,
  applyFilters,
} from "../../redux/slices/filterSlice";
import PriceFilter from "./PriceFilter";
import BrandCheckboxes from "./BrandFilter";
import PopularTags from "./PopularTags";
import { AppContext } from "../../context/AppContext";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { products } = useContext(AppContext)

  const categories = [
    "promotion",
    "headwear",
    "clothing",
    "promotion2",
    "headwear2",
    "clothing2",

  ];
  const handleCategoryClick = (category) => {
    dispatch(setSelectedCategory(category));
    // dispatch(applyFilters());

     // Ensure filters are applied AFTER the state is updated
  setTimeout(() => {
    dispatch(applyFilters());
  }, 0);
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
        className={`transition-all    ${isSidebarOpen
          ? "lg:w-[100%] z-10  mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen  md:shadow-lg  shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4  "
          : " hidden "
          }   `}
      >
        <div className="h-full overflow-y-auto pr-3 ">
          <div className="border-b-2 pb-6">
            <h1 className="font-medium text-base mb-1 uppercase text-brand">
              Categories
            </h1>
            {/* {products.map((category) => (
              <div
                key={category}
                onClick={() => handleCategoryClick(category.product.categorisation.supplier_category)}
                className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
              >
                <p
                  className={`text-category hover:underline text-sm font-normal ${selectedCategory === category
                      ? "underline text-smallHeader"
                      : ""
                    }`}
                >
                  {category.product.categorisation.supplier_category}
                </p>
              </div>
            ))} */}

            {[...new Set(products.map(p => p.product.categorisation.supplier_category))].map((category) => (
              <div
                key={category}
                onClick={() => handleCategoryClick(category)}
                className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
              >
                <p
                  className={`text-category hover:underline text-sm font-normal ${selectedCategory === category ? "underline text-smallHeader" : ""
                    }`}
                >
                  {category}
                </p>
              </div>
            ))}

          </div>
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
