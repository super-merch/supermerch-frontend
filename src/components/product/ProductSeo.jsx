import { useMemo } from "react";
import PropTypes from "prop-types";
import { useLocation, useParams } from "react-router-dom";
import SeoHelmet from "@/components/Common/SeoHelmet";
import { buildProductSeo } from "@/utils/productSeo";

const ProductSeo = ({ product }) => {
  const { id: slug } = useParams();
  const { pathname } = useLocation();
  const seo = useMemo(
    () => buildProductSeo({ data: product, pathname, slug }),
    [product, pathname, slug],
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
