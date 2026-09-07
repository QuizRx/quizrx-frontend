"use client";

import { Check } from "lucide-react";
import { cn } from "@/core/lib/utils";
import {
  LEARNING_MODES,
  type LearningModeMeta,
} from "../data/learning-modes";
import { useExtractionQuizStore } from "../store/extraction-quiz-store";

// Experience chooser. Question modes sit together near the top; Tutor can be
// rendered separately next to the chat box with a one- or two-item `modes` list.
export function ModeSelectionCards({
  disabled = false,
  className,
  modes = LEARNING_MODES,
}: {
  disabled?: boolean;
  className?: string;
  modes?: readonly LearningModeMeta[];
}) {
  const experience = useExtractionQuizStore((s) => s.experience);
  const setExperience = useExtractionQuizStore((s) => s.setExperience);
  const columns =
    modes.length === 1
      ? "grid-cols-1"
      : modes.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";

  return (
    <div
      role="radiogroup"
      aria-label="Choose a learning mode"
      className={cn("grid gap-3", columns, className)}
    >
      {modes.map((mode) => {
        const active = experience === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => setExperience(mode.value)}
            className={cn(
              "group relative flex flex-col rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
              active
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                : "border-zinc-200 bg-white hover:border-[var(--primary)]/50",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--primary)]">
                {mode.label}
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-zinc-300 text-transparent"
                )}
              >
                <Check className="h-3 w-3" />
              </span>
            </div>
            {mode.badge && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                {mode.badge}
              </span>
            )}
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              {mode.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
