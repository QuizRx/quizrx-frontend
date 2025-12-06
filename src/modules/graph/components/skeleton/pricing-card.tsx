import { Skeleton } from "@/core/components/ui/skeleton";
import React from "react";

const PricingCardSkeleton = () => {
  const featureCount = 5;

  return (
    <div className="w-80 p-6 bg-white rounded-3xl shadow-lg flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 rounded-lg w-32" />
        <Skeleton className="h-6 rounded-lg w-40" />
        <Skeleton className="h-4 rounded-lg w-28" />
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(featureCount)].map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 rounded-lg w-full" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Skeleton className="w-full h-8 rounded-lg" />
        <Skeleton className="w-full h-8 rounded-lg" />
      </div>
    </div>
  );
};

export default PricingCardSkeleton;
