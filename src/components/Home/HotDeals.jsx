import { useContext, useEffect } from "react";
import { FaFire } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ProductsContext } from "../../context/ProductsContext";
import noimage from "/noimage.png";
import { getProductPrice, slugify } from "@/utils/utils";
import Tooltip from "../Common/Tooltip";

const HotDeals = () => {
  const navigate = useNavigate();
  const {
    fetchDiscountedProducts,
    discountedProducts,
    products,
    discountedProductsLoading,
  } = useContext(ProductsContext);


  useEffect(() => {
    if (discountedProducts.length === 0 && products.length === 0) {
      fetchDiscountedProducts(1, "", 6); // Fetch 6 discounted products to ensure we have at least 4
      // Fallback: also fetch regular products in case discounted products are empty
    }
  }, [discountedProducts.length, products.length, fetchDiscountedProducts]);

  // Use discounted products if available, otherwise fall back to regular products
  const displayProducts =
    discountedProducts && discountedProducts.length > 0
      ? discountedProducts?.filter((product) => {
        const price = getProductPrice(product);
        return price > 0; // Only show products with valid prices
      })
      : products || [];

  return (
    <div className="border border-primary rounded-lg p-4 h-full flex flex-col shadow-lg shadow-primary/20 min-h-96 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FaFire className="text-orange-500 text-lg animate-pulse hover:animate-bounce transition-all duration-300" />
        <h3 className="text-lg font-bold text-gray-800">HOT DEALS</h3>
      </div>

      {/* Hot Deals List */}
      <div className="flex-1 flex flex-col justify-start overflow-y-auto ">
        {discountedProductsLoading
          ? // Loading skeleton
          [...Array(4)].map((_, index) => {
            const isLastItem = index === 3;
            return (
              <div
                key={index}
                className={`bg-blue-50 rounded-lg p-3 animate-pulse ${isLastItem ? "mb-0" : "mb-2"
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
            if (displayProducts.length === 0) {
              return (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No products available</p>
                </div>
              );
            }

            return displayProducts.slice(0, 4).map((product, index) => {
              const price = getProductPrice(product);
              const isLastItem = index === 3;
              const encodedId = btoa(product.meta?.id); // base64 encode
              const slug = slugify(product.overview?.name);
              const discountPct = product.discountInfo?.discount || 0;
              let unDiscountedPrice;
              if (discountPct > 0) {
                unDiscountedPrice =
                  getProductPrice(product, product.meta.id) /
                  (1 - discountPct / 100);
              }

              return (
                <Link
                  to={`/product/${encodeURIComponent(slug)}?ref=${encodedId}`}
                  key={`${product.meta?.id || "product"}-${index}`}
                  className={`bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer ${isLastItem ? "mb-0" : "mb-2"
                    }`}
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
                    <div className="flex flex-col flex-1 min-w-0">
                      {/* Product Name */}

                      <Tooltip
                        content={product.overview?.name || "No Name"}
                        placement="top"
                      >
                        <h4
                          className="text-sm font-semibold text-gray-800 truncate mb-1"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {product.overview?.name || "No Name"}
                        </h4>
                      </Tooltip>
                      {/* Price */}
                      {discountPct > 0 ? (
                        <div className="flex items-center gap-0">
                          <span className="text-base text-red-500 line-through mr-2">
                            ${unDiscountedPrice.toFixed(2)}
                          </span>
                          <span className="text-base sm:text-base font-bold text-primary">
                            $
                            {getProductPrice(
                              product,
                              product.meta.id
                            ).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base sm:text-base font-bold text-primary">
                          $
                          {getProductPrice(product, product.meta.id).toFixed(
                            2
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          to="/sales"
          className="text-sm text-secondary hover:text-primary font-medium transition-colors"
        >
          View All Hot Deals →
        </Link>
      </div>
    </div>
  );
};

export default HotDeals;
