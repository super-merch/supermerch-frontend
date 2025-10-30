import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { Clock } from "lucide-react";
import { Flag } from "lucide-react";
import { addToFavourite } from "../../redux/slices/favouriteSlice";
import Tooltip from "./Tooltip";
import noimage from "/noimage.png";

const ProductCard = ({
  product,
  productionIds = new Set(),
  australiaIds = new Set(),
  favSet = new Set(),
  getProductPrice,
  backgroundColor,
  //   discountPct = 0,
  //   unDiscountedPrice = 0,
  //   isGlobalDiscount = false,
  onViewProduct,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const discountPct = product.discountInfo?.discount || 0;
  const isGlobalDiscount = product.discountInfo?.isGlobal || false;
  let unDiscountedPrice;
  if (discountPct > 0) {
    unDiscountedPrice =
      getProductPrice(product, product.meta.id) / (1 - discountPct / 100);
  }
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    dispatch(addToFavourite(product));
    toast.success("Product added to favourites");
  };

  const handleCardClick = () => {
    if (onViewProduct) {
      onViewProduct(product.meta.id, product.overview.name);
    } else {
      // Default navigation if no callback provided
      const slug = product.overview.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const encodedId = btoa(product.meta.id.toString());
      navigate(`/product/${slug}?ref=${encodedId}`);
    }
  };

  const productId = product?.meta?.id;
  const slug = product.overview.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const encodedId = btoa(product.meta.id.toString());

  // Extract unique colors
  const uniqueColors =
    product?.product?.colours?.list?.length > 1
      ? [
          ...new Set(
            product?.product?.colours?.list
              .flatMap((colorObj) => colorObj.colours)
              .filter((color) => !color.includes(" "))
          ),
        ]
      : [];

  return (
    <div
      key={productId}
      className="w-full relative border border-primary rounded-lg hover:border-1 cursor-pointer transition-all duration-200 h-full group hover:rounded-lg hover:shadow-md"
      onClick={handleCardClick}
    >
      {/* Badges - Top Left */}
      <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
        {(productionIds.has(product?.meta?.id) ||
          productionIds.has(String(product?.meta?.id))) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
            <Clock className="w-3 h-3" />
            <span>24Hr Production</span>
          </span>
        )}

        {(australiaIds.has(product?.meta?.id) ||
          australiaIds.has(String(product?.meta?.id))) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
            <Flag className="w-3 h-3" />
            <span>Australia Made</span>
          </span>
        )}
      </div>

      {/* Favorite Button - Top Right */}
      <div className="absolute top-2 right-2 z-20">
        <div
          onClick={handleFavoriteClick}
          className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
        >
          {favSet.has(product?.meta?.id) ? (
            <IoIosHeart className="text-lg text-primary" />
          ) : (
            <CiHeart className="text-lg text-gray-700 hover:text-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Product Image */}
      <div className="max-h-[160px] sm:max-h-[280px] h-full border-b overflow-hidden relative">
        <img
          src={product?.overview?.hero_image || noimage}
          alt={product?.overview?.name || "Product"}
          className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-95"
        />

        {/* Discount Badge */}
        {discountPct > 0 && (
          <div className="absolute bottom-2 right-1 sm:right-2 z-20">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-primary rounded-full">
              {discountPct}% OFF
            </span>
            {isGlobalDiscount && (
              <span className="block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-orange-500 rounded mt-1">
                Sale
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <Link to={`/product/${slug}?ref=${encodedId}`}>
        <div className="p-2 py-1">
          {/* Color Swatches */}
          <div className="flex justify-center mb-1 gap-1 z-10">
            {uniqueColors.slice(0, 12).map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: backgroundColor
                    ? backgroundColor(color)
                    : color,
                }}
                className="w-4 h-4 rounded-full border border-slate-900"
              />
            ))}
          </div>

          {/* Product Info */}
          <div className="relative flex justify-center items-center text-center">
            <div className="flex-1 justify-center w-[300px]">
              <Tooltip
                content={
                  product.overview.name.length > 25 ? product.overview.name : ""
                }
                placement="top"
              >
                <p className="text-sm sm:text-lg transition-all duration-300 mx-auto text font-semibold text-brand text-wrap md:text-nowrap truncate md:w-[300px] w-full">
                  {product.overview.name}
                </p>
              </Tooltip>

              {/* Minimum Quantity */}
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Min Qty:{" "}
                {product.product?.prices?.price_groups[0]?.base_price
                  ?.price_breaks[0]?.qty || 1}
              </p>

              {/* Pricing */}
              <div>
                <h2 className="text-xs sm:text-base font-bold text-primary">
                  Starting From{" "}
                  {discountPct > 0 ? (
                    <>
                      <span className="text-xs sm:text-sm text-red-500 line-through mr-2">
                        ${unDiscountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        $
                        {getProductPrice
                          ? getProductPrice(product, product.meta.id).toFixed(2)
                          : "0.00"}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      $
                      {getProductPrice
                        ? getProductPrice(product, product.meta.id).toFixed(2)
                        : "0.00"}
                    </span>
                  )}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
