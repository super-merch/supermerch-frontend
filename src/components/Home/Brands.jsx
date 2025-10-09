import React, { useRef } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const Brands = () => {
  const containerRef = useRef(null);
  const itemRef = useRef(null);

  const slide = [
    { id: 1, img: "/brands/brand.png" },
    { id: 2, img: "/brands/brand6.jpg" },
    { id: 3, img: "/brands/brand11.jpg" },
    { id: 4, img: "/brands/brand13.jpg" },
    { id: 5, img: "/brands/brand10.svg" },
    { id: 6, img: "/brands/brand2.jpg" },
    { id: 7, img: "/brands/brand3.jpg" },
    { id: 9, img: "/brands/brand5.jpg" },
    { id: 10, img: "/brands/brand8.jpg" },
    { id: 11, img: "/brands/brand9.jpg" },
    { id: 12, img: "/brands/brand7.jpg" },
  ];

  const scroll = (direction) => {
    if (!containerRef.current || !itemRef.current) return;
    const container = containerRef.current;
    const itemWidth = itemRef.current.offsetWidth + 16; // card width + gap (16px = gap-4)
    container.scrollBy({
      left: direction === "left" ? -itemWidth : itemWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="Mycontainer relative lg:pt-32 md:pt-24 sm:pt-10 py-12">
      <h1 className="text-brand text-center text-3xl pb-6 font-bold">
        Australia's most loved brands
      </h1>

      {/* Navigation buttons */}
      <div className="absolute flex justify-between w-full h-32 md:h-36 lg:h-40 items-center">
        <div className="absolute lg:-left-8 md:-left-6 -left-4 top-1/2 transform -translate-y-1/2 z-20">
          <button
            onClick={() => scroll("left")}
            className="bg-smallHeader text-white p-2 max-sm:p-1 rounded-full shadow-md"
          >
            <IoArrowBackOutline className="lg:text-2xl md:text-2xl text-lg" />
          </button>
        </div>

        <div className="absolute lg:-right-8 md:-right-6 -right-4 top-1/2 transform -translate-y-1/2 z-20">
          <button
            onClick={() => scroll("right")}
            className="bg-smallHeader text-white p-2 max-sm:p-1 rounded-full shadow-md"
          >
            <IoMdArrowForward className="lg:text-2xl md:text-2xl text-lg" />
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <motion.div
        ref={containerRef}
        className="flex overflow-x-scroll no-scrollbar scroll-smooth gap-4"
      >
        {slide.map((item, index) => (
          <motion.div
            key={item.id}
            ref={index === 0 ? itemRef : null} // measure only first item
            className="min-w-[45%] sm:min-w-[40%] md:min-w-[25%] lg:min-w-[15%] flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="w-full h-32 md:h-36 lg:h-40 flex items-center justify-center bg-line px-3 py-3">
              <img
                src={item.img}
                alt={`brand-${item.id}`}
                className="max-h-full max-w-full object-contain"
                draggable="false"
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Brands;
