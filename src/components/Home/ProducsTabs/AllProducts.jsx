import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import noimage from "/noimage.png";
import { useDispatch } from "react-redux";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import axios from "axios";

const AllProducts = ({ activeTab }) => {
  const navigate = useNavigate();
  const {
    fetchProducts,
    products,
    error,
    skeletonLoading,
    marginApi,
    getGlobalDiscount,
    totalDiscount,
  } = useContext(AppContext);

  // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);
  const dispatch = useDispatch();

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
  };

  // Function to open modal
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

  if (error)
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );
  return (
    <>
      {activeTab === "All Product" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {skeletonLoading
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
                    // Check if there's at least one valid price
                    return (
                      priceBreaks.length > 0 &&
                      priceBreaks[0]?.price !== undefined
                    );
                  })
                  .slice(0, 8)
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
                        className="relative border border-border2 cursor-pointer max-h-[280px] sm:max-h-[350px] h-full group"
                      >
                        {/* Show discount badge */}
                        {discountPct > 0 && (
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
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

                        <div className="max-h-[45%] sm:max-h-[50%] h-full border-b overflow-hidden">
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

                        <div className="absolute w-18 grid grid-cols-2 gap-1 top-[2%] left-[5%]">
                          {product?.product?.colours?.list.length > 0 &&
                            product?.product?.colours?.list
                              .slice(0, 15) // Limit to 15 colors
                              .flatMap((colorObj, index) =>
                                colorObj.colours.map((color, subIndex) => (
                                  <div
                                    key={`${index}-${subIndex}`}
                                    style={{
                                      backgroundColor:
                                        colorObj.swatch?.[subIndex] ||
                                        color.toLowerCase(),
                                    }}
                                    className="w-4 h-4 rounded-sm border border-slate-900"
                                  />
                                ))
                              )}
                        </div>


                        <div className="p-2 sm:p-4">
                          <div className="text-center">
                            <h2 className="text-sm sm:text-lg font-medium text-brand leading-tight">
                              {product.overview.name &&
                              product.overview.name.length > 18
                                ? product.overview.name.slice(0, 18) + "..."
                                : product.overview.name || "No Name"}
                            </h2>
                            <p className="text-xs sm:text-sm font-normal text-brand mt-1">
                              Code: {product.overview.code}
                            </p>

                            {/* Updated Price display matching category page logic */}
                            <div className="pt-1 sm:pt-2">
                              <h2 className="text-lg sm:text-xl font-semibold text-heading">
                                $
                                {minPrice === maxPrice ? (
                                  <span>{minPrice.toFixed(2)}</span>
                                ) : (
                                  <span>
                                    {minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
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

                          <div className="flex justify-between gap-1 mt-2 sm:mt-2 mb-1">
                            <p
                              onClick={() => {
                                dispatch(addToFavourite(product));
                                toast.success("Product added to favourites");
                              }}
                              className="p-2 sm:p-3 flex items-center text-lg sm:text-2xl rounded-sm bg-icons cursor-pointer"
                            >
                              <CiHeart />
                            </p>
                            <div className="flex items-center justify-center w-full gap-1 px-1 sm:px-2 py-2 sm:py-3 text-white rounded-sm cursor-pointer bg-smallHeader">
                              <p className="text-lg sm:text-xl">
                                <IoCartOutline />
                              </p>
                              <button
                                onClick={() =>
                                  handleViewProduct(product.meta.id)
                                }
                                className="text-xs sm:text-sm uppercase"
                              >
                                Add to cart
                              </button>
                            </div>
                            <p
                              onClick={() => handleOpenModal(product)}
                              className="p-2 sm:p-3 flex items-center text-lg sm:text-2xl rounded-sm bg-icons cursor-pointer hover:bg-opacity-80 transition-colors"
                            >
                              <AiOutlineEye />
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>
      )}

      {/* Modal for enlarged product image */}
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
    </>
  );
};

export default AllProducts;