import { cn } from "@/core/lib/utils";

interface SpinnerLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SpinnerLoader({ size = "md", className }: SpinnerLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-solid border-current border-r-transparent align-[-0.125em] animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        className
      )}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

export function InfinityLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative w-16 h-16">
        {/* Infinity symbol using pure CSS - animate with Tailwind */}
        <svg
          className="w-full h-full animate-spin"
          style={{ animationDuration: "2s" }}
          viewBox="0 0 100 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 25,25 C 25,15 15,15 15,25 C 15,35 25,35 35,25 C 45,15 55,15 65,25 C 75,35 85,35 85,25 C 85,15 75,15 75,25"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-gray-800"
          />
        </svg>
      </div>
    </div>
  );
}
