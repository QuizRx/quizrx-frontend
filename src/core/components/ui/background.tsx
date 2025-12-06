import { cn } from "@/core/lib/utils";
import * as React from "react";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  children?: React.ReactNode;
}

const Background = ({
  className,
  image,
  children,
  ...props
}: BackgroundProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-[90vh] rounded-3xl -z-10 flex flex-col items-center justify-center",
        className
      )}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      {...props}
    >
      <div className="z-[100] w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export { Background };