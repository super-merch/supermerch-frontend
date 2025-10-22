import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import Cards from "../components/shop/Cards";
import TabsBtns from "../components/shop/ProducsTabs/TabsBtns";
import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
const ShopPage = ({ category }) => {
  return (
    <div>
      <Breadcrumb />
      <Cards category={category} />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
};

export default ShopPage;
