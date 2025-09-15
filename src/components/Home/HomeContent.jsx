import React from "react";
import HeroWithHotDeals from "./HeroWithHotDeals";
import Brands from "./Brands";
import TabsCategory from "./TabsCategory";
import TabsButtons from "./ProducsTabs/TabsButtons";
import Blogs from "./Blogs";
import LetsConnect from "./LetsConnect";
import GoogleReviews from "./GoogleReviews";
import BannerSection from "./BannerSection";
import { Heading } from "../Common";

const HomeContent = () => {
  return (
    <>
      <HeroWithHotDeals />

      {/* Australia's most loved brands - moved above Shop by Category */}
      <div className="pt-2 pb-12 mt-2" style={{ backgroundColor: "#E8F4FD" }}>
        <Brands />
      </div>

      {/* Banner Section - 2 banners side by side */}
      <BannerSection />

      {/* SHOP OUR BEST SELLERS - moved above Shop by Category */}
      <div className="py-4">
        <TabsButtons />
      </div>

      {/* Shop by Category Section */}
      <div className="py-4">
        <TabsCategory />
      </div>

      {/* Our Popular Blogs - moved after banner */}
      <div className="pt-2 pb-4">
        <Blogs />
      </div>

      {/* Easy Ways to Order - blank section for now */}
      <div className="py-4">
        <div className="Mycontainer">
          <Heading title="EASY WAYS TO ORDER" align="center" size="default" titleClassName="uppercase" containerClassName="mb-8" />
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
            <span className="text-lg text-gray-500">Content will be added here later</span>
          </div>
        </div>
      </div>

      {/* Let's Connect - Instagram Posts */}
      <div className="pt-2 pb-4">
        <LetsConnect />
      </div>

      {/* Google Reviews */}
      <div className="pt-2 pb-4">
        <GoogleReviews />
      </div>
    </>
  );
};

export default HomeContent;
