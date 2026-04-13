import React from "react";
import Skeleton from "react-loading-skeleton";

const SkeletonLoading = ({ index }) => {
  return (
    <div
      key={index}
      className="relative p-2 sm:p-4 border rounded-lg shadow-md border-border2 bg-white"
    >
      <Skeleton height={100} className="sm:h-[200px] rounded-md" />
      <div className="p-2 sm:p-4">
        <Skeleton
          height={16}
          width={100}
          className="sm:h-5 sm:w-[120px] rounded"
        />
        <Skeleton
          height={12}
          width={60}
          className="mt-2 sm:h-[15px] sm:w-20 rounded"
        />
        <Skeleton
          height={20}
          width={80}
          className="mt-3 sm:h-[25px] sm:w-[100px] rounded"
        />
        <Skeleton
          height={12}
          width={50}
          className="mt-2 sm:h-[15px] sm:w-[60px] rounded"
        />
        <div className="flex items-center justify-between pt-2">
          <Skeleton height={16} width={60} className="sm:h-5 sm:w-20 rounded" />
          <Skeleton height={16} width={60} className="sm:h-5 sm:w-20 rounded" />
        </div>
        <div className="flex justify-between gap-1 mt-4 sm:mt-6 mb-2">
          <Skeleton circle height={32} width={32} className="sm:h-10 sm:w-10" />
          <Skeleton
            height={32}
            width={80}
            className="sm:h-10 sm:w-[120px] rounded"
          />
          <Skeleton circle height={32} width={32} className="sm:h-10 sm:w-10" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
