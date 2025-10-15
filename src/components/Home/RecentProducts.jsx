import { AppContext } from "@/context/AppContext";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import noimage from "/noimage.png";
import { toast } from "react-toastify";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { useNavigate } from "react-router-dom";

export default function RecentProducts() {
  const [products, setProducts] = useState([]);
  const [cardHover, setCardHover] = useState(null);

  const dispatch = useDispatch();
  const { marginApi, productionIds, australiaIds } = useContext(AppContext);
  const { favouriteItems } = useSelector((state) => state.favouriteProducts || {});
  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");
  const navigate = useNavigate();
  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  // small optimization: memoize favourite id set
  const favSet = useMemo(() => {
    const s = new Set();
    (favouriteItems || []).forEach((item) => {
      if (item?.meta?.id) s.add(item.meta.id);
    });
    return s;
  }, [favouriteItems]);

  useEffect(() => {
    const recentProducts = localStorage.getItem("recentlyViewed");
    if (recentProducts) {
      try {
        const parsed = JSON.parse(recentProducts);
        setProducts(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setProducts([]);
      }
    }
  }, []);

  return (
    <section className="recently-viewed-section Mycontainer py-12">
      <h3 className="text-2xl font-semibold mb-4">Recently viewed products:</h3>

      {/* grid wrapper: show max 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products
          ?.filter((product) => {
            const priceGroups = product.product?.prices?.price_groups || [];
            const basePrice = priceGroups.find((group) => group?.base_price) || {};
            const priceBreaks = basePrice.base_price?.price_breaks || [];
            // Check if there's at least one valid price
            return priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined;
          })
          .slice(0, 4) // <= changed to 4
          .map((product) => {
            const priceGroups = product.product?.prices?.price_groups || [];
            const basePrice = priceGroups.find((group) => group?.base_price) || {};
            const priceBreaks = basePrice.base_price?.price_breaks || [];

            // Get an array of prices from priceBreaks (these are already discounted)
            const prices = priceBreaks
              .map((breakItem) => breakItem.price)
              .filter((price) => price !== undefined);

            // 1) compute raw min/max
            let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

            // 2) pull margin info (guarding against undefined)
            const productId = product.meta.id;
            const marginEntry = marginApi?.[productId] || {};
            const marginFlat =
              typeof marginEntry.marginFlat === "number" ? marginEntry.marginFlat : 0;
            const baseMarginPrice =
              typeof marginEntry.baseMarginPrice === "number"
                ? marginEntry.baseMarginPrice
                : 0;

            // 3) apply the flat margin to both ends of the range
            minPrice += (minPrice * marginFlat) / 100;
            maxPrice += (maxPrice * marginFlat) / 100;

            // Get discount percentage from product's discount info
            const discountPct = product.discountInfo?.discount || 0;
            const isGlobalDiscount = product.discountInfo?.isGlobal || false;

            return (
              <div
                key={productId}
                className="relative border border-border2 hover:border-1 hover:rounded-md transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                onClick={() =>handleViewProduct(product.meta.id, product.overview.name)}
                onMouseEnter={() => setCardHover(product.meta.id)}
                onMouseLeave={() => setCardHover(null)}
              >
                {/* Show discount badge */}
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
                  {(productionIds.has(product.meta.id) ||
                    productionIds.has(String(product.meta.id))) && (
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

                  {(australiaIds.has(product.meta.id) ||
                    australiaIds.has(String(product.meta.id))) && (
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

                {/* Favourite button - moved to top-right of image */}
                <div className="absolute top-2 right-2 z-20">
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      dispatch(addToFavourite(product));
                      toast.success("Product added to favourites");
                    }}
                    className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                    role="button"
                    aria-pressed={favSet.has(productId)}
                    aria-label={favSet.has(productId) ? "Remove favourite" : "Add to favourite"}
                  >
                    {favSet.has(productId) ? (
                      <IoIosHeart className="text-lg text-red-500" />
                    ) : (
                      <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Enlarged image section */}
                <div className="max-h-[65%] sm:max-h-[70%] h-full border-b overflow-hidden relative">
                  <img
                    src={product.overview?.hero_image ? product.overview.hero_image : noimage}
                    alt={product.overview?.name || "Product image"}
                    loading="lazy"
                    className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
                  />
                </div>

                {/* Reduced content area */}
                <div className="p-2 ">
                  <div className=" flex justify-center mb-1 gap-1  z-10">
                    {product?.product?.colours?.list?.length > 1 &&
                      (() => {
                        const uniqueColors = [
                          ...new Set(
                            (product?.product?.colours?.list || [])
                              .flatMap((colorObj) => colorObj.colours || [])
                              .filter((color) => color && !color.includes(" "))
                          ),
                        ];

                        return uniqueColors.slice(0, 12).map((color, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor:
                                color
                                  .toLowerCase()
                                  .replace("navy", "#1e40af")
                                  .replace("grey", "#6b7280")
                                  .replace("gray", "#6b7280")
                                  .replace("charcoal", "#374151")
                                  .replace("carbon", "#1f2937")
                                  .replace("gunmetal", "#2a3439")
                                  .replace("slate", "#64748b")
                                  .replace("stone", "#78716c")
                                  .replace("zinc", "#71717a")
                                  .replace("neutral", "#737373")
                                  .replace("taupe", "#b8860b")
                                  .replace("mint", "#10b981")
                                  .replace("sage", "#9ca3af")
                                  .replace("kiwi", "#8fbc8f")
                                  .replace("khaki", "#bdb76b")
                                  .replace("teal", "#0d9488")
                                  .replace("emerald", "#10b981")
                                  .replace("burgundy", "#7f1d1d")
                                  .replace("red", "#ef4444")
                                  .replace("pink", "#ec4899")
                                  .replace("coral", "#ff7f7f")
                                  .replace("berry", "#8b0000")
                                  .replace("maroon", "#7f1d1d")
                                  .replace("rose", "#f43f5e")
                                  .replace("fuchsia", "#d946ef")
                                  .replace("orange", "#f97316")
                                  .replace("yellow", "#eab308")
                                  .replace("mustard", "#ffdb58")
                                  .replace("rust", "#b7410e")
                                  .replace("amber", "#f59e0b")
                                  .replace("lavender", "#c084fc")
                                  .replace("violet", "#8b5cf6")
                                  .replace("indigo", "#6366f1")
                                  .replace("purple", "#a855f7")
                                  .replace("mauve", "#dda0dd")
                                  .replace("cream", "#fef3c7")
                                  .replace("beige", "#f5f5dc")
                                  .replace("ecru", "#c2b280")
                                  .replace("tan", "#d2b48c")
                                  .replace("brown", "#92400e")
                                  .replace("turquoise", "#06b6d4")
                                  .replace("aqua", "#22d3ee")
                                  .replace("cyan", "#06b6d4")
                                  .replace("lime", "#84cc16")
                                  .replace("white", "#ffffff")
                                  .replace("black", "#000000")
                                  .replace(" ", "") || color.toLowerCase(),
                            }}
                            className="w-4 h-4 rounded-full border border-slate-900"
                          />
                        ));
                      })()}
                  </div>
                  <div className="text-center">
                    <h2
                      className={`text-sm transition-all duration-300 ${
                        cardHover === product.meta.id && product.overview?.name?.length > 20
                          ? "sm:text-[18px]"
                          : "sm:text-lg"
                      } font-semibold text-brand sm:leading-[19px] `}
                    >
                      {product.overview?.name || "No Name"}
                    </h2>

                    {/* Minimum quantity */}
                    <p className="text-xs text-gray-500 pt-1">
                      Min Qty:{" "}
                      {product.product?.prices?.price_groups?.[0]?.base_price?.price_breaks?.[0]
                        ?.qty || 1}
                    </p>

                    {/* Updated Price display with better font */}
                    <div className="">
                      <h2 className="text-base sm:text-lg font-bold text-heading ">
                        From ${minPrice.toFixed(2)}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
