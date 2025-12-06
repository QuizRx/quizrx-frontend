"use client";

import { cn } from "@/core/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children?: React.ReactNode;
}

/**
 * @name Shine Border
 * @description It is an animated background border effect component with easy to use and configurable props.
 * @param borderRadius defines the radius of the border.
 * @param borderWidth defines the width of the border.
 * @param duration defines the animation duration to be applied on the shining border
 * @param color a string or string array to define border color.
 * @param className defines the class name to be applied to the component
 * @param children contains react node elements.
 */
export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative min-h-[60px] w-fit min-w-[300px] place-items-center rounded-[--border-radius] p-1 bg-background border",
        `rounded-[${borderWidth}px]`,
        className
      )}
    >
      <div
        className={`before:bg-shine-size pointer-events-none before:absolute before:inset-0 before:rounded-[${borderRadius}px] before:p-[${borderWidth}px] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:bg-[length:300%_300%] before:bg-[${
          color instanceof Array ? color.join(" ") : color
        }] before:mask-[linear-gradient(#fff_0_0)] motion-safe:before:animate-shine`}
      ></div>
      {children}
    </div>
  );
}
