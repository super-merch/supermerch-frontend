import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";;
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import noimage from "/noimage.png";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const Clothing = ({ activeTab }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { marginApi } = useContext(AppContext);

  const dispatch = useDispatch();

  const [productionIds, setProductionIds] = useState(new Set());
      const getAll24HourProduction = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/24hour/get`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            const productIds = data.map((item) => Number(item.id));
            setProductionIds(new Set(productIds));
            console.log("Fetched 24 Hour Production products:", productionIds);
          } else {
            console.error(
              "Failed to fetch 24 Hour Production products:",
              response.status
            );
          }
        } catch (error) {
          console.error("Error fetching 24 Hour Production products:", error);
        }
      };
      const [australiaIds, setAustraliaIds] = useState(new Set());
      const getAllAustralia = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/australia/get`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            // Ensure consistent data types (convert to strings)
            const productIds = data.map((item) => Number(item.id));
            setAustraliaIds(new Set(productIds));
            console.log("Fetched Australia products:", data);
          } else {
            console.error("Failed to fetch Australia products:", response.status);
          }
        } catch (error) {
          console.error("Error fetching Australia products:", error);
        }
      };
      // useEffect(() => {
      //   getAll24HourProduction();
      //   getAllAustralia();
      // }, []);

  // Fetch products when tab opens
  useEffect(() => {
    if (activeTab === "Clothing") {
      fetchClothingProducts();
      getAll24HourProduction();
    getAllAustralia();
    }
  }, [activeTab]);

  const fetchClothingProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/client-products/category?category=dress&page=1&limit=8&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setProducts(data.data.slice(0, 8)); // Ensure only 8 products
    } catch (err) {
      console.error("Error fetching clothing products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

const [cardHover, setCardHover] = useState(null);      const favSet = new Set()
    
      favouriteItems.map((item) => {
        favSet.add(item.meta.id)
      })

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const handleViewProduct = (productId,name) => {
    navigate(`/product/${name}`, { state:productId  });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeTab === "Clothing" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-5 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative p-2 sm:p-4 border rounded-lg shadow-md border-border2"
                  >
                    <Skeleton
                      height={150}
                      className="sm:h-[200px] rounded-md"
                    />
                    <div className="p-2 sm:p-4">
                      <Skeleton
                        height={16}
                        width={100}
                        className="sm:h-5 sm:w-[120px] rounded"
                      />
                      <Skeleton
                        height={12}
                        width={60}
                        className="mt-2 sm:h-[15px] sm:w-20 rounded"
                      />
                      <Skeleton
                        height={20}
                        width={80}
                        className="mt-3 sm:h-[25px] sm:w-[100px] rounded"
                      />
                      <Skeleton
                        height={12}
                        width={50}
                        className="mt-2 sm:h-[15px] sm:w-[60px] rounded"
                      />
                      <div className="flex items-center justify-between pt-2">
                        <Skeleton
                          height={16}
                          width={60}
                          className="sm:h-5 sm:w-20 rounded"
                        />
                        <Skeleton
                          height={16}
                          width={60}
                          className="sm:h-5 sm:w-20 rounded"
                        />
                      </div>
                      <div className="flex justify-between gap-1 mt-4 sm:mt-6 mb-2">
                        <Skeleton
                          circle
                          height={32}
                          width={32}
                          className="sm:h-10 sm:w-10"
                        />
                        <Skeleton
                          height={32}
                          width={80}
                          className="sm:h-10 sm:w-[120px] rounded"
                        />
                        <Skeleton
                          circle
                          height={32}
                          width={32}
                          className="sm:h-10 sm:w-10"
                        />
                      </div>
                    </div>
                  </div>
                ))
              : products
                  ?.filter((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];
                    return (
                      priceBreaks.length > 0 &&
                      priceBreaks[0]?.price !== undefined
                    );
                  })
                  .map((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];

                    // Get an array of prices from priceBreaks (these are already discounted)
                    const prices = priceBreaks
                      .map((breakItem) => breakItem.price)
                      .filter((price) => price !== undefined);

                    // 1) compute raw min/max
                    let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                    let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                    // 2) pull margin info (guarding against undefined)
                    const productId = product.meta.id;
                    const marginEntry = marginApi[productId] || {};
                    const marginFlat =
                      typeof marginEntry.marginFlat === "number"
                        ? marginEntry.marginFlat
                        : 0;
                    const baseMarginPrice =
                      typeof marginEntry.baseMarginPrice === "number"
                        ? marginEntry.baseMarginPrice
                        : 0;

                    // 3) apply the flat margin to both ends of the range
                    minPrice += marginFlat;
                    maxPrice += marginFlat;

                    // Get discount percentage from product's discount info
                    const discountPct = product.discountInfo?.discount || 0;
                    const isGlobalDiscount =
                      product.discountInfo?.isGlobal || false;

                    return (
                      <div
                        key={productId}
                        className="relative border border-border2 hover:border-1 hover:rounded-md transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                        onClick={() => handleViewProduct(product.meta.id,product.overview.name)}
                        onMouseEnter={()=>setCardHover(product.meta.id)}
                        onMouseLeave={()=>setCardHover(null)}
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
                              {/* small clock SVG (no extra imports) */}
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
                              {/* simple flag/triangle SVG */}
                              <svg
                                className="w-3 h-3 flex-shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                              >
                                <path
                                  d="M3 6h10l-2 3 2 3H3V6z"
                                  fill="currentColor"
                                />
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
                          >
                            {favSet.has(product.meta.id) ? <IoIosHeart className="text-lg text-red-500" /> : <CiHeart  className="text-lg text-gray-700 hover:text-red-500 transition-colors" />}
                          </div>
                        </div>

                        {/* Enlarged image section */}
                        <div className="max-h-[62%] sm:max-h-[71%] h-full border-b overflow-hidden relative">
                          <img
                            src={
                              product.overview.hero_image
                                ? product.overview.hero_image
                                : noimage
                            }
                            alt=""
                            className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>

                     
                        {/* Reduced content area */}
                        <div className="p-2 ">
                          <div className=" flex justify-center mb-1 gap-1  z-10">
                            {product?.product?.colours?.list.length > 1 &&
                              (() => {
                                // Extract unique colors and filter out colors with spaces/multiple words
                                const uniqueColors = [
                                  ...new Set(
                                    product?.product?.colours?.list
                                      .flatMap((colorObj) => colorObj.colours)
                                      .filter((color) => !color.includes(" ")) // Remove colors with spaces
                                  ),
                                ];

                                return uniqueColors
                                  .slice(0, 12)
                                  .map((color, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        backgroundColor:
                                          color
                                            .toLowerCase()
                                            // Blues

                                            .replace("navy", "#1e40af")

                                            // Greys/Neutrals

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

                                            // Greens

                                            .replace("mint", "#10b981")
                                            .replace("sage", "#9ca3af")
                                            .replace("kiwi", "#8fbc8f")
                                            .replace("khaki", "#bdb76b")
                                            .replace("teal", "#0d9488")
                                            .replace("emerald", "#10b981")

                                            // Reds/Pinks

                                            .replace("burgundy", "#7f1d1d")
                                            .replace("red", "#ef4444")
                                            .replace("pink", "#ec4899")
                                            .replace("coral", "#ff7f7f")
                                            .replace("berry", "#8b0000")
                                            .replace("maroon", "#7f1d1d")
                                            .replace("rose", "#f43f5e")
                                            .replace("fuchsia", "#d946ef")

                                            // Oranges/Yellows
                                            .replace("orange", "#f97316")
                                            .replace("yellow", "#eab308")
                                            .replace("mustard", "#ffdb58")
                                            .replace("rust", "#b7410e")
                                            .replace("amber", "#f59e0b")

                                            // Purples
                                            .replace("lavender", "#c084fc")
                                            .replace("violet", "#8b5cf6")
                                            .replace("indigo", "#6366f1")
                                            .replace("purple", "#a855f7")
                                            .replace("mauve", "#dda0dd")

                                            // Browns/Beiges
                                            .replace("cream", "#fef3c7")
                                            .replace("beige", "#f5f5dc")
                                            .replace("ecru", "#c2b280")
                                            .replace("tan", "#d2b48c")
                                            .replace("brown", "#92400e")

                                            // Other colors
                                            .replace("turquoise", "#06b6d4")
                                            .replace("aqua", "#22d3ee")
                                            .replace("cyan", "#06b6d4")
                                            .replace("lime", "#84cc16")
                                            .replace("white", "#ffffff")
                                            .replace("black", "#000000")

                                            .replace(" ", "") || // remove remaining spaces
                                          color.toLowerCase(),
                                      }}
                                      className="w-4 h-4 rounded-full border border-slate-900"
                                    />
                                  ));
                              })()}
                          </div>
                          <div className="text-center">
                            <h2 className={`text-sm transition-all duration-300 ${cardHover===product.meta.id && product.overview.name.length > 20  ? "sm:text-[18px]" : "sm:text-lg"} font-semibold text-brand sm:leading-[18px] `}>
                              {product.overview.name &&
                              // product.overview.name.length > 20 && cardHover!==product.meta.id
                              //   ? product.overview.name.slice(0, 20) + "..."
                                 product.overview.name || "No Name"}
                            </h2>

                            {/* Minimum quantity */}
                            <p className="text-xs text-gray-500 pt-1">
                              Min Qty: {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}{" "}
                              
                            </p>

                            {/* Updated Price display with better font */}
                            <div className="">
                              <h2 className="text-base sm:text-lg font-bold text-heading ">
                                From $
                                {minPrice === maxPrice ? (
                                  <span>{minPrice.toFixed(2)}</span>
                                ) : (
                                  <span>{minPrice.toFixed(2)}</span>
                                )}
                              </h2>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>
      )}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-brand mb-2">
                  {selectedProduct.overview.name || "No Name"}
                </h2>
                <p className="text-gray-600 mb-2">
                  Code: {selectedProduct.overview.code}
                </p>
                {selectedProduct.overview.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedProduct.overview.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clothing;
