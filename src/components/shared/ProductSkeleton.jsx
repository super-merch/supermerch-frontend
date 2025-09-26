import React from "react";
import Skeleton from "react-loading-skeleton";

/**
 * Reusable polished product skeleton component
 * Provides consistent loading UI across all product grids
 */
const ProductSkeleton = ({ count = 9, className = "" }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
        >
          {/* Product Image Skeleton */}
          <div className="relative">
            <Skeleton 
              height={200} 
              className="w-full rounded-t-lg" 
              baseColor="#f3f4f6" 
              highlightColor="#e5e7eb"
            />
            {/* Favorite button skeleton */}
            <div className="absolute top-2 right-2">
              <Skeleton 
                circle 
                height={40} 
                width={40} 
                baseColor="#ffffff" 
                highlightColor="#f9fafb"
              />
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="p-4">
            {/* Product Name */}
            <Skeleton 
              height={20} 
              width="85%" 
              className="mb-2" 
              baseColor="#f3f4f6" 
              highlightColor="#e5e7eb"
            />
            
            {/* Product Price */}
            <Skeleton 
              height={24} 
              width="60%" 
              className="mb-3" 
              baseColor="#f3f4f6" 
              highlightColor="#e5e7eb"
            />
            
            {/* Product Description */}
            <Skeleton 
              height={16} 
              width="90%" 
              className="mb-1" 
              baseColor="#f3f4f6" 
              highlightColor="#e5e7eb"
            />
            <Skeleton 
              height={16} 
              width="70%" 
              className="mb-4" 
              baseColor="#f3f4f6" 
              highlightColor="#e5e7eb"
            />
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Skeleton 
                height={36} 
                width={80} 
                className="rounded-md" 
                baseColor="#f3f4f6" 
                highlightColor="#e5e7eb"
              />
              <Skeleton 
                height={36} 
                width={100} 
                className="rounded-md" 
                baseColor="#f3f4f6" 
                highlightColor="#e5e7eb"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
