import { InfinityLoader } from "@/core/components/ui/spinner-loader";

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <InfinityLoader />
    </div>
  );
}
