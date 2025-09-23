import { useContext, useEffect } from "react";
import { FaFire } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import noimage from "/noimage.png";

const HotDeals = () => {
  const navigate = useNavigate();
  const {
    fetchDiscountedProducts,
    discountedProducts,
    fetchProducts,
    products,
    skeletonLoading,
  } = useContext(AppContext);

  useEffect(() => {
    fetchDiscountedProducts(1, "", 6); // Fetch 6 discounted products to ensure we have at least 4
    // Fallback: also fetch regular products in case discounted products are empty
    fetchProducts(1, "", 6);
  }, []);

  // Use discounted products if available, otherwise fall back to regular products
  const displayProducts =
    discountedProducts && discountedProducts.length > 0
      ? discountedProducts
      : products || [];

  // Debug logging

  // Handle product click
  const handleViewProduct = (productId, name) => {
    navigate(`/product/${name}`, { state: productId });
  };

  // Get price from product data and convert to USD
  const getProductPrice = (product) => {
    const priceGroups = product.product?.prices?.price_groups || [];
    const basePrice = priceGroups.find((group) => group?.base_price) || {};
    const priceBreaks = basePrice.base_price?.price_breaks || [];
    const price = priceBreaks.length > 0 ? parseFloat(priceBreaks[0].price) : 0;
    // Convert to USD (assuming the price is in AUD, using approximate conversion rate)
    return price * 0.65; // Approximate AUD to USD conversion
  };

  return (
    <div className="bg-white border border-blue-500 rounded-lg p-4 h-full flex flex-col shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FaFire className="text-orange-500 text-lg animate-pulse hover:animate-bounce transition-all duration-300" />
        <h3 className="text-lg font-bold text-gray-800">HOT DEALS</h3>
      </div>

      {/* Hot Deals List */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden">
        {skeletonLoading
          ? // Loading skeleton
            [...Array(4)].map((_, index) => {
              const isLastItem = index === 3;
              return (
                <div
                  key={index}
                  className={`bg-blue-50 rounded-lg p-3 animate-pulse ${
                    isLastItem ? "mb-0" : "mb-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-300 rounded-md flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              );
            })
          : // Real products
            (() => {
              // Ensure we always show 4 products, even if we need to repeat some
              const filteredProducts = displayProducts.filter((product) => {
                const price = getProductPrice(product);
                return price > 0; // Only show products with valid prices
              });

              // If we have fewer than 4 products, repeat them to fill the space
              const productsToShow = filteredProducts;
              // for (let i = 0; i < 4; i++) {
              //   if (filteredProducts.length > 0) {
              //     productsToShow.push(
              //       filteredProducts[i % filteredProducts.length]
              //     );
              //   }
              // }

              if (productsToShow.length === 0) {
                return (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">No products available</p>
                  </div>
                );
              }

              return productsToShow.map((product, index) => {
                const price = getProductPrice(product);
                const isLastItem = index === productsToShow.length - 1;

                return (
                  <div
                    key={`${product.meta?.id || "product"}-${index}`}
                    className={`bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer ${
                      isLastItem ? "mb-0" : "mb-2"
                    }`}
                    onClick={() =>
                      handleViewProduct(
                        product.meta?.id,
                        product.overview?.name
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                        <img
                          src={product.overview?.hero_image || noimage}
                          alt={product.overview?.name || "Product"}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {/* Product Name */}
                        <h4
                          className="text-sm font-semibold text-gray-800 truncate mb-1"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {product.overview?.name || "No Name"}
                        </h4>
                        {/* Price */}
                        <span className="text-lg font-bold text-blue-600">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          to="/hot-deals"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View All Hot Deals →
        </Link>
      </div>
    </div>
  );
};

export default HotDeals;
