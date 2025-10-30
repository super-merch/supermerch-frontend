import React from "react";
import Skeleton from "react-loading-skeleton";

const SkeletonLoadingCards = ({ index }) => {
  return (
    <div
      key={index}
      className="relative p-4 border rounded-lg shadow-md border-border2 md:mt-10 mt-3"
    >
      <div className="p-4">
        <Skeleton height={20} width={120} className="rounded" />
        <Skeleton height={15} width={80} className="mt-2 rounded" />
        <Skeleton height={25} width={100} className="mt-3 rounded" />
        <Skeleton height={15} width={60} className="mt-2 rounded" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton height={20} width={80} className="rounded" />
          <Skeleton height={20} width={80} className="rounded" />
        </div>
        <div className="flex justify-between gap-1 mt-6 mb-2">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={40} width={120} className="rounded" />
          <Skeleton circle height={40} width={40} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoadingCards;
