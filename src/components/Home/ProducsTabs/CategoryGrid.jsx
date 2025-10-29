import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../../context/AppContext";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { slugify } from "@/utils/utils";
import SkeletonLoading from "./SkeletonLoading";
import ProductCard from "./ProductCard";

const tabToCategory = {
  Clothing: "dress",
  Headwear: "headwear",
  Bags: "bag",
  Stationery: "Stationery",
};

const CategoryGrid = ({ activeTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    marginApi,
    productionIds,
    australiaIds,
    // fetchers and state from context
    fetchProducts,
    products,
    fetchProductsCategory,
    productsCategory,
  } = useContext(AppContext);

  const [productsLocal, setProductsLocal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardHover, setCardHover] = useState(null);

  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const favSet = useMemo(() => {
    const s = new Set();
    favouriteItems?.forEach((item) => s.add(item.meta?.id));
    return s;
  }, [favouriteItems]);

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId);
    const _slug = slugify(name);
    navigate(`/product/${encodeURIComponent(_slug)}?ref=${encodedId}`);
  };
  let ignore = false;

  const fetchForTab = async () => {
    if (!activeTab) return;
    setError(null);
    setLoading(true);
    try {
      if (activeTab === "All Product") {
        await fetchProducts(1, "", 4);
      } else {
        const cat = tabToCategory[activeTab];

        await fetchProductsCategory(cat, 1, "", 4);
      }
    } catch (e) {
      if (!ignore) setError(e?.message || "Error fetching products");
    } finally {
      if (!ignore) setLoading(false);
    }
  };

  useEffect(() => {
    fetchForTab();
  }, [activeTab]);

  const finalProducts =
    activeTab === "All Product" ? products : productsCategory;

  // Fetch logic per tab (via AppContext)
  // useEffect(() => {
  //   if (finalProducts.length === 0) {
  //     fetchForTab();
  //   }
  //   return () => {
  //     ignore = true;
  //   };
  // }, [activeTab]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const renderGrid = (list) => {
    return list
      ?.filter((product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        return priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined;
      })
      .map((product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice = priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        const prices = priceBreaks
          .map((breakItem) => breakItem.price)
          .filter((price) => price !== undefined);
        let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const productId = product.meta.id;
        const marginEntry = marginApi[productId] || {};
        const marginFlat =
          typeof marginEntry.marginFlat === "number"
            ? marginEntry.marginFlat
            : 0;
        minPrice += marginFlat;
        maxPrice += marginFlat;
        const discountPct = product.discountInfo?.discount || 0;
        const isGlobalDiscount = product.discountInfo?.isGlobal || false;

        return (
          <ProductCard
            key={productId}
            product={product}
            minPrice={minPrice}
            maxPrice={maxPrice}
            discountPct={discountPct}
            isGlobalDiscount={isGlobalDiscount}
            productionIds={productionIds}
            australiaIds={australiaIds}
            favSet={favSet}
            isHovered={cardHover === product.meta.id}
            onClickView={() =>
              handleViewProduct(product.meta.id, product.overview.name)
            }
            onAddFavourite={() => {
              dispatch(addToFavourite(product));
              toast.success("Product added to favourites");
            }}
            onMouseEnter={() => setCardHover(product.meta.id)}
            onMouseLeave={() => setCardHover(null)}
          />
        );
      });
  };

  return (
    <div className="pb-10 Mycontainer">
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
        {loading
          ? Array.from({ length: activeTab === "All Product" ? 8 : 8 }).map(
              (_, index) => <SkeletonLoading key={index} />
            )
          : renderGrid(
              activeTab === "All Product"
                ? finalProducts?.slice(0, 4)
                : finalProducts
            )}
      </div>
    </div>
  );
};

export default CategoryGrid;
