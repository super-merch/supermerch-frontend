import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import ProductNavigate from "../components/product/ProductNavigate";
import ProductDetails from "@/components/product/ProductDetails/index";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const ProducPage = ({ product }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div>
      <ProductNavigate product={product} />
      <ProductDetails product={product} />
      {/* <DescripTabs/> */}
      <div className="">
        <TabsButtons />
      </div>
    </div>
  );
};

ProducPage.propTypes = {
  product: PropTypes.object,
};

export default ProducPage;
