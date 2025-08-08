import React, { useState, useEffect, useContext } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { AppContext } from '../../context/AppContext';
import {
  fetchcategoryProduct,
  matchProduct,
} from '@/redux/slices/categorySlice';
import { Link } from 'react-router-dom';
import PromotionalPriceFilter from '../miniNavLinks/promotionalComps/PromotionalPriceFilter';
import PromotionalBrandFilter from '../miniNavLinks/promotionalComps/PromotionalBrandFilter';
import PromotionalPopularTags from '../miniNavLinks/promotionalComps/PromotionalPopularTags';
import {
  matchPromotionalProduct,
  setAllProducts,
} from '@/redux/slices/promotionalSlice';

const SpromotionalSidebar = ({
  filterLocalProducts,
  setFilterLocalProducts,
}) => {
  const dispatch = useDispatch();
  // Although you might be using AppContext for some data,
  // for filtering we now rely on Redux’s category slice.
  const {
    categoryProducts,
    products,
    activeFilterCategory,
    setActiveFilterCategory,
    fetchParamProducts,
    paramProducts,
    setParamProducts,
  } = useContext(AppContext);
  const checkcatPro = useSelector(
    (state) => state.categoryProduct.categoryProduct
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Example promotional categories – add or adjust as needed.
  const promotionalCategories = [
    [
      { title: 'PENS', path: '/Spromotional' },
      { label: 'Plastic Pens', path: '/Spromotional' },
      { label: 'Face Masks', path: '/Spromotional' },
      { label: 'Health & Personal', path: '/Spromotional' },
      { label: 'Metal Pens', path: '/Spromotional' },
      { label: 'Stylus Pens', path: '/Spromotional' },
      { label: 'Markers', path: '/Spromotional' },
      { label: 'Highlighters', path: '/Spromotional' },
      { label: 'Coloured Pencils', path: '/Spromotional' },
      { label: 'Grey-Lead Pencils', path: '/Spromotional' },
      { label: 'Pencil Sharpeners', path: '/Spromotional' },
      { label: 'Other Pens', path: '/Spromotional' },
      { label: 'Erasers', path: '/Spromotional' },
      { label: 'Pen Packaging', path: '/Spromotional' },
      { label: 'More', path: '/Spromotional' },
    ],
    [
      { title: 'HEADWEAR', path: '/Spromotional' },
      { label: 'Caps', path: '/Spromotional' },
      { label: 'Beanies', path: '/Spromotional' },
      { label: 'Bucket Hats', path: '/Spromotional' },
      { label: 'Visors', path: '/Spromotional' },
      { label: 'Headbands', path: '/Spromotional' },
      { label: 'Other Headwear', path: '/Spromotional' },
    ],
    [
      { title: 'CLOTHING', path: '/Spromotional' },
      { label: 'T-Shirts', path: '/Spromotional' },
      { label: 'Hoodies', path: '/Spromotional' },
      { label: 'Jackets', path: '/Spromotional' },
      { label: 'Polo Shirts', path: '/Spromotional' },
      { label: 'Workwear', path: '/Spromotional' },
      { label: 'Sportswear', path: '/Spromotional' },
      { label: 'Other Clothing', path: '/Spromotional' },
    ],
    
  ];

  const [sideCatClicked, setSideCatClicked] = useState(false);

  // When a subcategory is clicked, dispatch the filtering action.
  // The matchProduct action should be updated to handle a subCategory filter.
  const handleSubCategories = async (subCategory) => {
    // console.log("Clicked category:", subCategory);

    // Search for a product with a matching categorisation type name (ignoring case).
    const matchedProduct = products.find((product) => {
      const productTypeName =
        product.product?.categorisation?.product_type?.type_name;
      return (
        productTypeName &&
        productTypeName.toLowerCase() === subCategory.toLowerCase()
      );
    });

    if (matchedProduct) {
      const categoryId =
        matchedProduct.product.categorisation.product_type.type_id;
      //   console.log("Matched category id:", categoryId);

      try {
        // Call fetchProducts with page=1, an empty sort option, and the found categoryId.
        const response = await fetchParamProducts(categoryId);
        // Adjust this extraction based on your API's response structure.
        const fetchedProducts = response.data?.data || response.data;
        // Update the local state with the fetched products.
        setFilterLocalProducts(fetchedProducts);
        // Update the active category label.
        setActiveFilterCategory(subCategory);
      } catch (error) {
        console.error('Error fetching products for category:', error);
      }
    } else {
      console.log('No matching product found for', subCategory);
    }
  };

  // useEffect(() => {
  //     handleSubCategories();
  // }, [setSideCatClicked])

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch the category products if they are not already loaded.
  // useEffect(() => {
  //     dispatch(fetchcategoryProduct());
  // }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className='z-10 lg:sticky sm:sticky md:sticky lg:top-0 md:top-0 lg:h-[calc(100vh-0rem)] md:h-[calc(100vh-0rem)]'>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className='absolute px-2 py-1 text-white rounded top-4 bg-smallHeader'
        >
          {isSidebarOpen ? (
            <IoClose className='text-xl' />
          ) : (
            <IoMenu className='text-xl' />
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`transition-all ${
          isSidebarOpen
            ? 'lg:w-[100%] z-10 mt-14 lg:mt-0 md:w-96 w-[90vw] absolute h-screen md:shadow-lg shadow-lg bg-white lg:shadow-none px-6 lg:px-0 py-4'
            : 'hidden'
        }`}
      >
        <div className='h-full pr-3 overflow-y-auto'>
          <div className='pb-6 border-b-2'>
            <h1 className='mb-1 text-base font-medium uppercase text-brand'>
              Promotional
            </h1>
            {promotionalCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className='lg:min-w-[180px] max-lg:min-w-[140px]'
              >
                <ul>
                  {category.map((item, index) => (
                    <li
                      key={index}
                      className='py-1  rounded max-lg:border-b hover:underline'
                    >
                      <p className='text-lg font-semibold text-blue-500 cursor-pointer'>
                        {item?.title}
                      </p>
                      <button
                        onClick={() => handleSubCategories(item.label)}
                        className={`font-semibold text-[13px] block 
                                                    ${
                                                      activeFilterCategory ===
                                                      item.label
                                                        ? 'text-blue-500'
                                                        : ''
                                                    }
                                                    `}
                        // to={item.path}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className='mt-4'>
            <PromotionalPriceFilter />
            <PromotionalBrandFilter />
            <PromotionalPopularTags />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpromotionalSidebar;
