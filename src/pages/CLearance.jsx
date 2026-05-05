import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import Cards from "../components/shop/Cards";
import ShopOurBestSellers from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import SeoHelmet from "../components/Common/SeoHelmet";

const ClearancePage = () => {
  return (
    <div className="bg-gray-100">
      <SeoHelmet
        entityType="category"
        entityId="clearance"
        fallback={{
          title: "Clearance - SuperMerch Australia",
          description:
            "Shop clearance promotional products with limited-time discounts.",
        }}
      />
      <Breadcrumb />
      <Cards category="clearance" />
      <div className="mt-10 bg-primary/10 py-10">
        <ShopOurBestSellers />
      </div>
    </div>
  );
};

export default ClearancePage;
