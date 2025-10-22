import React from "react";
import Navigate from "../components/shop/Navigate";
import Cards from "../components/shop/Cards";
import TabsBtns from "../components/shop/ProducsTabs/TabsBtns";
import TrendCards from "@/components/shop/TrendCards";
import ArrivalCards from "@/components/shop/ArrivalCards";
import SaleCards from "@/components/shop/SaleCards";
import BestSellerCards from "@/components/shop/BestSellerCards";
import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
const BestSellerPage = () => {
  return (
    <div>
      <BestSellerCards />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
};

export default BestSellerPage;
