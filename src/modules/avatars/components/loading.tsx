import { cn } from "@/core/lib/utils";
import { ComponentProps } from "react";

export default function Loading(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        {...rest}
        className={cn("animate-spin rounded-full border-t-2 border-b-2 border-primary size-5", className)}
      />
    </div>
  );
}
