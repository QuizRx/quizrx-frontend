import { Skeleton } from "@/core/components/ui/skeleton";

const MySubscriptionPlanSkeleton = () => {
  return (
    <div className="p-6 rounded-xl bg-white shadow-sm w-full max-w-sm flex flex-col gap-2 ">
      {/* Plan Label */}
      <Skeleton className="h-4 w-24" />
      {/* Plan Name */}
      <Skeleton className="h-8 w-16" />
      {/* Credits */}
      <Skeleton className="h-4 w-32" />
      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full" />
      {/* Upgrade Button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
};

export default MySubscriptionPlanSkeleton;
