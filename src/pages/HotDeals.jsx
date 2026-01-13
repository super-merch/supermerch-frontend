import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ProductsContext } from "../context/ProductsContext";
import noimage from "/noimage.png";
import { getProductPrice } from "@/utils/utils";
import { Clock, Flag } from "lucide-react";

const HotDeals = () => {
  const navigate = useNavigate();
  const {
    fetchMultipleDiscountedPages,
    skeletonLoading,
    marginApi,
    marginAdd,
<<<<<<< HEAD
  } = useContext(ProductsContext);
=======
>>>>>>> 4b6d1c80ff5b98813b386bbf5304bca9fa2816f7

  useEffect(() => {
    if(!Object.keys(marginApi).length){
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  const [error, setError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [source, setSource] = useState("discounted");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const PAGE_SIZE = 12;
  useEffect(() => {
    let isMounted = true;
    const fetchAllPage = async (page) => {
      const response = await fetch(
        `${backendUrl}/api/client-products?page=${page}&limit=${PAGE_SIZE}&filter=true`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      return {
        items: data.data || [],
        totalPages: data.total_pages || data.totalPages || 0,
      };
    };

    const loadInitial = async () => {
      setIsLoading(true);
      try {
        const discounted = await fetchMultipleDiscountedPages(
          1,
          PAGE_SIZE,
          "",
          1
        );
        if (!isMounted) return;

        if (discounted.length > 0) {
          setSource("discounted");
          setItems(discounted);
          setCurrentPage(1);
          setHasMore(discounted.length === PAGE_SIZE);
          return;
        }

        const { items: allItems, totalPages } = await fetchAllPage(1);
        if (!isMounted) return;
        setSource("all");
        setItems(allItems);
        setCurrentPage(1);
        setHasMore(totalPages > 1);
      } catch (err) {
        if (!isMounted) return;
        setError("Failed to load hot deals. Please try again later.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [backendUrl, fetchMultipleDiscountedPages, PAGE_SIZE]);

  const displayProducts = items || [];
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
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      if (source === "discounted") {
        const nextItems = await fetchMultipleDiscountedPages(
          1,
          PAGE_SIZE,
          "",
          nextPage
        );
        setItems((prev) => [...prev, ...nextItems]);
        setCurrentPage(nextPage);
        if (nextItems.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        const response = await fetch(
          `${backendUrl}/api/client-products?page=${nextPage}&limit=${PAGE_SIZE}&filter=true`,
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const nextItems = data.data || [];
        setItems((prev) => [...prev, ...nextItems]);
        setCurrentPage(nextPage);
        const totalPages = data.total_pages || data.totalPages || 0;
        if (nextPage >= totalPages || nextItems.length === 0) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load more products. Please try again later.");
    } finally {
      setIsLoadingMore(false);
    }
  };
  return (
    <div className="Mycontainer py-6">
      <h1 className="text-2xl font-bold text-brand">Hot Deals</h1>

      {error && (
        <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div
        className={`${(isLoading || skeletonLoading) && filteredProducts.length === 0
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
              const minPrice = getProductPrice(product, product?.meta?.id);
              const discountPct = product.discountInfo?.discount || 0;
              const isGlobalDiscount = product.discountInfo?.isGlobal || false;
              let unDiscountedPrice;
              if (discountPct > 0) {
                unDiscountedPrice =
                  getProductPrice(product, product.meta.id) /
                  (1 - discountPct / 100);
              }
              const is24HrProduct = (() => {
                const groups = product?.product?.prices?.price_groups ?? [];
                if (!Array.isArray(groups) || groups.length === 0) return false;

                const re = /(same\s*-?\s*day|24\s*hrs?|24\s*hours?)/i;

                return groups.some((g) => {
                  // check base_price.lead_time
                  if (re.test(String(g?.base_price?.lead_time ?? "")))
                    return true;

                  // check additions[].lead_time
                  if (Array.isArray(g?.additions)) {
                    if (
                      g.additions.some((a) =>
                        re.test(String(a?.lead_time ?? ""))
                      )
                    )
                      return true;
                  }

                  return false;
                });
              })();
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

                  <div
                    className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 z-20 flex flex-col gap-1 pointer-events-none"
                    style={{ maxWidth: "calc(100% - 50px)" }}
                  >
                    {is24HrProduct && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-[9px] sm:text-[10px] md:text-xs font-semibold border border-green-200 shadow-sm overflow-hidden">
                        <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                        <span className="truncate max-w-[40px] sm:max-w-none">
                          24Hr
                        </span>
                      </span>
                    )}

                    {product?.product?.categorisation?.promodata_attributes?.some(
                      (item) => item === "Local Factors: Made In Australia"
                    ) && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-[9px] sm:text-[10px] md:text-xs font-semibold border border-yellow-200 shadow-sm overflow-hidden">
                          <Flag className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                          <span className="truncate max-w-[50px] sm:max-w-none">
                            AU Made
                          </span>
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
                          {discountPct > 0 ? (
                            <>
                              <span className="text-sm text-red-500 line-through mr-2">
                                ${unDiscountedPrice.toFixed(2)}
                              </span>
                              <span className="text-base sm:text-base font-bold text-primary">
                                $
                                {getProductPrice(
                                  product,
                                  product.meta.id
                                ).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base sm:text-base font-bold text-primary">
                              $
                              {getProductPrice(
                                product,
                                product.meta.id
                              ).toFixed(2)}
                            </span>
                          )}
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
            {hasMore && filteredProducts.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2  rounded border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
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
