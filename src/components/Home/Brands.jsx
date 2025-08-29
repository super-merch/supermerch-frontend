import React from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const Brands = () => {
  const slide = [
    { id: 1, img: "/brands/brand.png" },
    { id: 2, img: "/brands/brand6.jpg" },
    { id: 3, img: "/brands/brand11.jpg" },
    { id: 4, img: "/brands/brand13.jpg" },
    { id: 5, img: "/brands/brand10.svg" },
    { id: 6, img: "/brands/brand2.jpg" },
    { id: 7, img: "/brands/brand3.jpg" },
    { id: 8, img: "/brands/brand12.jpg" },
    { id: 9, img: "/brands/brand5.jpg" },
    { id: 10, img: "/brands/brand8.jpg" },
    { id: 11, img: "/brands/brand9.jpg" },
    { id: 12, img: "/brands/brand7.jpg" },
  ];

  return (
    <div className="Mycontainer relative lg:pt-32 md:pt-24 sm:pt-10 pt-4">
      <h1 className="text-brand text-center text-3xl pb-6 font-bold">
        Australia's most loved brands
      </h1>

      {/* Prev button (always visible) */}
      <div className="absolute flex justify-between w-full h-32 md:h-36 lg:h-40 items-center" >
        <div className="absolute lg:-left-8 md:-left-6 -left-4 top-1/2 transform -translate-y-1/2 z-20">
          <button className="custom-prev2 bg-smallHeader text-white  p-2 rounded-full shadow-md">
            <IoArrowBackOutline className="lg:text-2xl md:text-2xl text-lg" />
          </button>
        </div>

        {/* Next button (always visible) */}
        <div className="absolute lg:-right-8 md:-right-6 -right-4 top-1/2 transform -translate-y-1/2 z-20">
          <button className="custom-next2 bg-smallHeader text-white  p-2 rounded-full shadow-md">
            <IoMdArrowForward className="lg:text-2xl md:text-2xl text-lg" />
          </button>
        </div>
      </div>

      <Swiper
        navigation={{
          prevEl: ".custom-prev2",
          nextEl: ".custom-next2",
        }}
        modules={[Navigation]}
        className="mySwiper"
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 },
          480: { slidesPerView: 2, spaceBetween: 12 },
          640: { slidesPerView: 3, spaceBetween: 14 },
          1024: { slidesPerView: 4, spaceBetween: 18 }, // 4 logos at a time on desktop
        }}
      >
        {slide.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="w-full h-32 md:h-36 lg:h-40 flex items-center justify-center bg-line px-3 py-3">
              <img
                src={item.img}
                alt={`brand-${item.id}`}
                className="max-h-full max-w-full object-contain"
                draggable="false"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Brands;
