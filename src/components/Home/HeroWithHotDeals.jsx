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
        <div className="flex flex-col lg:flex-row gap-4 h-auto md:h-[420px] lg:h-[500px]">
          {/* Image Slider - 75% width */}
          <div className="w-full lg:w-3/4 h-64 md:h-full relative">
            {/* Navigation Arrow - Right Only */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
              <button className="swiper-button-next-custom p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                <svg
                  className="w-6 h-6"
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
                      } bg-cover bg-center w-full h-full`}
                      style={style}
                    >
                      <div className="pt-6 pb-6 text-line px-6 lg:pt-12 md:pt-12 lg:pb-12 md:pb-12">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-5 bg-line h-[2px]" />
                          <h3 className="uppercase">{slide.span}</h3>
                        </div>
                        <h2 className="lg:text-4xl md:text-4xl text-2xl max-w-[400px] pt-3 text-heading">
                          {slide.title}
                        </h2>
                        <p className="text-base max-w-[300px] pt-3 font-normal text-line">
                          {slide.description}
                        </p>
                        <div className="flex gap-3 mt-4">
                          <div
                            onClick={() => navigate("/shop")}
                            className="flex items-center justify-center w-40 gap-2 font-bold text-white cursor-pointer bg-heading h-12 rounded-lg"
                          >
                            <button>{slide.buttonText}</button>
                            <IoMdArrowForward />
                          </div>
                          <div
                            onClick={() => setIsHelpModalOpen(true)}
                            className="flex items-center justify-center w-40 font-bold text-heading cursor-pointer border-2 border-heading h-12 rounded-lg hover:bg-heading hover:text-white transition-all duration-300"
                          >
                            <button>Help me Pick</button>
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
          <div className="w-full lg:w-1/4 h-auto md:h-full">
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
