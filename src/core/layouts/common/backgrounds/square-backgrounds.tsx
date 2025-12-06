"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/core/lib/utils";
interface TilesProps {
  className?: string;
  rows?: number;
  cols?: number;
  tileClassName?: string;
  tileSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  fadeType?:
    | "none"
    | "circle"
    | "ellipse-vertical"
    | "ellipse-horizontal"
    | "top"
    | "bottom"
    | "border-fade";
}

const tileSizes = {
  sm: "w-8 h-8",
  md: "w-9 h-9 md:w-12 md:h-12",
  lg: "w-12 h-12 md:w-16 md:h-16",
  xl: "w-16 h-16 lg:w-20 lg:h-20",
  "2xl": "w-20 h-20 lg:w-24 lg:h-24",
  "3xl": "w-24 h-24 lg:w-28 lg:h-28",
  "4xl": "w-28 h-28 lg:w-32 lg:h-32",
  "5xl": "w-32 h-32 lg:w-36 lg:h-36",
};

const fadePatterns = {
  none: "",
  circle:
    "[mask-image:radial-gradient(circle_at_center,black_60%,rgba(0,0,0,0.1)_85%,transparent_95%)]",
  "ellipse-vertical":
    "[mask-image:radial-gradient(ellipse_at_center,black_50%,rgba(0,0,0,0.1)_75%,transparent_85%)]",
  "ellipse-horizontal":
    "[mask-image:radial-gradient(ellipse_at_center,black_65%,rgba(0,0,0,0.1)_85%,transparent_95%)] [mask-size:400%_100%]",
  top: "[mask-image:linear-gradient(to_bottom,transparent,rgba(0,0,0,0.1)_40%,black_70%)]",
  bottom:
    "[mask-image:linear-gradient(to_top,transparent,rgba(0,0,0,0.1)_40%,black_70%)]",
  "border-fade":
    "bg-gradient-to-b from-transparent via-white/10 to-transparent",
};

export function Tiles({
  className,
  rows = 100,
  cols = 10,
  tileClassName,
  tileSize = "md",
  fadeType = "none",
}: TilesProps) {
  const rowsArray = new Array(rows).fill(1);
  const colsArray = new Array(cols).fill(1);

  return (
    <div
      className={cn(
        "absolute z-[-1] flex w-full h-full justify-center",
        fadePatterns[fadeType],
        className
      )}
    >
      {rowsArray.map((_, i) => (
        <motion.div
          key={`row-${i}`}
          className={cn(
            tileSizes[tileSize],
            "border-l dark:border-neutral-900 border-neutral-200 relative",
            tileClassName
          )}
        >
          {colsArray.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: `var(--tile)`,
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`col-${j}`}
              className={cn(
                tileSizes[tileSize],
                fadeType === "border-fade"
                  ? "border-r border-t border-white/[0.02]"
                  : "border-r border-t dark:border-neutral-900 border-neutral-100",
                tileClassName
              )}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}
