import React, { useContext, useEffect } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import AboutSliders from "./AboutSliders"; // Import AboutSliders component

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";


import { Pagination, Autoplay } from "swiper/modules";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  //  const { fetchProducts, products, error } = useContext(AppContext);
   const navigate = useNavigate();

  //  useEffect(() => {
  //    fetchProducts();
  //  }, []);
  const slider = [
    {
      id: 1,
      span: "THE BEST PLACE Australia made products",
      title: "20% OFF +FREE SHIPPING",
      description:
        "Rep your brand in style with custom hats, caps, and beanies.",
      buttonText: "Shop Now",
      backgroundImage: "bg-custom-bg",
    },
    {
      id: 2,
      span: "THE BEST PLACE Australia made products",
      title: "Get Your Customized Merch Today",
      description: "Personalize your clothing with logos, designs, and colors.",
      buttonText: "Explore Now",
      backgroundImage: "bg-custom-bg",
    },
    {
      id: 3,
      span: "THE BEST PLACE Australia made products",
      title: "Special Discount on Bulk Orders",
      description: "Perfect for businesses, events, and giveaways.",
      buttonText: "Learn More",
      backgroundImage: "bg-custom-bg",
    },
  ];

  return (
    <div className="relative">
      {/* Hero Swiper */}
      <Swiper
        pagination={{
          dynamicBullets: true,
          el: ".custom-pagination",
          clickable: true,
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
      >
        {slider.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`${slide.backgroundImage} bg-cover bg-center w-full`}
            >
              <div className="pt-8 pb-10 text-line Mycontainer lg:pt-20 md:pt-20 sm:pb-20 lg:pb-40 md:pb-40">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 bg-line h-[2px]"></span>
                  <h3 className="uppercase">{slide.span}</h3>
                </div>
                <h2 className="lg:text-5xl md:text-5xl text-3xl max-w-[500px] pt-3 text-heading">
                  {slide.title}
                </h2>
                <p className="text-lg max-w-[350px] pt-5 font-normal text-line">
                  {slide.description}
                </p>
                <div onClick={() => navigate("/shop")} className="flex items-center justify-center w-48 gap-2 mt-6 font-bold text-white cursor-pointer bg-heading h-14">
                  <button >{slide.buttonText}</button>
                  <IoMdArrowForward />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* <div className=" custom-pagination mt-5 space-x-2 absolute bottom-[29%] left-14 z-10"></div> */}
      <div className="lg:absolute md:absolute top-[80%] lg:mt-0 md:mt-0 mt-12 right-0 left-0">
        <AboutSliders />
      </div>
    </div>
  );
};

export default Hero;
