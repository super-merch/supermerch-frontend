import { IoMdArrowForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import AboutSliders from "./AboutSliders";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import { Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

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
    <div className="relative">
      <Swiper
        pagination={{
          dynamicBullets: true,
          el: ".custom-pagination",
          clickable: true,
        }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        modules={[Pagination, Autoplay]}
        // className="mySwiper"
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
                className={`${slide.bgClass ?? ""} bg-cover bg-center w-full`}
                style={style}
              >
                <div className="pt-8 pb-10 text-line Mycontainer lg:pt-20 md:pt-20 sm:pb-20 lg:pb-40 md:pb-40 max-w-4xl">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 bg-line h-[2px]" />
                    <h3 className="uppercase">{slide.span}</h3>
                  </div>
                  <h2 className="lg:text-5xl md:text-5xl text-3xl max-w-[500px] pt-3 text-primary">
                    {slide.title}
                  </h2>
                  <p className="text-lg max-w-[350px] pt-5 font-normal text-line">
                    {slide.description}
                  </p>
                  <div
                    onClick={() => navigate("/shop")}
                    className="flex items-center justify-center w-48 gap-2 mt-6 font-bold text-white cursor-pointer bg-heading h-14"
                  >
                    <button>{slide.buttonText}</button>
                    <IoMdArrowForward />
                  </div>
                  <div
                    onClick={() => navigate("/help-center")}
                    className="flex items-center justify-center w-48 gap-2 mt-4 font-bold text-white cursor-pointer bg-primary h-14"
                  >
                    <button>Help me Pick</button>
                    <IoMdArrowForward />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="lg:absolute md:absolute top-[80%] mt-12 right-0 left-0">
        <AboutSliders />
      </div>
    </div>
  );
};

export default Hero;
