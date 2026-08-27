"use client";

import { Check } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { LEARNING_MODES } from "../data/learning-modes";
import { useExtractionQuizStore } from "../store/extraction-quiz-store";

// Three-experience chooser (Final Handoff §6/§7). The learner explicitly picks
// a mode before the app routes learning requests — it never guesses silently.
// Presented above the topic selector and chat workspace.
export function ModeSelectionCards({
  disabled = false,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  const experience = useExtractionQuizStore((s) => s.experience);
  const setExperience = useExtractionQuizStore((s) => s.setExperience);

  return (
    <div
      role="radiogroup"
      aria-label="Choose a learning mode"
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}
    >
      {LEARNING_MODES.map((mode) => {
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
