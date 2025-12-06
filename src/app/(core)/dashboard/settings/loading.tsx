import { Skeleton } from "@/core/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container px-4 py-8 flex flex-col h-[90vh]">
      {/* Title Skeleton */}
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />

      {/* Tabs Skeleton */}
      <div className="mt-6">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-6 max-w-2xl">
          {/* Profile Image Section */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Form Fields */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Button */}
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

