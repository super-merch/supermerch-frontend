import banner from "@/assets/summer.jpg";
import Blogs from "./Blogs";
import Brands from "./Brands";
import GoogleReviewsComponent from "./GoogleReviews";
import RecentlyViewed from "./RecentlyViewed";
// Replaced by HomeHero (homepage redesign phase 1). Kept for easy revert.
// import HeroWithHotDeals from "./HeroWithHotDeals";
import HomeHero from "./HomeHero";
import HowItWorks from "./HowItWorks";
import LetsConnect from "./LetsConnect";
import PopularCategories from "./PopularCategories";
import TabsCategory from "./TabsCategory";
import TrendingCarousel from "./TrendingCarousel";
import { Link } from "react-router-dom";

const HomeContent = () => {
  return (
    <div className="flex flex-col">
      {/* <HeroWithHotDeals /> */}
      <HomeHero />
      {/* Trending Products Section */}
      <div className="mt-8">
        <TrendingCarousel />
      </div>

      {/* Google Reviews - moved up so social proof is seen early */}
      <GoogleReviewsComponent />

      {/* Australia's most loved brands - moved above Shop by Category */}
      <div className="py-10">
        <Brands />
      </div>

      {/* Popular product categories */}
      <PopularCategories />

      {/* Top selling categories */}
      <TabsCategory />

      {/* <Link to="/promotional?categoryName=Headwear&category=PK-03&subCategory=Brim+%26+Bucket+Hats&type=Headwear&page=1"> <img src={banner} alt="Home" className="w-full h-2/3" /> </Link> */}
      {/* SHOP OUR BEST SELLERS - moved above Shop by Category */}
      {/* <div className="my-4">
        <ShopOurBestSellers />
      </div> */}

      {/* Our Popular Blogs - moved after banner */}
      <div className="my-8">
        <Blogs />
      </div>

      {/* Let's Connect - Instagram Posts (hidden) */}
      {/* <LetsConnect /> */}

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Google Reviews - moved up, directly after TrendingCarousel */}
      {/* <GoogleReviewsComponent /> */}
      {/* <HowItWorks /> */}
    </div>
  );
};

export default HomeContent;
