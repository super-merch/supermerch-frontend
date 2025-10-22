import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import Cards from "../components/shop/Cards";
import TabsBtns from "../components/shop/ProducsTabs/TabsBtns";
import TrendCards from "@/components/shop/TrendCards";
import ArrivalCards from "@/components/shop/ArrivalCards";
import SaleCards from "@/components/shop/SaleCards";
import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
const SalesPage = () => {
  return (
    <div>
      <Breadcrumb />
      <SaleCards />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
};

export default SalesPage;
