import React, { useState,useEffect } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromFavourite } from "../redux/slices/favouriteSlice";

const FavouritePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  console.log(favouriteItems, "favouriteItems");

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
    dispatch(removeFromFavourite(product));
  };

  return (
    <div className="mt-10">
      <div className=" Mycontainer">
        <h2 className="mb-5 text-2xl font-semibold text-center">Favourites</h2>
        <div className="grid gap-5 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
          {favouriteItems
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

              // Get an array of prices from priceBreaks
              const prices = priceBreaks
                .map((breakItem) => breakItem.price)
                .filter((price) => price !== undefined);

              // Calculate the minimum and maximum price values
              const minPrice = prices.length > 0 ? Math.min(...prices) : "0";
              const maxPrice = prices.length > 0 ? Math.max(...prices) : "0";
              return (
                <div
                  key={product.id}
                  // onClick={() => handleViewProduct(product.meta.id)}
                  className="relative border border-border2 cursor-pointer max-h-[350px] h-full group"
                >
                  <div className="max-h-[50%] h-full border-b overflow-hidden">
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
                  <div className="absolute top-[2%] left-[5%] grid grid-cols-2 gap-1">
                    {product?.product?.colours?.list.length > 0 &&
                      product?.product?.colours?.list?.map(
                        (colorObj, index) => (
                          <p key={index}>
                            {colorObj.colours.map((color, subIndex) => {
                              return (
                                <p
                                  key={`${index}-${subIndex}`}
                                  style={{
                                    backgroundColor:
                                      colorObj.swatch?.[subIndex] ||
                                      color.toLowerCase(),
                                  }} // Convert to lowercase
                                  className={`w-fit px-2 rounded-sm text-xs py-1.5 border-[1px] border-slate-900`}
                                />
                              );
                            })}
                          </p>
                        )
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
                      <h2 className="pt-2 text-xl font-semibold text-heading">
                        $
                        {minPrice === maxPrice ? (
                          <span>{minPrice.toFixed(2)}</span>
                        ) : (
                          <span>
                            {minPrice.toFixed(2)}. - ${maxPrice.toFixed(2)}
                          </span>
                        )}
                      </h2>
                    </div>
                    <div className="flex justify-between gap-1 mt-2 mb-1">
                      <p onClick={() => handleRemoveFavourite(product)} className="p-3 text-2xl rounded-sm bg-icons">
                        <CiHeart className="text-red-500" />
                      </p>
                      <div className="flex items-center justify-center w-full gap-1 px-2 py-3 text-white rounded-sm cursor-pointer bg-smallHeader">
                        <p
                          className="text-xl"
                        >
                          <IoCartOutline />
                        </p>
                        <button
                          onClick={() => handleViewProduct(product.meta.id)}
                          className="text-sm uppercase"
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
