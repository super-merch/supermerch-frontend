import banner from "../../../public/BANNER/summer.jpg";
import BannerSection from "./BannerSection";
import Blogs from "./Blogs";
import Brands from "./Brands";
import GoogleReviewsComponent from "./GoogleReviews";
import HeroWithHotDeals from "./HeroWithHotDeals";
import HowItWorks from "./HowItWorks";
import LetsConnect from "./LetsConnect";
import TabsCategory from "./TabsCategory";
import TrendingCarousel from "./TrendingCarousel";

const HomeContent = () => {
  return (
    <div className="flex flex-col">
      <HeroWithHotDeals />
      {/* Trending Products Section */}
      <div className="mt-8">
        <TrendingCarousel />
      </div>

      {/* Australia's most loved brands - moved above Shop by Category */}
      <div className="py-10">
        <Brands />
      </div>

      {/* Banner Section - 2 banners side by side */}
      <BannerSection />

      {/* Top selling categories */}
      <TabsCategory />

      <img src={banner} alt="Home" className="w-full h-2/3" />
      {/* SHOP OUR BEST SELLERS - moved above Shop by Category */}
      {/* <div className="my-4">
        <ShopOurBestSellers />
      </div> */}

      {/* Our Popular Blogs - moved after banner */}
      <div className="my-8">
        <Blogs />
      </div>

      {/* Let's Connect - Instagram Posts */}
      <LetsConnect />

      {/* Google Reviews */}
      <GoogleReviewsComponent />
      <HowItWorks />
    </div>
  );
};

export default HomeContent;
