import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { AppContext } from "../context/AppContext";
import noimage from "/noimage.png";
import { getProductPrice } from "@/utils/utils";

const HotDeals = () => {
  const navigate = useNavigate();
  const {
    fetchMultipleDiscountedPages,
    skeletonLoading,
    marginApi,
    productionIds,
    australiaIds,
    products,
    discountedProducts,
    fetchDiscountedProducts,
    fetchProducts,
  } = useContext(AppContext);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiscountedProducts(1, "", 6); // Fetch 6 discounted products to ensure we have at least 4
    // Fallback: also fetch regular products in case discounted products are empty
    fetchProducts(1, "", 6);
  }, []);

  const displayProducts =
    discountedProducts && discountedProducts.length > 0
      ? discountedProducts
      : products || [];

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId);
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  const filteredProducts = useMemo(() => {
    return (displayProducts || []).filter((p) => getProductPrice(p) > 0);
  }, [displayProducts, marginApi]);

  return (
    <div className="Mycontainer py-6">
      <h1 className="text-2xl font-bold text-brand">Hot Deals</h1>

      {error && (
        <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div
        className={`$${
          (isLoading || skeletonLoading) && filteredProducts.length === 0
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            : ""
        }`}
      >
        {isLoading || skeletonLoading ? (
          Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="relative p-4 border rounded-lg shadow-md border-border2"
            >
              <Skeleton height={200} className="rounded-md" />
              <div className="p-4">
                <Skeleton height={20} width={120} className="rounded" />
                <Skeleton height={15} width={80} className="mt-2 rounded" />
                <Skeleton height={25} width={100} className="mt-3 rounded" />
                <Skeleton height={15} width={60} className="mt-2 rounded" />
              </div>
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          <div className="grid justify-center grid-cols-1 gap-6 mt-6 custom-card:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const productId = product.meta?.id;
              const minPrice = getProductPrice(product,product?.meta?.id);
              const discountPct = product.discountInfo?.discount || 0;
              const isGlobalDiscount = product.discountInfo?.isGlobal || false;

              return (
                <div
                  key={productId}
                  className="relative border border-border2 transition-all duration-200 hover:border-primary cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                  onClick={() =>
                    handleViewProduct(productId, product.overview?.name)
                  }
                >
                  {discountPct > 0 && (
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-red-500 rounded">
                        {discountPct}%
                      </span>
                      {isGlobalDiscount && (
                        <span className="block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-orange-500 rounded mt-1">
                          Sale
                        </span>
                      )}
                    </div>
                  )}

                  <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
                    {(productionIds.has(productId) ||
                      productionIds.has(String(productId))) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                        <svg
                          className="w-3 h-3 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <path
                            d="M12 7v5l3 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>24Hr Production</span>
                      </span>
                    )}

                    {(australiaIds.has(productId) ||
                      australiaIds.has(String(productId))) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
                        <svg
                          className="w-3 h-3 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <path d="M3 6h10l-2 3 2 3H3V6z" fill="currentColor" />
                          <rect
                            x="3"
                            y="4"
                            width="1"
                            height="16"
                            rx="0.5"
                            fill="currentColor"
                            opacity="0.9"
                          />
                        </svg>
                        <span>Australia Made</span>
                      </span>
                    )}
                  </div>

                  <div className="max-h-[62%] sm:max-h-[71%] h-full border-b overflow-hidden relative">
                    <img
                      src={product.overview?.hero_image || noimage}
                      alt={product.overview?.name || "Product"}
                      className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-2">
                    <div className="text-center">
                      <h2 className="text-sm sm:text-lg font-semibold text-brand sm:leading-[18px]">
                        {product.overview?.name || "No Name"}
                      </h2>

                      <p className="text-xs text-gray-500 pt-1">
                        Min Qty:{" "}
                        {product.product?.prices?.price_groups?.[0]?.base_price
                          ?.price_breaks?.[0]?.qty || 1}
                      </p>

                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-primary">
                          From ${minPrice?.toFixed(2)}
                        </h2>
                        {discountPct > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            {discountPct}% discount applied
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">No hot deals available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotDeals;
