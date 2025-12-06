import { Skeleton } from "@/core/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto bg-transparent p-4 flex flex-col h-[90vh]">
      {/* Page Title Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search Bar Skeleton */}
      <Skeleton className="h-12 w-full max-w-xl mb-8" />

      {/* FAQ Items Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

