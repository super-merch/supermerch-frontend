import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import ProducPage from "./ProducPage";
import ClothingHeadwearProductPage from "./ClothingHeadwearProductPage";
import { AppContext } from "@/context/AppContext";
import { ProductsContext } from "@/context/ProductsContext";
import { getCategoryMetaForNavGroup } from "@/utils/categoryMeta";
import { ProductPrefetchContext } from "@/context/ProductPrefetchContext";
import LoadingOverlay from "@/components/Common/LoadingOverlay";

const CLOTHING_HEADWEAR_NAV_GROUPS = new Set(["clothing", "headwear"]);
const normalizeNavGroup = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return CLOTHING_HEADWEAR_NAV_GROUPS.has(normalized) ? normalized : null;
};

const ProductPageResolver = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { backendUrl } = useContext(AppContext);
  const { v1categories, fetchV1Categories } = useContext(ProductsContext);
  const [singleProduct, setSingleProduct] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const decodeRefId = (value) => {
    if (!value) return null;
    try {
      return atob(value);
    } catch {
      return null;
    }
  };

  const encodedRef = searchParams.get("ref");
  const decodedRefId = decodeRefId(encodedRef);
  const stateProductId = location.state?.productId;
  const resolvedIdentifier = decodedRefId
    ? String(decodedRefId)
    : stateProductId
      ? String(stateProductId)
      : id
        ? String(id)
        : null;

  const browseNavGroup =
    normalizeNavGroup(location.state?.browseNavGroup) ||
    normalizeNavGroup(searchParams.get("type"));

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!resolvedIdentifier) {
        if (!ignore) setIsChecking(false);
        return;
      }
      if (!ignore) setIsChecking(true);
      try {
        const categoriesPromise = fetchV1Categories?.() ?? Promise.resolve();

        const productPromise = axios.get(
          `${backendUrl}/api/single-product/${encodeURIComponent(resolvedIdentifier)}`,
        );

        const [, productRes] = await Promise.all([categoriesPromise, productPromise]);
        if (!ignore) {
          setSingleProduct(productRes?.data?.data ?? null);
        }
      } catch {
        if (!ignore) setSingleProduct(null);
      } finally {
        if (!ignore) setIsChecking(false);
      }
    };

    run();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchV1Categories intentionally omitted (unstable ref from context)
  }, [resolvedIdentifier, backendUrl]);

  const isClothingOrHeadwear = useMemo(() => {
    // 1) Prefer product-derived navGroup when available.
    const categoryGroupId =
      singleProduct?.product?.categorisation?.promodata_product_type?.type_group_id ||
      "";
    if (categoryGroupId && Array.isArray(v1categories) && v1categories.length > 0) {
      const categoryMeta = getCategoryMetaForNavGroup(categoryGroupId, v1categories);
      const navGroup = String(categoryMeta?.navGroup || "").toLowerCase().trim();
      if (navGroup) {
        return CLOTHING_HEADWEAR_NAV_GROUPS.has(navGroup);
      }
    }

    // 2) Fallback to navigation hint only when product metadata cannot classify.
    if (browseNavGroup && CLOTHING_HEADWEAR_NAV_GROUPS.has(browseNavGroup)) {
      return true;
    }

    return false;
  }, [singleProduct, v1categories, browseNavGroup]);

  // Must run before any conditional return — same hook order every render (Rules of Hooks).
  const prefetchValue = useMemo(
    () =>
      singleProduct != null ? { data: singleProduct, fetchKey: String(resolvedIdentifier) } : null,
    [singleProduct, resolvedIdentifier],
  );

  if (isChecking) {
    return (
      <LoadingOverlay
        title="Loading product"
        subtitle="Checking category and loading product details…"
        variant="product"
        showBrand={true}
      />
    );
  }

  return isClothingOrHeadwear ? (
    <ProductPrefetchContext.Provider value={prefetchValue}>
      <ClothingHeadwearProductPage />
    </ProductPrefetchContext.Provider>
  ) : (
    <ProducPage />
  );
};

export default ProductPageResolver;
