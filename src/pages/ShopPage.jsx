import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import Cards from "../components/shop/Cards";
import TabsBtns from "../components/shop/ProducsTabs/TabsBtns";
import TabsButtons from "@/components/Home/ProducsTabs/TabsButtons";
const ShopPage = () => {
  return (
    <div>
      <Breadcrumb />
      <Cards />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
};

export default ShopPage;
