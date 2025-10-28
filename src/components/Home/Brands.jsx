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
    { id: 6, img: "/brands/brand2.jpg" },
    { id: 7, img: "/brands/brand3.jpg" },
    { id: 9, img: "/brands/brand5.jpg" },
    { id: 10, img: "/brands/chamb.png" },
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

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between md:mb-6 mb-0">
        <div className="gap-3 flex-1 self-center">
          <Heading
            title="Trusted by Leading Australian Brands"
            align="center"
            size="default"
            titleClassName="uppercase self-center"
            description="We proudly serve top names across Australia"
            showUnderline={true}
            containerClassName="py-0"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="md:p-2 p-1 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <IoArrowBackOutline className="md:text-lg text-base" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="md:p-2 p-1 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <IoMdArrowForward className="md:text-lg text-base" />
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <motion.div
        ref={containerRef}
        className="flex overflow-x-scroll w-full py-4 mx-auto scroll-smooth gap-4 scroll-container"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slide.map((item, index) => (
          <motion.div
            key={item.id}
            ref={index === 0 ? itemRef : null}
            className={`min-w-[33%] xs:min-w-[42%] sm:min-w-[36%] md:min-w-[24%] xl:min-w-[14%] flex-shrink-0 ${
              index === 0 ? "-ml-4" : ""
            } ${index === slide.length - 1 ? "-mr-4 md:-mr-6" : ""}`}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <div className="w-full h-28 md:h-36 lg:h-50 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 p-3">
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
