import React, { useState } from "react";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import noimage from "/noimage.png";
import { getProductPrice, slugify } from "@/utils/utils";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import { Clock, Flag } from "lucide-react";
import Tooltip from "@/components/Common/Tooltip";

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
  let unDiscountedPrice;
  if (discountPct > 0) {
    unDiscountedPrice =
      getProductPrice(product, product.meta.id) / (1 - discountPct / 100);
  }
  return (
    <div
      onMouseEnter={() => setCardHover(product.meta.id)}
      onMouseLeave={() => setCardHover(null)}
    >
      <Link
        to={`/product/${encodeURIComponent(slug)}?ref=${encodedId}`}
        className="text-center"
      >
        <div className="bg-white relative border border-border2 hover:border-1 transition-all duration-200 hover:border-primary  max-h-[320px] sm:max-h-[400px] h-full group rounded-lg">
          <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 pointer-events-none">
            {(productionIds?.has(productId) ||
              productionIds?.has(String(productId))) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                <Clock />
                <span>24Hr Production</span>
              </span>
            )}

            {(australiaIds?.has(productId) ||
              australiaIds?.has(String(productId))) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-white/90 text-yellow-800 text-xs font-semibold border border-yellow-200 shadow-sm">
                <Flag />
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
                <IoIosHeart className="text-lg text-primary" />
              ) : (
                <CiHeart className="text-lg text-gray-700 hover:text-primary transition-colors" />
              )}
            </div>
          </div>

          <div className="max-h-[160px] sm:max-h-[280px] h-full border-b overflow-hidden relative">
            <img
              src={
                product?.overview?.hero_image
                  ? product.overview.hero_image
                  : noimage
              }
              alt=""
              className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-110"
            />
            {discountPct > 0 && (
              <div className="absolute bottom-2  right-1 sm:right-2 z-20">
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

          <div className="p-2 relative">
            <Tooltip
              content={
                product.overview.name.length > 30 ? product.overview.name : ""
              }
              placement="top"
            >
              <p
                className={`text-sm transition-all duration-300 truncate w-full max-w-[250px] md:max-w-[300px] mx-auto ${
                  cardHover === product.meta.id &&
                  product.overview.name.length > 20
                    ? "sm:text-[18px]"
                    : "sm:text-lg"
                } font-semibold text-brand sm:leading-[18px] lg:leading-[20px]`}
              >
                {product.overview.name}
              </p>
            </Tooltip>

            <p className="text-xs text-gray-500">Min Qty: {minQty} </p>

            <div className="">
              <h2 className="text-xs sm:text-base font-bold text-primary">
                Starting From{" "}
                {discountPct > 0 ? (
                  <>
                    <span className="text-xs sm:text-sm text-red-500 line-through mr-2">
                      ${unDiscountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      ${getProductPrice(product, product.meta.id).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-primary">
                    ${getProductPrice(product, product.meta.id).toFixed(2)}
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
