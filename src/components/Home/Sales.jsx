import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import noimage from '/noimage.png';

const Sale = () => {
  const { fetchProducts, products,fetchBestSellerProducts,bestSellerProducts, error, skeletonLoading,fetchDiscountedProducts,discountedProducts, fetchTrendingProducts, fetchNewArrivalProducts, arrivalProducts, trendingProducts } =
    useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    // fetchProducts();
    fetchTrendingProducts(1,"",3); // Fetch trending products
    fetchNewArrivalProducts(1,"",3); // Fetch new arrival products
    fetchDiscountedProducts(1,'',3); // Fetch new arrival products
    fetchBestSellerProducts(1,"",3); // Fetch best seller products
  }, []);
  

  const categories = [
    { title: 'Trendings' },
    { title: 'New Arrivals' },
    { title: 'Best Sellers' },
    { title: 'Sale' },
  ];

  // Distribute products among categories (ensuring different items in each)
  const chunkedProducts = categories.map(
    (_, index) => {
      // For "Trendings" (index 0), use trending products
      if (index === 0) {
        return trendingProducts || [];
      }
      // For "New Arrivals" (index 1), use arrival products
      if (index === 1) {
        return arrivalProducts || [];
      }
      if (index === 3) {
        return discountedProducts || [];
      }
      return bestSellerProducts || [];
    }
  );

  // Handle product click
  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
  };

  return (
    <div className='grid grid-cols-1 gap-4 pt-8 Mycontainer sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4'>
      {/* Show error if API fails */}
      {error && <div className="flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        ></div>
      </div>}

      {/* Show skeleton if loading */}
      {skeletonLoading
        ? categories.map((_, index) => (
          <div key={index} className={`w-full mb-8 `}>
            <div className='w-32 h-6 mb-4 bg-gray-200 rounded animate-pulse'></div>
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 p-4 border rounded-md animate-pulse'
                >
                  <div className='w-20 h-20 bg-gray-300 rounded'></div>
                  <div>
                    <div className='w-24 h-4 mb-2 bg-gray-200 rounded'></div>
                    <div className='w-16 h-4 bg-gray-200 rounded'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        : categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={`w-full mb-8 ${categoryIndex % 2===0 ? "bg-gray-200": "bg-gray-100"} rounded-md p-2 `}>
            {/* Section Header */}
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-semibold'>{category.title}</h3>
              {chunkedProducts[categoryIndex].length>0 && <button onClick={() => category.title === 'Trendings' ? navigate('/trendings') : category.title === 'New Arrivals' ? navigate('/new-arrivals') : category.title === 'Sale' ? navigate('/sales') : navigate('/bestSellers')} className='text-sm font-semibold border-b-2 text-smallHeader border-smallHeader'>
                VIEW ALL
              </button>}
            </div>
            {/* Products List */}
            <div>
              {chunkedProducts[categoryIndex].length>0 ? ((chunkedProducts[categoryIndex] || [])
                .filter((product) => {
                  const priceGroups = product.product?.prices?.price_groups || [];
                  const basePrice = priceGroups.find((group) => group?.base_price) || {};
                  const priceBreaks = basePrice.base_price?.price_breaks || [];
                  const realPrice = priceBreaks.length > 0 ? priceBreaks[0].price : '0';

                  return parseFloat(realPrice) > 0; // Exclude products with zero price
                })
                .slice(0, 3)
                .map((product, index) => {
                  const priceGroups = product.product?.prices?.price_groups || [];
                  const basePrice = priceGroups.find((group) => group?.base_price) || {};
                  const priceBreaks = basePrice.base_price?.price_breaks || [];
                  const realPrice = priceBreaks.length > 0 ? priceBreaks[0].price : '0';

                  return (
                    <div
                      key={index}
                      onClick={() => handleViewProduct(product.meta.id)}
                      className='flex items-center gap-3 p-4 mb-4 transition duration-300 transform border rounded-md cursor-pointer group hover:scale-105'
                    >
                      <img
                        src={product.overview?.hero_image || noimage}
                        alt={product.overview?.name || 'No Name'}
                        className='object-cover w-20 h-20 rounded'
                      />
                      <div>
                        <p className='font-medium text-brand'>
                          {product.overview.name ||
                            product.overview.name.length > 30
                            ? product.overview.name.slice(0, 30) + '...'
                            : 'No Name '}
                        </p>
                        <p className='font-semibold text-smallHeader'>
                          ${realPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })):
                <div className='flex items-center mt-10 justify-center'>
                  <p className='text-lg '>No products found</p>
                </div>
              }

            </div>
          </div>
        ))}
    </div>
  );
};

export default Sale;