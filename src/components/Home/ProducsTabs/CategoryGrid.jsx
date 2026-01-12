import { ProductCard } from "@/components/Common";
import { slugify } from "@/utils/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ProductsContext } from "../../../context/ProductsContext";
import SkeletonLoading from "./SkeletonLoading";

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
    fetchProducts,
    products,
    fetchProductsCategory,
    productsCategory,
  } = useContext(ProductsContext);

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
        await fetchProducts(1, "", 5);
      } else {
        const cat = tabToCategory[activeTab];

        await fetchProductsCategory(cat, 1, "", 5);
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

  // Fetch logic per tab (via ProductsContext)
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
    return list?.map((product, index) => {
      return (
        <ProductCard
          priority={index < 4}
          key={product?.meta?.id}
          product={product}
          favSet={favSet}
          onViewProduct={handleViewProduct}
        />
      );
    });
  };

  return (
    <div className="pb-10 Mycontainer">
      <div className="grid gap-3 xs:gap-2 sm:gap-5 grid-cols-2 lg:grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-2">
        {loading
          ? Array.from({ length: activeTab === "All Product" ? 5 : 5 }).map(
              (_, index) => <SkeletonLoading key={index} />
            )
          : renderGrid(
              activeTab === "All Product"
                ? finalProducts?.slice(0, 5)
                : finalProducts
            )}
      </div>
    </div>
  );
};

export default CategoryGrid;
