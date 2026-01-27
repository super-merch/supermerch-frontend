import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import ShopOurBestSellers from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import CategoryGrid from "../components/shop/CategoryGrid";
import banner from "@/assets/summer.jpg";
import AustraliaMadeProducts from "@/components/shop/AustraliaMadeProducts";
const GeneralShopPage = () => {
  return (
    <div>
      {/* Category Grid */}
      <CategoryGrid />
      <img src={banner} alt="Home" className="w-full h-2/3 my-12" />

      <div className="mt-10 bg-primary/10 py-10">
        <ShopOurBestSellers />
      </div>
    </div>
  );
};

const AustraliaMade = ({ category, general }) => {
  return (
    <div className="bg-gray-100">
      {general ? (
        <GeneralShopPage />
      ) : (
        <div>
          <Breadcrumb />
          <AustraliaMadeProducts category={category} />
          <div className="mt-10 bg-primary/10 py-10">
            <ShopOurBestSellers />
          </div>
        </div>
      )}
    </div>
  );
};

export default AustraliaMade;
