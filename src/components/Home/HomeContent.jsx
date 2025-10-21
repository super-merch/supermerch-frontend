import React from "react";
import HeroWithHotDeals from "./HeroWithHotDeals";
import Brands from "./Brands";
import TabsCategory from "./TabsCategory";
import TabsButtons from "./ProducsTabs/TabsButtons";
import Blogs from "./Blogs";
import LetsConnect from "./LetsConnect";
import GoogleReviewsComponent from "./GoogleReviews";
import BannerSection from "./BannerSection";
import { Heading } from "../Common";
import ImageCarousel from "./TrendingCarousel";
import HowItWorks from "./HowItWorks";

const HomeContent = () => {
  return (
    <div className="flex flex-col gap-4">
      <HeroWithHotDeals />
      {/* Trending Products Section */}
      <div className="mt-8">
        <ImageCarousel />
      </div>

      {/* Australia's most loved brands - moved above Shop by Category */}
      <div className="" style={{ backgroundColor: "#ffffff" }}>
        <Brands />
      </div>

      {/* Banner Section - 2 banners side by side */}
      <BannerSection />

      {/* SHOP OUR BEST SELLERS - moved above Shop by Category */}

      <TabsButtons />

      {/* Shop by Category Section */}
      <div className="py-4">
        <TabsCategory />
      </div>

      {/* Our Popular Blogs - moved after banner */}
      <div className="pt-2 pb-4">
        <Blogs />
      </div>

      {/* Let's Connect - Instagram Posts */}
      <div className="pt-2 pb-4">
        <LetsConnect />
      </div>

      {/* Google Reviews */}
      <div className="pt-2 pb-4">
        <GoogleReviewsComponent />
      </div>
      <HowItWorks />
    </div>
  );
};

export default HomeContent;
