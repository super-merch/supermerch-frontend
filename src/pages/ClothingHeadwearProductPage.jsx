import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import ProductNavigate from "../components/product/ProductNavigate";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProductPrefetch } from "@/context/ProductPrefetchContext";
import ClothingHeadwearWorkwearPdp from "./ClothingHeadwearWorkwearPdp";

const ClothingHeadwearProductPage = () => {
  const prefetch = useProductPrefetch();
  const product = prefetch?.data ?? null;
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <ProductNavigate product={product} />
      <ClothingHeadwearWorkwearPdp />
      <div className="">
        <TabsButtons />
      </div>
    </>
  );
};

export default ClothingHeadwearProductPage;
