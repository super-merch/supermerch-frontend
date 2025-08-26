import TabsButtons from "@/components/Home/ProducsTabs/TabsButtons";
import AusProducts from "@/components/shop/AusProducts";
import Navigate from "@/components/shop/Navigate";
import { AppContext } from "@/context/AppContext";
import React, { useContext, useEffect } from "react";

export default function Australia() {
  
  return (
    <div>
      <Navigate />
      <AusProducts />
      <div className="mt-10">
        <TabsButtons />
      </div>
    </div>
  );
}
