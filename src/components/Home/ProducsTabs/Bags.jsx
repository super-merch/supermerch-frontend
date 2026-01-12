import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { slugify } from "@/utils/utils";
import { useContext, useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductsContext } from "../../../context/ProductsContext";
import noimage from "/noimage.png";
import SkeletonLoading from "./SkeletonLoading";
import ProductCard from "./ProductCard";

const Bags = ({ activeTab }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const {
    marginAdd,
    marginApi,
    fetchProductsCategory,
    productsCategoryLoading,
    productsCategory,
  } = useContext(ProductsContext);
  
  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  const dispatch = useDispatch();

  // Fetch products when tab opens
  useEffect(() => {
    if (activeTab === "Bags" && productsCategory?.length === 0) {
      fetchProductsCategory("bag", 1, "", 8);
    }
  }, [activeTab]);

  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
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
      {activeTab === "Bags" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-5 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {productsCategoryLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonLoading index={index} />
                ))
              : productsCategory
                  ?.slice(0, 8)
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
                      <ProductCard
                        key={productId}
                        product={product}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        discountPct={discountPct}
                        isGlobalDiscount={isGlobalDiscount}
                        favSet={favSet}
                        isHovered={cardHover === product.meta.id}
                        onClickView={() =>
                          handleViewProduct(
                            product.meta.id,
                            product.overview.name
                          )
                        }
                        onAddFavourite={() => {
                          dispatch(addToFavourite(product));
                          toast.success("Product added to favourites");
                        }}
                        onMouseEnter={() => setCardHover(product.meta.id)}
                        onMouseLeave={() => setCardHover(null)}
                      />
                    );
                  })}
          </div>
        </div>
      )}
    </>
  );
};

export default Bags;
