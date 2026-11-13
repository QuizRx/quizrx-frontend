"use client";

import { Copy, MessageCircle, Network, type LucideIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { LEARNING_MODES } from "../data/learning-modes";
import { useExtractionQuizStore } from "../store/extraction-quiz-store";
import type { LearningExperience } from "../types";

const MODE_ICONS: Record<LearningExperience, LucideIcon> = {
  tutor: MessageCircle,
  practice_studio: Copy,
  reasoning: Network,
};

// The single, always-visible mode control. Switching only changes the view;
// each mode keeps its own conversation, topic session, or question position.
export function ModeSwitcher({ className }: { className?: string }) {
  const experience = useExtractionQuizStore((s) => s.experience);
  const pending = useExtractionQuizStore((s) => s.pending);
  const setExperience = useExtractionQuizStore((s) => s.setExperience);

  return (
    <nav
      aria-label="Learning mode"
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-full border border-[var(--border)] bg-white/90 p-1 shadow-sm backdrop-blur",
        className
      )}
    >
      {LEARNING_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode.value];
        const active = experience === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            aria-pressed={active}
            onClick={() => setExperience(mode.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 sm:px-4",
              active
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-zinc-600 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="sm:hidden">{mode.shortLabel}</span>
            <span className="hidden sm:inline">{mode.label}</span>
            {pending[mode.value] && !active && (
              <span
                aria-label="Working"
                className="absolute right-1.5 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
