import React from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";

const AboutSliders = () => {
  // Categories data with suitable images
  const categories = [
    {
      id: 1,
      name: "Writing",
      image: "/write.jfif",
      url: "Spromotional?categoryName=Writing&category=N",
    },
    {
      id: 2,
      name: "Workwear",
      image: "/workwear.jfif",
      url: "/Spromotional?categoryName=Workwear&category=B-18&label=Top",
    },
    {
      id: 3,
      name: "Corporate Wear",
      image: "/corpShirt.jpg",
      url: "Spromotional?categoryName=Corporate%20Wear&category=B-13&label=Top",
    },

    {
      id: 4,
      name: "Headwear",
      image: "/cap.png",
      url: "/Spromotional?categoryName=Headwear&category=G",
    },
    {
      id: 5,
      name: "Drinkware",
      image: "/drinkwear.webp",
      url: "Spromotional?categoryName=Drinkware&category=C",
    },
    {
      id: 6,
      name: "Bags",
      image: "/bags.jfif",
      url: "Spromotional?categoryName=Bags&category=A",
    },
    {
      id: 7,
      name: "Pens",
      image: "/pens.jpg",
      url: "Spromotional?categoryName=Writing&category=N-07&label=Pens",
    },
    {
      id: 8,
      name: "Pants",
      image: "/pants.jfif",
      url: "Spromotional?categoryName=Corporate%20Wear&category=B-08&label=Pants",
    },
    {
      id: 9,
      name: "Polo-shirts",
      image: "/pshirts.avif",
      url: "Spromotional?categoryName=Corporate%20Wear&category=B-09&label=Top",
    },
    {
      id: 10,
      name: "T-shirts",
      image: "/tshirts.jfif",
      url: "/Spromotional?categoryName=Corporate%20Wear&category=B-18&label=Top",
    },
    {
      id: 11,
      name: "Food",
      image: "/choco.jpg",
      url: "Spromotional?categoryName=Food&category=E",
    },
    {
      id: 12,
      name: "Games",
      image: "/games.jfif",
      url: "Spromotional?categoryName=Games&category=F",
    },
  ];
  const navigate = useNavigate();
  const handleCategoryClick = (categoryName, url) => {
    // Empty function for now - you can implement your logic here
    navigate(url);
  };

  return (
    <div className="relative Mycontainer">
      <div className="absolute lg:-left-6 md:-left-6 -left-3 top-[38%] z-10">
        <button className="p-1 text-white rounded-full custom-prev bg-smallHeader lg:p-2 md:p-2">
          <IoArrowBackOutline className="text-lg lg:text-2xl md:text-2xl" />
        </button>
      </div>
      <div className="absolute lg:-right-6 md:-right-6 -right-3 top-[38%] z-10">
        <button className="p-1 text-white rounded-full custom-next bg-smallHeader lg:p-2 md:p-2">
          <IoMdArrowForward className="text-lg lg:text-2xl md:text-2xl" />
        </button>
      </div>

      <Swiper
        navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
        modules={[Navigation]}
        className="mySwiper"
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 15 },
          400: { slidesPerView: 2, spaceBetween: 15 },
          580: { slidesPerView: 3, spaceBetween: 10 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 6, spaceBetween: 10 },
        }}
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <div onClick={() => handleCategoryClick(category.name, category.url)} className="w-full h-full cursor-pointer group">
              <div className="w-full h-full m-auto text-center border rounded bg-line lg:min-h-48 xl:min-h-64 md:min-h-48 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="relative h-32 lg:h-40 xl:h-48 md:h-40 overflow-hidden">
                  <img
                    src={category.image}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    alt={`${category.name} Category`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div className="p-3 bg-white">
                  <h3 className="text-lg font-semibold md:text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  {/* <p className='text-xs md:text-sm text-gray-500 mt-1'>
                    Explore {category.name.toLowerCase()}
                  </p> */}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AboutSliders;
