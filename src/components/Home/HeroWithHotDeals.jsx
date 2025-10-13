import { useState } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import HotDeals from "./HotDeals";
import ImageCarousel from "./ImageCarousel";
import HelpMePickModal from "./HelpMePickModal";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

import { Autoplay, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";

const HeroWithHotDeals = () => {
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Note: PUBLIC_URL resolves to your /public folder at runtime
  const slider = [
    {
      id: 1,
      span: "THE BEST PLACE Australia made products",
      title: "20% OFF +FREE SHIPPING",
      description:
        "Rep your brand in style with custom hats, caps, and beanies.",
      buttonText: "Shop Now",
      // slide 1: use your existing Tailwind utility class
      bgClass: "bg-custom-bg",
    },
    {
      id: 2,
      span: "THE BEST PLACE Australia made products",
      title: "Get Your Customized Merch Today",
      description: "Personalize your clothing with logos, designs, and colors.",
      buttonText: "Explore Now",
      // slide 2: image in public/pgHome.jpg
      imageUrl: `/pgHome.jpg`,
    },
    {
      id: 3,
      span: "THE BEST PLACE Australia made products",
      title: "Special Discount on Bulk Orders",
      description: "Perfect for businesses, events, and giveaways.",
      buttonText: "Learn More",
      // slide 3: image in public/phHome1.jpg
      imageUrl: `/pgHome1.jpg`,
    },
  ];

  return (
    <div className="mt-8">
      <style jsx>{`
        .mySwiper .swiper-slide {
          opacity: 0 !important;
          transition: opacity 0.8s ease-in-out !important;
          transform: scale(1.05);
        }
        .mySwiper .swiper-slide-active {
          opacity: 1 !important;
          transform: scale(1);
        }
        .mySwiper .swiper-slide-prev {
          opacity: 0.3 !important;
          transform: scale(0.95);
        }
        .mySwiper .swiper-slide-next {
          opacity: 0.3 !important;
          transform: scale(0.95);
        }
        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      {/* Main Hero Section with Slider and Hot Deals */}
      <div className="Mycontainer">
        <div className="flex flex-col xl:flex-row gap-4 ">
          {/* Image Slider - 75% width */}
          <div className="w-full xl:w-3/4 h-64 sm:h-96 md:h-96 relative">
            {/* Navigation Arrow - Right Only */}
            <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10">
              <button className="swiper-button-next-custom p-2 sm:p-3 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <Swiper
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".swiper-button-next-custom",
              }}
              loop={true}
              modules={[Autoplay, Navigation]}
              className="mySwiper rounded-lg overflow-hidden h-full"
            >
              {slider.map((slide) => {
                // decide inline style only if imageUrl is present
                const style = slide.imageUrl
                  ? { backgroundImage: `url(${slide.imageUrl})` }
                  : {};

                return (
                  <SwiperSlide key={slide.id}>
                    <div
                      // apply either bgClass or nothing, plus common cover/center sizing
                      className={`${
                        slide.bgClass ?? ""
                      } bg-cover bg-center w-full h-full flex justify-start items-end`}
                      style={style}
                    >
                      <div className="pt-4 pb-4 sm:pt-6 sm:pb-6 text-line px-4 sm:px-6 xl:pt-12 md:pt-12 xl:pb-12 md:pb-12 mt-auto">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="w-4 sm:w-5 bg-line h-[2px]" />
                          <h3 className="uppercase">{slide.span}</h3>
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl xl:text-4xl max-w-[280px] sm:max-w-[350px] md:max-w-[400px] pt-2 sm:pt-3 text-heading leading-tight">
                          {slide.title}
                        </h2>
                        <p className="text-sm sm:text-base max-w-[250px] sm:max-w-[300px] pt-2 sm:pt-3 font-normal text-line leading-relaxed">
                          {slide.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                          <div
                            onClick={() => navigate("/shop")}
                            className="flex items-center justify-center w-full sm:w-40 gap-2 font-bold text-white cursor-pointer bg-heading h-11 sm:h-12 rounded-lg min-h-[44px] transition-all duration-300 hover:bg-heading/90"
                          >
                            <button className="text-sm sm:text-base">
                              {slide.buttonText}
                            </button>
                            <IoMdArrowForward className="text-sm sm:text-base" />
                          </div>
                          <div
                            onClick={() => setIsHelpModalOpen(true)}
                            className="flex items-center justify-center w-full sm:w-40 font-bold text-heading cursor-pointer border-2 border-heading h-11 sm:h-12 rounded-lg hover:bg-heading hover:text-white transition-all duration-300 min-h-[44px]"
                          >
                            <button className="text-sm sm:text-base">
                              Help me Pick
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Hot Deals Section - 25% width */}
          <div className="w-full xl:w-1/4 h-auto md:h-full">
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
