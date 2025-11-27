import {
  findNearestColor,
  getProductPrice,
  is24HrProduct,
  isProductCategory,
} from "@/utils/utils";
import { Clock, Flag } from "lucide-react";
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addToFavourite,
  removeFromFavourite,
} from "../../redux/slices/favouriteSlice";
import Tooltip from "./Tooltip";
import noimage from "/noimage.png";
import ausFlag from "@/assets/aus_flag.png";

const ProductCard = ({ product, favSet = new Set(), onViewProduct }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const discountPct = product.discountInfo?.discount || 0;
  const isGlobalDiscount = product.discountInfo?.isGlobal || false;
  let unDiscountedPrice;
  if (discountPct > 0) {
    unDiscountedPrice =
      getProductPrice(product, product.meta.id) / (1 - discountPct / 100);
  }
  const handleRemoveFavourite = (product) => {
    toast.success("Product removed from favourites");
    dispatch(removeFromFavourite(product));
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (favouriteItems?.some((item) => item.meta.id === product?.meta?.id)) {
      handleRemoveFavourite(product);
    } else {
      dispatch(addToFavourite(product));
      toast.success("Product added to favourites");
    }
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
  const productPrice =
    product?.product?.prices?.price_groups[0]?.base_price?.price_breaks[0]
      ?.price;

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
  const is24Hr = is24HrProduct(product);
  const isAUMade = product?.product?.categorisation?.promodata_attributes?.some(
    (item) => item === "Local Factors: Made In Australia"
  );
  const isClothing = isProductCategory(product, "Clothing");
  return (
    <div
      key={productId}
      className="w-full h-full relative border border-gray-300 rounded-lg cursor-pointer transition-all duration-200 flex flex-col group hover:border-primary hover:shadow-xl bg-white overflow-hidden shadow-lg"
      onClick={handleCardClick}
    >
      {/* Badges - Top Left */}
      <div
        className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 z-20 flex flex-col gap-1 pointer-events-none"
        style={{ maxWidth: "calc(100% - 50px)" }}
      >
        {is24Hr && (
          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-[9px] sm:text-[10px] md:text-xs font-semibold border border-green-200 shadow-sm overflow-hidden">
            <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 flex-shrink-0" />
            <span className="truncate max-w-[40px] sm:max-w-none">24Hr</span>
          </span>
        )}

        {isAUMade && (
          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-full bg-yellow-100 text-yellow-800 text-[9px] sm:text-[10px] md:text-xs font-semibold border border-yellow-200 shadow-sm overflow-hidden bg-sky-100">
            <img
              src={ausFlag}
              alt="AU Flag"
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 flex-shrink-0"
            />
            <span className="truncate max-w-[50px] sm:max-w-none">AU Made</span>
          </span>
        )}
      </div>

      {/* Favorite Button - Top Right */}
      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20">
        <div
          onClick={handleFavoriteClick}
          className="p-1.5 sm:p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-100 flex-shrink-0"
        >
          {favouriteItems?.some(
            (item) => item.meta.id === product?.meta?.id
          ) ? (
            <IoIosHeart className="text-sm sm:text-base md:text-lg text-primary" />
          ) : (
            <CiHeart className="text-sm sm:text-base md:text-lg text-gray-700 hover:text-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Product Image */}
      <div
        className="w-full border-b border-gray-100 overflow-hidden relative flex items-center justify-center flex-shrink-0"
        style={{ height: "200px", minHeight: "200px", maxHeight: "200px" }}
      >
        <img
          src={product?.overview?.hero_image || noimage}
          alt={product?.overview?.name || "Product"}
          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
          }}
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPct > 0 && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-20 flex flex-col gap-1">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold text-white bg-primary rounded-full whitespace-nowrap">
              {discountPct}% OFF
            </span>
            {isGlobalDiscount && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold text-white bg-orange-500 rounded-full whitespace-nowrap">
                Sale
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden min-h-0">
        <Link
          to={`/product/${slug}?ref=${encodedId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex flex-col min-w-0 w-full h-full"
        >
          {/* Color Swatches */}
          {uniqueColors.length > 0 && (
            <div className="flex justify-center items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 flex-wrap overflow-hidden">
              {uniqueColors.slice(0, 6).map((color, index) => {
                const matchedColor = findNearestColor(color);
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: matchedColor?.hex || "#ccc",
                    }}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                    title={color}
                  />
                );
              })}
              {uniqueColors.length > 6 && (
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">
                  +{uniqueColors.length - 6} more
                </span>
              )}
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 sm:gap-1 min-w-0 w-full px-1 overflow-hidden">
            {/* Product Name */}
            <Tooltip
              content={
                product.overview.name.length > 20 ? product.overview.name : ""
              }
              placement="top"
              wrapperClassName="block w-full"
            >
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 w-full overflow-hidden whitespace-nowrap text-ellipsis">
                {product.overview.name}
              </h3>
            </Tooltip>

            {/* Minimum Quantity */}
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 whitespace-nowrap flex-shrink-0">
              Min Qty:{" "}
              {product.product?.prices?.price_groups[0]?.base_price
                ?.price_breaks[0]?.qty || 1}
            </p>

            {/* Pricing */}
            <div className="w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-shrink-0">
              {productPrice == 0 ? (
                <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                  Contact Us
                </p>
              ) : (
                <div className="w-full flex items-center justify-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">
                    Starting From
                  </p>
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                    {discountPct > 0 && (
                      <span className="text-[10px] sm:text-xs text-red-500 line-through whitespace-nowrap">
                        ${unDiscountedPrice?.toFixed(2) || "0.00"}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                      $
                      {getProductPrice
                        ? getProductPrice(product, product.meta.id,isClothing).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
