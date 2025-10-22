import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import AusProducts from "@/components/shop/AusProducts";
import HourProduction24Products from "@/components/shop/HourProduction24Products";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { AppContext } from "@/context/AppContext";
import React, { useContext, useEffect } from "react";

export default function HourProduction24() {
  return (
    <div>
      <Breadcrumb />
      <HourProduction24Products />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
}
