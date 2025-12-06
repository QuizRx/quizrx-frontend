import { Skeleton } from "@/core/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto px-4 py-6 bg-transparent flex flex-col h-[90vh]">
      {/* Page Title Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Exam Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-xl" />
        ))}
      </div>

      {/* Exam Counter Skeleton */}
      <div className="flex justify-center mt-8">
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>

      {/* Section Title Skeleton */}
      <div className="text-center my-6">
        <Skeleton className="h-8 w-64 mx-auto" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <Skeleton key={rowIndex} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

