import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useContext } from "react";
import { ProductsContext } from "../../../context/ProductsContext";
import noimage from "/noimage.png";
import { slugify } from "@/utils/utils";

const Stationery = ({ activeTab }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    fetchProducts,
    products,
    error, 
    skeletonLoading,
    marginApi,
    marginAdd 
    } = useContext(ProductsContext);

  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

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
      {activeTab === "Stationery" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-5 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {skeletonLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-lg shadow-md border-border2"
                  >
                    <Skeleton height={200} className="rounded-md" />
                    <div className="p-4">
                      <Skeleton height={20} width={120} className="rounded" />
                      <Skeleton
                        height={15}
                        width={80}
                        className="mt-2 rounded"
                      />
                      <Skeleton
                        height={25}
                        width={100}
                        className="mt-3 rounded"
                      />
                      <Skeleton
                        height={15}
                        width={60}
                        className="mt-2 rounded"
                      />
                      <div className="flex items-center justify-between pt-2">
                        <Skeleton height={20} width={80} className="rounded" />
                        <Skeleton height={20} width={80} className="rounded" />
                      </div>
                      <div className="flex justify-between gap-1 mt-6 mb-2">
                        <Skeleton circle height={40} width={40} />
                        <Skeleton height={40} width={120} className="rounded" />
                        <Skeleton circle height={40} width={40} />
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
                  .slice(20, 24)
                  .map((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];

                    // Get an array of prices from priceBreaks
                    const prices = priceBreaks
                      .map((breakItem) => breakItem.price)
                      .filter((price) => price !== undefined);

                    // Calculate the minimum and maximum price values
                    const minPrice =
                      prices.length > 0 ? Math.min(...prices) : "0";
                    const maxPrice =
                      prices.length > 0 ? Math.max(...prices) : "0";
                    const productId = product.meta.id;
                    const marginEntry = marginApi[productId];
                    const marginPrice = marginEntry?.baseMarginPrice;

                    const displayPrice =
                      marginPrice != null
                        ? `$${marginPrice.toFixed(2)} - $${minPrice.toFixed(2)}`
                        : minPrice === maxPrice
                        ? `$${minPrice.toFixed(2)}`
                        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
                    return (
                      <div
                        key={product.id}
                        onClick={() =>
                          handleViewProduct(
                            product.meta.id,
                            product.overview.name
                          )
                        }
                        className="relative border border-border2 cursor-pointer max-h-[350px] h-full group"
                      >
                        <div
                          onClick={() =>
                            handleViewProduct(
                              product.meta.id,
                              product.overview.name
                            )
                          }
                          className="max-h-[50%] h-full border-b overflow-hidden"
                        >
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
                          {product?.product?.colours?.list.length > 1 &&
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
                        <div className="p-4">
                          <div className="text-center">
                            <h2 className="text-lg font-medium text-brand ">
                              {product.overview.name ||
                              product.overview.name.length > 22
                                ? product.overview.name.slice(0, 22) + "..."
                                : "No Name "}
                            </h2>
                            <p className="font-normal text-brand">
                              Code: {product.overview.code}
                            </p>
                            <h2 className="pt-2 text-xl font-semibold text-primary">
                              ${displayPrice}
                            </h2>
                          </div>

                          <div className="flex justify-between gap-1 mt-2 mb-1">
                            <p className="p-3 text-2xl rounded-sm bg-icons">
                              <CiHeart />
                            </p>
                            <div
                              onClick={() =>
                                handleViewProduct(
                                  product.meta.id,
                                  product.overview.name
                                )
                              }
                              className="flex items-center justify-center w-full gap-1 px-2 py-3 text-white rounded-sm cursor-pointer bg-primary"
                            >
                              <p className="text-xl">
                                <IoCartOutline />
                              </p>
                              <button className="text-sm uppercase">
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

export default Stationery;
