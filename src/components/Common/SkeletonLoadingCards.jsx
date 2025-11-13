import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoadingCards = ({ index }) => {
  return (
    <div
      key={index}
      className="w-full h-full relative border border-gray-200 rounded-lg flex flex-col bg-white overflow-hidden"
    >
      {/* Badges - Top Left (Optional) */}
      <div className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="w-[40px] h-[14px] sm:w-[45px] sm:h-4">
          <Skeleton
            height="100%"
            width="100%"
            style={{ borderRadius: "9999px" }}
          />
        </div>
      </div>

      {/* Favorite Button - Top Right (Optional) */}
      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20">
        <div className="w-6 h-6 sm:w-8 sm:h-8">
          <Skeleton circle height="100%" width="100%" />
        </div>
      </div>

      {/* Product Image */}
      <div
        className="w-full border-b border-gray-100 overflow-hidden relative flex items-center justify-center flex-shrink-0 bg-gray-50"
        style={{ height: "160px", minHeight: "160px", maxHeight: "160px" }}
      >
        <div className="w-full h-full p-2 sm:p-3">
          <Skeleton height="100%" width="100%" style={{ borderRadius: "0" }} />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col p-2 sm:p-3 overflow-hidden min-h-0">
        {/* Color Swatches (Optional) */}
        <div className="flex justify-center items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 flex-wrap overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="w-3 h-3 sm:w-3.5 sm:h-3.5">
              <Skeleton circle height="100%" width="100%" />
            </div>
          ))}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 min-w-0 w-full px-1 overflow-hidden">
          {/* Product Name - Two lines */}
          <div
            className="w-full overflow-hidden flex flex-col items-center gap-1"
            style={{
              minHeight: "2.4rem",
              maxHeight: "2.4rem",
              justifyContent: "center",
            }}
          >
            <div className="w-[85%] h-[13px] sm:h-[15px]">
              <Skeleton
                height="100%"
                width="100%"
                style={{ borderRadius: "4px" }}
              />
            </div>
            <div className="w-[75%] h-[13px] sm:h-[15px]">
              <Skeleton
                height="100%"
                width="100%"
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>

          {/* Minimum Quantity */}
          <div className="w-[55px] h-[11px] sm:w-[65px] sm:h-[13px] mt-0.5">
            <Skeleton
              height="100%"
              width="100%"
              style={{ borderRadius: "4px" }}
            />
          </div>

          {/* Pricing */}
          <div className="w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-shrink-0 mt-1">
            {/* Starting From */}
            <div className="w-[65px] h-[10px] sm:w-[75px] sm:h-3">
              <Skeleton
                height="100%"
                width="100%"
                style={{ borderRadius: "4px" }}
              />
            </div>
            {/* Price */}
            <div className="w-[45px] h-[13px] sm:w-[55px] sm:h-[15px]">
              <Skeleton
                height="100%"
                width="100%"
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoadingCards;
