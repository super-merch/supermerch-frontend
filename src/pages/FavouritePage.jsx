import React, { useState, useEffect } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromFavourite } from "../redux/slices/favouriteSlice";
import { toast } from "react-toastify";

const FavouritePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
  };

  const handleRemoveFavourite = (product) => {
    toast.success("Product removed from favourites");
    dispatch(removeFromFavourite(product));
  };

  return (
    <div className="mt-10">
      <div className=" Mycontainer">
        <h2 className="mb-5 text-2xl font-semibold text-center">Favourites</h2>
        <div className={`grid gap-5 max-default:grid-cols-1 ${favouriteItems.length > 0 ? "lg:grid-cols-4 max-default:grid-cols-1 max-md:grid-cols-3 max-sm:grid-cols-2":"lg:grid-cols-1"}`}>
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
                    onClick={() => handleViewProduct(product.meta.id)}
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
                      <div className=" flex justify-center mb-2 gap-1  z-10">
                          {product?.product?.colours?.list.length > 1 &&
                            product?.product?.colours?.list
                              .slice(0, 12)
                              .flatMap((colorObj, index) =>
                                colorObj.colours.map((color, subIndex) => (
                                  <div
                                    key={`${index}-${subIndex}`}
                                    style={{
                                      backgroundColor:
                                        colorObj.swatch?.[subIndex] ||
                                        color
                                          .toLowerCase()
                                          .replace("dark blue", "#1e3a8a")
                                          .replace("light blue", "#3b82f6")
                                          .replace("navy blue", "#1e40af")
                                          .replace("royal blue", "#2563eb")
                                          .replace("sky blue", "#0ea5e9")
                                          .replace("gunmetal", "#2a3439")
                                          .replace("dark grey", "#4b5563")
                                          .replace("light grey", "#9ca3af")
                                          .replace("dark gray", "#4b5563")
                                          .replace("light gray", "#9ca3af")
                                          .replace("charcoal", "#374151")
                                          .replace("lime green", "#65a30d")
                                          .replace("forest green", "#166534")
                                          .replace("dark green", "#15803d")
                                          .replace("light green", "#16a34a")
                                          .replace("bright green", "#22c55e")
                                          .replace("dark red", "#dc2626")
                                          .replace("bright red", "#ef4444")
                                          .replace("wine red", "#991b1b")
                                          .replace("burgundy", "#7f1d1d")
                                          .replace("hot pink", "#ec4899")
                                          .replace("bright pink", "#f472b6")
                                          .replace("light pink", "#f9a8d4")
                                          .replace("dark pink", "#be185d")
                                          .replace("bright orange", "#f97316")
                                          .replace("dark orange", "#ea580c")
                                          .replace("bright yellow", "#eab308")
                                          .replace("golden yellow", "#f59e0b")
                                          .replace("dark yellow", "#ca8a04")
                                          .replace("cream", "#fef3c7")
                                          .replace("beige", "#f5f5dc")
                                          .replace("tan", "#d2b48c")
                                          .replace("brown", "#92400e")
                                          .replace("dark brown", "#78350f")
                                          .replace("light brown", "#a3a3a3")
                                          .replace("maroon", "#7f1d1d")
                                          .replace("teal", "#0d9488")
                                          .replace("turquoise", "#06b6d4")
                                          .replace("aqua", "#22d3ee")
                                          .replace("mint", "#10b981")
                                          .replace("lavender", "#c084fc")
                                          .replace("violet", "#8b5cf6")
                                          .replace("indigo", "#6366f1")
                                          .replace("slate", "#64748b")
                                          .replace("stone", "#78716c")
                                          .replace("zinc", "#71717a")
                                          .replace("neutral", "#737373")
                                          .replace("rose", "#f43f5e")
                                          .replace("emerald", "#10b981")
                                          .replace("cyan", "#06b6d4")
                                          .replace("amber", "#f59e0b")
                                          .replace("lime", "#84cc16")
                                          .replace("fuchsia", "#d946ef")
                                          .replace(" ", "") || // remove remaining spaces
                                        color.toLowerCase(),
                                    }}
                                    className="w-4 h-4 rounded-full border border-slate-900"
                                  />
                                ))
                              )}
                        </div>
                      <div className="text-center">
                        <h2
                          className={`text-sm transition-all duration-300 ${
                            cardHover === product.meta.id &&
                            product.overview.name.length > 20
                              ? "sm:text-[18px]"
                              : "sm:text-lg"
                          } font-semibold text-brand sm:leading-[17px] `}
                        >
                          {product.overview.name &&
                          product.overview.name.length > 20 &&
                          cardHover !== product.meta.id
                            ? product.overview.name.slice(0, 20) + "..."
                            : product.overview.name || "No Name"}
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
                            Starting From $
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
                Your favorites are empty! <br /> Tap the ❤️ on any product to save it
                here for later.
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
