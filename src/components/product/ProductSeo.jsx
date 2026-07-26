import { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useLocation, useParams } from "react-router-dom";
import SeoHelmet from "@/components/Common/SeoHelmet";
import { ProductsContext } from "@/context/ProductsContext";
import { buildProductSeo, getProductCategoryBreadcrumb } from "@/utils/productSeo";

const ProductSeo = ({ product }) => {
  const { id: slug } = useParams();
  const { pathname } = useLocation();
  const { v1categories } = useContext(ProductsContext) || {};
  const categoryBreadcrumb = useMemo(
    () => getProductCategoryBreadcrumb(product, v1categories),
    [product, v1categories],
  );
  const seo = useMemo(
    () => buildProductSeo({ data: product, pathname, slug, categoryBreadcrumb }),
    [product, pathname, slug, categoryBreadcrumb],
  );

  return (
    <SeoHelmet
      entityType="product"
      entityId={seo.entityId}
      fallback={seo.fallback}
      structuredData={seo.structuredData}
      forceCanonicalUrl={seo.fallback.canonicalUrl}
    />
  );
};

ProductSeo.propTypes = {
  product: PropTypes.object,
};

export default ProductSeo;
