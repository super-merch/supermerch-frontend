import React, { useState, useEffect, useContext } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromFavourite } from "../redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";

const FavouritePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {productionIds,
    australiaIds,} = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const [cardHover, setCardHover] = useState(null);

  const navigate = useNavigate();

  

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  const handleRemoveFavourite = (product) => {
    toast.success("Product removed from favourites");
    dispatch(removeFromFavourite(product));
  };

  return (
    <div className="mt-10">
      <div className=" Mycontainer">
        <h2 className="mb-5 text-2xl font-semibold text-center">Favourites</h2>
        <div
          className={`grid gap-5 max-default:grid-cols-1 ${
            favouriteItems.length > 0
              ? "lg:grid-cols-4 max-default:grid-cols-1 max-md:grid-cols-3 max-sm:grid-cols-2"
              : "lg:grid-cols-1"
          }`}
        >
          {favouriteItems.length > 0 ? (
            favouriteItems
              ?.filter((product) => {
                const priceGroups = product.product?.prices?.price_groups || [];
                const basePrice =
                  priceGroups.find((group) => group?.base_price) || {};
                const priceBreaks = basePrice.base_price?.price_breaks || [];
                // Check if there's at least one valid price
                return (
                  priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
                );
              })

              .map((product) => {
                const priceGroups = product.product?.prices?.price_groups || [];
                const basePrice =
                  priceGroups.find((group) => group?.base_price) || {};
                const priceBreaks = basePrice.base_price?.price_breaks || [];

                // Get an array of prices from priceBreaks (original pricing logic)
                const prices = priceBreaks
                  .map((breakItem) => breakItem.price)
                  .filter((price) => price !== undefined);

                // Calculate the minimum and maximum price values (keeping original logic)
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                return (
                  <div
                    key={product.id}
                    className="relative border border-border2 hover:border-1 hover:rounded-md transition-all duration-200 hover:border-red-500 cursor-pointer max-h-[320px] sm:max-h-[400px] h-full group"
                    onClick={() =>
                      handleViewProduct(product.meta.id, product.overview.name)
                    }
                    onMouseEnter={() => setCardHover(product.meta.id)}
                    onMouseLeave={() => setCardHover(null)}
                  >
                    {/* Favourite button - positioned to avoid conflicts */}
                    <div className="absolute top-2 right-2 z-20">
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleRemoveFavourite(product);
                        }}
                        className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
                      >
                        <IoIosHeart className="text-lg text-red-500 transition-colors" />
                      </div>
                    </div>
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

                    {/* Color swatches */}

                    {/* Reduced content area */}
                    <div className="p-2">
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
                        <h2
                          className={`text-sm transition-all duration-300 ${
                            cardHover === product.meta.id &&
                            product.overview.name.length > 20
                              ? "sm:text-[18px]"
                              : "sm:text-lg"
                          } font-semibold text-brand sm:leading-[18px] `}
                        >
                          {(product.overview.name &&
                            // product.overview.name.length > 20 &&
                            // cardHover !== product.meta.id
                            //   ? product.overview.name.slice(0, 20) + "..."
                            product.overview.name) ||
                            "No Name"}
                        </h2>

                        {/* Minimum quantity */}
                        <p className="text-xs text-gray-500">
                          {product.product?.prices?.price_groups[0]?.base_price
                            ?.price_breaks[0]?.qty || 1}{" "}
                          minimum quantity
                        </p>

                        {/* Price display - using original pricing without margin additions */}
                        <div className="">
                          <h2 className="text-base sm:text-lg font-bold text-heading">
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
              })
          ) : (
            <div className="">
              <h1 className="text-xl text-center   my-20 text-brand">
                Your favourites are empty! <br /> Tap the ❤️ on any product to
                save it here for later.
              </h1>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            {/* Image container */}
            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Product info */}
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
    </div>
  );
};

export default FavouritePage;
