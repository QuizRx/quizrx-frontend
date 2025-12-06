import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/core/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl border-[0.5px] border-zinc-200 bg-card p-5 text-card-foreground  shadow-primary/10 shadow-md transition-all ease-linear duration-300",
      className,
      selected ? "border-primary shadow text-primary" : "",
      "hover:ring-1 hover:ring-primary"
    )}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
