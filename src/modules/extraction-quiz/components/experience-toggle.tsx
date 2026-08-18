"use client";

import { cn } from "@/core/lib/utils";
import { LEARNING_MODES } from "../data/learning-modes";
import { useExtractionQuizStore } from "../store/extraction-quiz-store";

// Compact experience switch used once a mode is already selected (Final
// Handoff §7). "QuizRx Reasoning" serves curated MCQs; "Practice Studio" serves
// short-answer questions. The choice is sent as the explicit learning mode on
// every learning-action request and persists in the store. When no mode is
// selected yet, neither pill is highlighted.
export function ExperienceToggle({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const experience = useExtractionQuizStore((s) => s.experience);
  const setExperience = useExtractionQuizStore((s) => s.setExperience);

  return (
    <div
      role="radiogroup"
      aria-label="Learning experience"
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white p-0.5",
        className
      )}
    >
      {LEARNING_MODES.map((opt) => {
        const active = experience === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => setExperience(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
              active
                ? "bg-[var(--primary)] text-white"
                : "text-zinc-600 hover:text-[var(--primary)]",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
