import React, { useRef } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { Heading } from "../Common";

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
    <div className="Mycontainer relative">
      <style jsx>{`
        .scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Heading
        title="AUSTRALIA'S MOST LOVED BRANDS"
        align="center"
        size="default"
        titleClassName="uppercase"
        containerClassName="pb-4 !pt-0"
      />

      {/* Navigation buttons */}
      <div className="absolute flex justify-between w-full h-32 md:h-36 xl:h-40 items-center pointer-events-none">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto"
        >
          <IoArrowBackOutline className="text-lg" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto"
        >
          <IoMdArrowForward className="text-lg" />
        </button>
      </div>

      {/* Scrollable container */}
      <motion.div
        ref={containerRef}
        className="flex overflow-x-scroll w-[90%] mx-auto scroll-smooth gap-4 scroll-container"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slide.map((item, index) => (
          <motion.div
            key={item.id}
            ref={index === 0 ? itemRef : null} // measure only first item
            // add negative margin on first / last items so they peek out of the container
            className={`min-w-[50%] xs:min-w-[45%] sm:min-w-[40%] md:min-w-[25%] xl:min-w-[15%] flex-shrink-0
      ${index === 0 ? "-ml-6" : ""} ${
              index === slide.length - 1 ? "-mr-6 md:-mr-8" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="w-full h-32 sm:h-28 md:h-32 lg:h-36 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-2">
              <img
                src={item.img}
                alt={`brand-${item.id}`}
                className="max-h-full max-w-full object-contain transition-all duration-300"
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
