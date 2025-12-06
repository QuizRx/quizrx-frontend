"use client";

import { cn } from "@/core/lib/utils";
import React from "react";

interface DottedBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: "sm" | "md" | "lg";
  spacing?: "sm" | "md" | "lg" | "xl" | "2xl";
  fadeType?:
    | "none"
    | "radial"
    | "linear"
    | "ellipse-horizontal"
    | "ellipse-vertical";
  children?: React.ReactNode;
}

const dotSizes = {
  sm: "1px",
  md: "1.5px",
  lg: "2px",
};

const spacingSizes = {
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
};

const fadePatterns = {
  none: "",
  radial:
    "[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]",
  linear: "[mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)]",
  "ellipse-horizontal":
    "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]",
  "ellipse-vertical":
    "[mask-image:radial-gradient(ellipse_50%_80%_at_50%_50%,#000_70%,transparent_100%)]",
};

export function DottedBackground({
  className,
  dotColor = "#e5e7eb",
  dotSize = "md",
  spacing = "md",
  fadeType = "none",
  children,
}: DottedBackgroundProps) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <div
          className={cn(
            "relative h-full w-full",
            "[&>div]:absolute [&>div]:h-full [&>div]:w-full",
            fadePatterns[fadeType],
            className
          )}
        >
          <div
            style={{
              background: `radial-gradient(${dotColor} ${dotSizes[dotSize]}, transparent ${dotSizes[dotSize]})`,
              backgroundSize: `${spacingSizes[spacing]} ${spacingSizes[spacing]}`,
            }}
          />
        </div>
      </div>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
