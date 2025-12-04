import { useState } from "react";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import HotDeals from "./HotDeals";
import ImageCarousel from "./TrendingCarousel";
import HelpMePickModal from "./HelpMePickModal";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

import { Autoplay, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const HeroWithHotDeals = () => {
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Note: PUBLIC_URL resolves to your /public folder at runtime
  const slider = [
    {
      id: 1,
      span: "Premium Australian Made Products",
      title: "Get 15% Off Your First Order",
      description:
        "Discover our collection of premium promotional products made right here in Australia. Quality you can trust, delivered fast.",
      buttonText: "Shop Now",
      bgClass: "bg-custom-bg",
      url: "/shop",
    },
    {
      id: 2,
      span: "Custom Branded Merchandise",
      title: "Bring Your Brand to Life",
      description:
        "Create memorable experiences with our custom printing and embroidery services. Perfect for businesses, events, and teams.",
      buttonText: "Contact Us",
      imageUrl: `/pgHome.jpg`,
      url: "/contact",
    },
    {
      id: 3,
      span: "Bulk Orders & Corporate Solutions",
      title: "Special Pricing for Volume Orders",
      description:
        "Scale your promotional campaigns with our competitive bulk pricing. Ideal for corporate events, conferences, and marketing campaigns.",
      buttonText: "Contact Us",
      imageUrl: `/pgHome1.jpg`,
      url: "/contact",
    },
  ];

  return (
    <div className="mt-8">
      <style jsx>{`
        .swiper-pagination-bullet-active {
          background: #3b82f6 !important;
          transform: scale(1.2);
        }
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }
      `}</style>
      {/* Main Hero Section with Slider and Hot Deals */}
      <div className="Mycontainer lg:h-[55vh] h-full">
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          {/* Image Slider - 75% width */}
          <div className="w-full xl:w-3/4 h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-2xl">
            {/* Navigation Arrows */}
            <div className="absolute md:left-4 -left-2 top-1/2 transform -translate-y-1/2 z-20">
              <button className="swiper-button-prev-custom md:w-12 md:h-12 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <FaChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute md:right-4 -right-2 top-1/2 transform -translate-y-1/2 z-20">
              <button className="swiper-button-next-custom md:w-12 md:h-12 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
              <div className="swiper-pagination-custom flex gap-2"></div>
            </div>

            <Swiper
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              pagination={{
                el: ".swiper-pagination-custom",
                clickable: true,
                renderBullet: function (index, className) {
                  return `<span class="${className} w-3 h-3 bg-white/50 rounded-full transition-all duration-300 cursor-pointer"></span>`;
                },
              }}
              loop={true}
              modules={[Autoplay, Navigation]}
              className="mySwiper h-full"
            >
              {slider.map((slide) => {
                // decide inline style only if imageUrl is present
                const style = slide.imageUrl
                  ? { backgroundImage: `url(${slide.imageUrl})` }
                  : {};

                return (
                  <SwiperSlide key={slide.id}>
                    <div
                      className={`${
                        slide.bgClass ?? ""
                      } bg-cover bg-center w-full h-full flex justify-start items-end relative`}
                      style={style}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary/70 via-black/30 to-transparent"></div>

                      {/* Content */}
                      <div className="relative z-10 pt-8 pb-8 px-6 sm:px-8 lg:px-12 xl:px-16 mt-auto max-w-2xl">
                        {/* Category Badge */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-1 bg-primary rounded-full"></div>
                          <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                            {slide.span}
                          </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                          {slide.title}
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 max-w-lg">
                          {slide.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate(slide.url)}
                            className="rounded-lg"
                          >
                            {slide.buttonText}
                            <FaArrowRight className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="white"
                            size="lg"
                            onClick={() => setIsHelpModalOpen(true)}
                            className="rounded-lg"
                          >
                            Help me Pick
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Hot Deals Section - 25% width */}
          <div className="w-full xl:w-1/4 h-full">
            <HotDeals />
          </div>
        </div>
      </div>

      {/* Help Me Pick Modal */}
      <HelpMePickModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default HeroWithHotDeals;
