"use client";

import { cn } from "@/core/lib/utils";
import { zoomUpAnimation } from "@/core/utils/animations/motion";
import { cva } from "class-variance-authority";
import { motion } from "motion/react";
import * as React from "react";

const logoVariants = cva(
  "flex  items-center gap-2 max-w-40  px-2"
);

interface ProjectLogo extends React.ComponentProps<"div"> {
  size?: number;
  includeText?: boolean;
  textClassName?: string;
}

const ProjectLogo = React.forwardRef<HTMLDivElement, ProjectLogo>(
  ({ className, size = 35, includeText, textClassName, ...props }, ref) => (
    <div ref={ref} className={cn(logoVariants(), className)} {...props}>
      <motion.img
        variants={zoomUpAnimation}
        src="/logo/light-log.svg"
        alt="Logo"
        width={size}
        height={size}
      />
      {includeText && (
        <motion.div
          variants={zoomUpAnimation}
          className={cn("font-semibold text-sm text-foreground", textClassName)}
        >
          QuizRX
        </motion.div>
      )}
    </div>
  )
);
ProjectLogo.displayName = "ProjectLogo";

export { ProjectLogo };
