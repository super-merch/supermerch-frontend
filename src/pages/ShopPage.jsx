import React from "react";
import Breadcrumb from "../components/shared/Breadcrumb";
import Cards from "../components/shop/Cards";
import ShopOurBestSellers from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import CategoryGrid from "../components/shop/CategoryGrid";
import banner from "../../public/BANNER/summer.jpg";
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

const ShopPage = ({ category, general }) => {
  return (
    <div className="bg-gray-100">
      {general ? (
        <GeneralShopPage />
      ) : (
        <div>
          <Breadcrumb />
          <Cards category={category} />
          <div className="mt-10 bg-primary/10 py-10">
            <ShopOurBestSellers />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
