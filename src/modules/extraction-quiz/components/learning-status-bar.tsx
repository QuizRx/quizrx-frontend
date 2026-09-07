"use client";

import { cn } from "@/core/lib/utils";
import {
  getModeLabel,
  isConversationalMode,
  isQuestionMode,
} from "../data/learning-modes";
import type { LearningExperience } from "../types";
import type { QuestionExperience } from "../data/learning-modes";

type LearningStatusBarProps = {
  topicLabel: string | null;
  experience: LearningExperience | null;
  lastQuestionExperience: QuestionExperience | null;
  onReturnToQuestion?: () => void;
  onNextQuestion?: () => void;
  onStartQuestion?: () => void;
  canStart?: boolean;
  canNext?: boolean;
  isBusy?: boolean;
  className?: string;
};

// Persistent "where am I / how do I go back / what's next" strip. Shown on
// every page state so the learner never needs the browser Back button.
export function LearningStatusBar({
  topicLabel,
  experience,
  lastQuestionExperience,
  onReturnToQuestion,
  onNextQuestion,
  onStartQuestion,
  canStart = false,
  canNext = false,
  isBusy = false,
  className,
}: LearningStatusBarProps) {
  const modeLabel = getModeLabel(experience);
  const returnLabel = lastQuestionExperience
    ? getModeLabel(lastQuestionExperience)
    : null;
  const showReturn =
    isConversationalMode(experience) &&
    Boolean(returnLabel) &&
    Boolean(onReturnToQuestion);
  const startLabel =
    experience === "practice_studio" ? "Start Practice" : "Start a question";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-white/90 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-zinc-600">
        <span>
          <span className="text-zinc-400">Topic</span>{" "}
          <span className="font-medium text-[var(--primary)]">
            {topicLabel ?? "None selected"}
          </span>
        </span>
        <span className="hidden text-zinc-300 sm:inline">·</span>
        <span>
          <span className="text-zinc-400">Experience</span>{" "}
          <span className="font-medium text-[var(--primary)]">
            {modeLabel ?? "Not chosen yet"}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showReturn && (
          <button
            type="button"
            onClick={onReturnToQuestion}
            disabled={isBusy}
            className="rounded-full border border-[var(--primary)]/30 px-3 py-1.5 font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
          >
            Return to {returnLabel}
          </button>
        )}
        {isQuestionMode(experience) && canStart && onStartQuestion && (
          <button
            type="button"
            onClick={onStartQuestion}
            disabled={isBusy}
            className="rounded-full bg-[var(--primary)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {startLabel}
          </button>
        )}
        {isQuestionMode(experience) && canNext && onNextQuestion && (
          <button
            type="button"
            onClick={onNextQuestion}
            disabled={isBusy}
            className="rounded-full border border-[var(--primary)]/30 px-3 py-1.5 font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
          >
            Next question
          </button>
        )}
      </div>
    </div>
  );
}
