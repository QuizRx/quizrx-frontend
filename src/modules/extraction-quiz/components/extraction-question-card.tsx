"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import {
  ExtractionAttempt,
  useExtractionQuizStore,
} from "../store/extraction-quiz-store";
import { useExtractionQuiz } from "../hooks/use-extraction-quiz";
import type { QuestionFeedbackInput } from "../types";

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

type ExtractionQuestionCardProps = {
  attempt: ExtractionAttempt;
};

export function ExtractionQuestionCard({
  attempt,
}: ExtractionQuestionCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showFreeText, setShowFreeText] = useState(false);

  const recordAnswer = useExtractionQuizStore((s) => s.recordAnswer);
  const recordRating = useExtractionQuizStore((s) => s.recordRating);
  const recordFreeText = useExtractionQuizStore((s) => s.recordFreeText);
  const { submitFeedback } = useExtractionQuiz();

  const { question } = attempt.question;
  const explanation =
    attempt.question.part2_data?.explanation?.trim() || null;

  const trapIds = useMemo(
    () => question.option_trap_ids?.filter(Boolean) as string[],
    [question.option_trap_ids]
  );

  const isAnswered = attempt.selectedIndex !== null;

  const buildFeedbackInput = (
    selectedIndex: number,
    rating: "up" | "down" | null,
    freeText?: string
  ): QuestionFeedbackInput => {
    const isCorrect = question.choices[selectedIndex] === question.answer;
    return {
      chainId: attempt.chainId,
      dpId: question.dp_id,
      isCorrect,
      shownTrapIds: trapIds,
      selectedTrapId: question.option_trap_ids?.[selectedIndex] ?? null,
      selectedOptionLabel: OPTION_LABELS[selectedIndex],
      selectedOptionText: question.choices[selectedIndex],
      rating,
      freeText: freeText && freeText.trim() ? freeText.trim() : undefined,
    };
  };

  const handleSelect = async (index: number) => {
    if (isAnswered || submitting) return;
    recordAnswer(attempt.id, index);
    setSubmitting(true);
    // Silent: this is the initial answer, not a feedback action. We still
    // POST it so trap analytics (US-3.2) get the record, but we don't
    // toast "Thanks for the feedback" — the user hasn't given feedback yet.
    await submitFeedback(buildFeedbackInput(index, null), attempt.id, {
      silent: true,
    });
    setSubmitting(false);
  };

  const handleRating = async (rating: "up" | "down") => {
    if (attempt.selectedIndex === null) return;
    const next = attempt.rating === rating ? null : rating;
    recordRating(attempt.id, next);
    setSubmitting(true);
    await submitFeedback(
      buildFeedbackInput(attempt.selectedIndex, next, attempt.freeText),
      attempt.id
    );
    setSubmitting(false);
  };

  const handleFreeTextSubmit = async () => {
    if (attempt.selectedIndex === null) return;
    setSubmitting(true);
    await submitFeedback(
      buildFeedbackInput(attempt.selectedIndex, attempt.rating, attempt.freeText),
      attempt.id
    );
    setSubmitting(false);
    setShowFreeText(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium text-zinc-500">
        {question.sub_topic ?? attempt.chainId}
      </p>
      <h3 className="mb-4 text-base font-medium text-zinc-900 leading-relaxed">
        {question.question}
      </h3>

      <ol className="space-y-2">
        {question.choices.map((choice, index) => {
          const isSelected = attempt.selectedIndex === index;
          const isCorrectChoice = choice === question.answer;
          const showCorrect = isAnswered && isCorrectChoice;
          const showIncorrect = isAnswered && isSelected && !isCorrectChoice;

          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(index)}
                disabled={isAnswered || submitting}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  !isAnswered &&
                    "border-zinc-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
                  showCorrect &&
                    "border-emerald-300 bg-emerald-50 text-emerald-900",
                  showIncorrect && "border-rose-300 bg-rose-50 text-rose-900",
                  isAnswered && !showCorrect && !showIncorrect &&
                    "border-zinc-200 bg-white text-zinc-500"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    showCorrect && "bg-emerald-500 text-white",
                    showIncorrect && "bg-rose-500 text-white",
                    !showCorrect && !showIncorrect &&
                      "bg-[var(--primary)]/10 text-[var(--primary)]"
                  )}
                >
                  {showCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : showIncorrect ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    OPTION_LABELS[index]
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{choice}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {isAnswered && explanation && (
        <div className="mt-5 rounded-xl border border-zinc-200 bg-[var(--primary)]/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            Explanation
          </p>
          <p className="whitespace-pre-line text-sm text-zinc-700 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {isAnswered && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleRating("up")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:text-[var(--primary)]",
              attempt.rating === "up" &&
                "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
            )}
            aria-label="Rate question helpful"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleRating("down")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:text-rose-600",
              attempt.rating === "down" &&
                "border-rose-300 bg-rose-50 text-rose-600"
            )}
            aria-label="Rate question unhelpful"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFreeText((v) => !v)}
            className="text-xs text-zinc-500"
          >
            {showFreeText ? "Cancel" : "Add a comment"}
          </Button>

          {submitting && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sending feedback…
            </span>
          )}
        </div>
      )}

      {isAnswered && showFreeText && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={attempt.freeText}
            onChange={(e) => recordFreeText(attempt.id, e.target.value)}
            placeholder="Tell us what worked or what we should fix…"
            rows={3}
            className="text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleFreeTextSubmit}
              disabled={submitting || attempt.freeText.trim().length === 0}
            >
              {submitting ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
