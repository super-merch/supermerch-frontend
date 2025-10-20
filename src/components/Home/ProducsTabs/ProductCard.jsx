import React, { useState } from "react";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import noimage from "/noimage.png";
import { slugify } from "@/utils/utils";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";

const ProductCard = ({
  product,
  minPrice,
  maxPrice,
  discountPct,
  isGlobalDiscount,
  productionIds,
  australiaIds,
  favSet,
  onClickView,
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) => {
  const productId = product?.meta?.id;
  const [cardHover, setCardHover] = useState(null);

  const name = product?.overview?.name || "No Name";
  const minQty =
    product?.product?.prices?.price_groups?.[0]?.base_price?.price_breaks?.[0]
      ?.qty || 1;
  const encodedId = btoa(product?.meta?.id); // base64 encode
  const slug = slugify(product?.overview?.name);
  const dispatch = useDispatch();
  const onAddFavourite = () => {
    dispatch(addToFavourite(product));
    toast.success("Product added to favourites");
  };

  return (
    <div
      onMouseEnter={() => setCardHover(product.meta.id)}
      onMouseLeave={() => setCardHover(null)}
    >
      <Link
        to={`/product/${encodeURIComponent(slug)}?ref=${encodedId}`}
        className="text-center"
      >
        <div className="relative border border-border2 hover:border-1 transition-all duration-200 hover:border-red-500  max-h-[320px] sm:max-h-[400px] h-full group">
          <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
            {(productionIds?.has(productId) ||
              productionIds?.has(String(productId))) && (
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

            {(australiaIds?.has(productId) ||
              australiaIds?.has(String(productId))) && (
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

          <div className="absolute top-2 right-2 z-20">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAddFavourite?.();
              }}
              className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100"
            >
              {favSet?.has(productId) ? (
                <IoIosHeart className="text-lg text-red-500" />
              ) : (
                <CiHeart className="text-lg text-gray-700 hover:text-red-500 transition-colors" />
              )}
            </div>
          </div>

          <div className="max-h-[62%] sm:max-h-[71%] h-full border-b overflow-hidden relative">
            <img
              src={
                product?.overview?.hero_image
                  ? product.overview.hero_image
                  : noimage
              }
              alt=""
              className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
            />
          </div>

          <div className="p-2 relative">
            <p
              className={`text-sm transition-all duration-300 ${
                cardHover === product.meta.id &&
                product.overview.name.length > 20
                  ? "sm:text-[18px]"
                  : "sm:text-lg"
              } font-semibold text-brand sm:leading-[18px] `}
            >
              {(product.overview.name &&
                // product.overview.name.length > 20 && cardHover!==product.meta.id
                //   ? product.overview.name.slice(0, 20) + "..."
                product.overview.name) ||
                "No Name"}
            </p>

            <p className="text-xs text-gray-500 pt-1">Min Qty: {minQty} </p>

            <div className="">
              <h2 className="text-base sm:text-lg font-bold text-heading ">
                From $
                {minPrice?.toFixed
                  ? minPrice.toFixed(2)
                  : Number(minPrice || 0).toFixed(2)}
              </h2>
            </div>
            {discountPct > 0 && (
              <div className="block absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
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
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
