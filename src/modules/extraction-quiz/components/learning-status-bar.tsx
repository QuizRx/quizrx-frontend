"use client";

import { cn } from "@/core/lib/utils";
import { getModeLabel } from "../data/learning-modes";
import type { LearningExperience } from "../types";

type LearningStatusBarProps = {
  topicLabel: string | null;
  experience: LearningExperience | null;
  className?: string;
};

// Compact orientation only. Mode and topic are changed from the persistent
// bottom controls — this row does not offer a second "Change" action.
export function LearningStatusBar({
  topicLabel,
  experience,
  className,
}: LearningStatusBarProps) {
  const modeLabel = getModeLabel(experience);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm",
        className
      )}
    >
      <span className="font-semibold text-[var(--primary)]">
        {modeLabel ?? "QuizRx"}
      </span>
      {topicLabel && (
        <>
          <span className="text-zinc-300">·</span>
          <span className="truncate text-zinc-600">{topicLabel}</span>
        </>
      )}
    </div>
  );
}
