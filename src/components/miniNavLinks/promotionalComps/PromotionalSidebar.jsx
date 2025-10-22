// import React, { useState, useEffect, useContext } from "react";
// import { IoMenu } from "react-icons/io5";
// import { IoClose } from "react-icons/io5";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     setSelectedCategory,
//     applyFilters,
// } from "../../../redux/slices/filterSlice";
// import { AppContext } from "../../../context/AppContext";
// import PromotionalBrandFilter from "./PromotionalBrandFilter";
// import PromotionalPriceFilter from "./PromotionalPriceFilter";
// import PromotionalPopularTags from "./PromotionalPopularTags";
// import { fetchcategoryProduct, matchProduct } from "@/redux/slices/categorySlice";
// import { Link } from "react-router-dom";

// const PromotionalSidebar = () => {
//     const dispatch = useDispatch();
//     const { selectedCategory } = useSelector((state) => state.filters);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//     const [isMobile, setIsMobile] = useState(false);
//     const [isPromotionClickeed, setIsPromotionClickeed] = useState(false)
//     const { products, categoryProducts, setProducts } = useContext(AppContext)

//     let checkcatPro = useSelector((state) => state.categoryProduct.categoryProduct);

//     const categories = [
//         "promotion",
//         "headwear",
//         "clothing",
//         "promotion2",
//         "headwear2",
//         "clothing2",

//     ];

//     const promotionalCategories = [
//         [
//             { title: "PENS", path: '/promotional' },
//             { label: 'Plastic Pens', path: '/promotional' },
//             { label: 'Face Masks', path: '/promotional' },
//             { label: 'Health & Personal', path: '/promotional' },
//             { label: 'Metal Pens', path: '/promotional' },
//             { label: 'Stylus Pens', path: '/promotional' },
//             { label: 'Markers', path: '/promotional' },
//             { label: 'Highlighters', path: '/promotional' },
//             { label: 'Coloured Pencils', path: '/promotional' },
//             { label: 'Grey-Lead Pencils', path: '/promotional' },
//             { label: 'Pencil Sharpeners', path: '/promotional' },
//             { label: 'Other Pens', path: '/promotional' },
//             { label: 'Erasers', path: '/promotional' },
//             { label: 'Pen Packaging', path: '/promotional' },
//             { label: 'More', path: '/promotional' },
//         ],
//         [
//             { title: "Woman", path: '/' },
//             { label: 'Automotive', path: '/' },
//             { label: 'Bar and Counter Mats', path: '/' },
//             { label: 'Bottled Water', path: '/' },
//             { label: 'Calculators', path: '/' },
//             { label: 'Balloons', path: '/' },
//             { label: 'Clocks', path: '/' },
//             { label: 'Coin Banks', path: '/' },
//             { label: 'Compendiums', path: '/' },
//             { label: 'Confectionery', path: '/' },
//             { label: 'Desk Accessories', path: '/' },
//             { label: 'Drinkware Accessories', path: '/' },
//             { label: 'Enviro Bags', path: '/' },
//         ],
//         [
//             { title: "Kids", path: '/' },
//             { label: 'Enviro Products', path: '/' },
//             { label: 'Fitness Watches', path: '/' },
//             { label: 'Glassware', path: '/' },
//             { label: 'Golf Products', path: '/' },
//             { label: 'Headphones', path: '/' },
//             { label: 'Health & Fitness', path: '/' },
//             { label: 'Coin Banks', path: '/' },
//             { label: 'Lanyards & ID Products', path: '/' },
//             { label: 'MagicCubes', path: '/' },
//             { label: 'Magnets', path: '/' },
//             { label: 'Micro Fibre Cloth', path: '/' },
//             { label: 'Mouse Mats', path: '/' },
//         ],
//         [
//             { title: "TopWear", path: '/' },
//             { label: 'Packaging Boxes', path: '/' },
//             { label: 'Pencils', path: '/' },
//             { label: 'Pens', path: '/' },
//             { label: 'Personal Care', path: '/' },
//             { label: 'Personal Hygiene', path: '/' },
//             { label: 'Pet Products', path: '/' },
//             { label: 'Ribbons', path: '/' },
//             { label: "Rubik's Cube", path: '/' },
//             { label: 'Sports Bags', path: '/' },
//             { label: 'Sports Bags', path: '/' },
//             { label: 'Stress Shapes', path: '/' },
//         ],
//         [
//             { title: "BottomWear", path: '/' },
//             { label: 'Stubby Holders', path: '/' },
//             { label: 'Sunscreen & After Sun', path: '/' },
//             { label: 'Tablecloths', path: '/' },
//             { label: 'Socks and Thongs', path: '/' },
//             { label: 'Tools', path: '/' },
//             { label: 'Torches & Lighting', path: '/' },
//             { label: 'Toys & Games', path: '/' },
//             { label: "Travel", path: '/' },
//             { label: 'Watches', path: '/' },
//             { label: 'USB Drives', path: '/' },
//         ],
//     ]

//     const handleCategoryClick = (category) => {
//         dispatch(setSelectedCategory(category));
//         // dispatch(applyFilters());

//         // Ensure filters are applied AFTER the state is updated
//         setTimeout(() => {
//             dispatch(applyFilters());
//         }, 0);
//     };
//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth <= 1025);
//             if (window.innerWidth > 1025) {
//                 setIsSidebarOpen(true);
//             } else {
//                 setIsSidebarOpen(false);
//             }
//         };

//         handleResize();
//         window.addEventListener("resize", handleResize);

//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     const toggleSidebar = () => {
//         setIsSidebarOpen((prev) => !prev);
//     };

//     const productCategory = () => {
//         dispatch(matchProduct({ categoryProducts, checkcatPro }));
//         setIsPromotionClickeed(true)
//     }
//     useEffect(() => {
//         console.log("Fetching category products...");
//         dispatch(fetchcategoryProduct());
//     }, [dispatch, isPromotionClickeed]);

//     //   useEffect(() => {
//     //     if (checkcatPro.length > 0) { // ✅ Ensure data is available
//     //       productCategory();
//     //     }
//     //   }, [checkcatPro]);

//     const filteredProducts = useSelector(state => state.categoryProduct.filteredProducts);
//     const handleSubCategories = (subCategory) => {
//         dispatch(matchProduct({ categoryProducts, checkcatPro }));
//         const subFilterProducts = products.filter((product) => {
//           const typeName = product.product?.categorisation?.promodata_product_type?.type_name_text;
//           return typeName?.toLowerCase().includes(subCategory.toLowerCase());
//         });
//         setProducts(subFilterProducts)
//         console.log(subFilterProducts, "subfilters");
//         console.log(subCategory);

//       }

//       useEffect(() => {
//         fetchcategoryProduct()
//       }, [dispatch, products])

//     return (
//         <div className=" z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
//             {isMobile && (
//                 <button
//                     onClick={toggleSidebar}
//                     className="absolute  top-4   bg-primary text-white px-2 py-1 rounded"
//                 >
//                     {isSidebarOpen ? (
//                         <IoClose className="text-xl" />
//                     ) : (
//                         <IoMenu className="text-xl" />
//                     )}
//                 </button>
//             )}

//             {/* Sidebar */}
//             <div
//                 className={`transition-all    ${isSidebarOpen
//                     ? "lg:w-[100%] z-10  mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen  md:shadow-lg  shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4  "
//                     : " hidden "
//                     }   `}
//             >
//                 <div className="h-full overflow-y-auto pr-3 ">
//                     <div className="border-b-2 pb-6">
//                         <h1 className="font-medium text-base mb-1 uppercase text-brand">
//                             Promotional
//                         </h1>
//                         {/* {products.map((category) => (
//               <div
//                 key={category}
//                 onClick={() => handleCategoryClick(category.product.categorisation.supplier_category)}
//                 className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
//               >
//                 <p
//                   className={`text-category hover:underline text-sm font-normal ${selectedCategory === category
//                       ? "underline text-smallHeader"
//                       : ""
//                     }`}
//                 >
//                   {category.product.categorisation.supplier_category}
//                 </p>
//               </div>
//             ))} */}

//                         {/* {[...new Set(products.map(p => p.product.categorisation.supplier_category))].map((category) => (
//               <div
//                 key={category}
//                 onClick={() => handleCategoryClick(category)}
//                 className=" transform group hover:scale-x-95 transition duration-300 py-1 capitalize cursor-pointer"
//               >
//                 <p
//                   className={`text-category hover:underline text-sm font-normal ${selectedCategory === category ? "underline text-smallHeader" : ""
//                     }`}
//                 >
//                   {category}
//                 </p>
//               </div>
//             ))} */}

//                         {/* {products
//                             .filter((p) => p.product.categorisation.supplier_category === selectedCategory)
//                             .map((category) => (
//                                 <div key={category} className="py-1 capitalize">
//                                     <p className="text-sm font-normal underline text-smallHeader">
//                                         {category.product.categorisation.supplier_category}
//                                     </p>

//                                     <ul className="mt-2 pl-4 space-y-1">
//                                         {category.subTypes.map((sub, i) => (
//                                             <li key={i}>
//                                                 <Link to={sub.path} className="font-semibold text-[15px] block">
//                                                     {sub.name}
//                                                 </Link>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             ))} */}

//                         {/* {categoryProducts.slice(0, 4).map((category, categoryIndex) => (
//                             <div key={categoryIndex} className="">
//                                 <p className='text-lg font-semibold text-blue-500'>{category?.name}</p>
//                                 <ul>
//                                     {category.subTypes.map((item, index) => (
//                                         <li key={index} className='py-1 rounded'>
//                                             <p to={item.path} className='font-semibold hover:underline text-[13px] block'>
//                                                 {item.name}
//                                             </p>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         ))} */}

//                         {promotionalCategories.map((category, categoryIndex) => (
//                             <div key={categoryIndex} className="lg:min-w-[180px] max-lg:min-w-[140px]">
//                                 <ul>
//                                     {category.map((item, index) => (
//                                         <li key={index} className='max-lg:border-b py-1 hover:underline rounded'>
//                                             <p className='text-lg font-semibold text-blue-500 cursor-pointer'>{item?.title}</p>
//                                             <Link onClick={() => handleSubCategories(item.label)} className='font-semibold text-[13px] block'>
//                                                 {item.label}
//                                             </Link>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         ))}

//                     </div>
//                     <div className="mt-4">
//                         <PromotionalPriceFilter />
//                         <PromotionalBrandFilter />
//                         <PromotionalPopularTags />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PromotionalSidebar;

import React, { useState, useEffect, useContext } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../../context/AppContext";
import PromotionalBrandFilter from "./PromotionalBrandFilter";
import PromotionalPriceFilter from "./PromotionalPriceFilter";
import PromotionalPopularTags from "./PromotionalPopularTags";
import {
  fetchcategoryProduct,
  matchProduct,
} from "@/redux/slices/categorySlice";
import { Link } from "react-router-dom";

const PromotionalSidebar = () => {
  const dispatch = useDispatch();
  // Although you might be using AppContext for some data,
  // for filtering we now rely on Redux’s category slice.
  const { categoryProducts } = useContext(AppContext);
  const checkcatPro = useSelector(
    (state) => state.categoryProduct.categoryProduct
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Example promotional categories – add or adjust as needed.
  const promotionalCategories = [
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
    // Add additional arrays as needed…
  ];

  // When a subcategory is clicked, dispatch the filtering action.
  // The matchProduct action should be updated to handle a subCategory filter.
  const handleSubCategories = (subCategory) => {
    dispatch(matchProduct({ categoryProducts, checkcatPro, subCategory }));
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

  // Add click outside functionality to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.querySelector("[data-sidebar-content]");
        const hamburgerButton = document.querySelector("[data-sidebar-toggle]");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          hamburgerButton &&
          !hamburgerButton.contains(event.target)
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    if (isMobile && isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  // Fetch the category products if they are not already loaded.
  useEffect(() => {
    dispatch(fetchcategoryProduct());
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]">
      {/* Hidden toggle button for external control */}
      <button
        data-sidebar-toggle
        onClick={toggleSidebar}
        className="hidden"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        data-sidebar-content
        className={`transition-all ${
          isSidebarOpen
            ? "lg:w-[100%] z-10 lg:mt-0 md:w-96 w-[90vw] absolute h-screen md:shadow-lg shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4"
            : "hidden"
        }`}
      >
        <div className="h-full overflow-y-auto pr-3">
          <div className="border-b-2 pb-6">
            <h1 className="font-medium text-base mb-1 uppercase text-brand">
              Promotional
            </h1>
            {promotionalCategories.map((category, categoryIndex) => (
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
                        onClick={() => handleSubCategories(item.label)}
                        className="font-semibold text-[13px] block"
                        to={item.path}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <PromotionalPriceFilter />
            <PromotionalBrandFilter />
            <PromotionalPopularTags />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalSidebar;
