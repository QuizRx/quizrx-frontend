"use client";

import { useMemo, useState } from "react";
import { Check, Flag, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import {
  ExtractionAttempt,
  useExtractionQuizStore,
} from "../store/extraction-quiz-store";
import { findChainById } from "../data/chains";
import { useExtractionQuiz } from "../hooks/use-extraction-quiz";
import type { ReportReason } from "../data/report-reasons";
import type { QuestionFeedbackInput } from "../types";
import { ReportQuestionDialog } from "./report-question-dialog";

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

type ExtractionQuestionCardProps = {
  attempt: ExtractionAttempt;
};

export function ExtractionQuestionCard({
  attempt,
}: ExtractionQuestionCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const recordAnswer = useExtractionQuizStore((s) => s.recordAnswer);
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
    freeText?: string,
    reportReason?: ReportReason
  ): QuestionFeedbackInput => {
    const isCorrect = question.choices[selectedIndex] === question.answer;
    return {
      chainId: attempt.chainId,
      dpId: question.dp_id,
      questionId: question.dp_id,
      isCorrect,
      shownTrapIds: trapIds,
      selectedTrapId: question.option_trap_ids?.[selectedIndex] ?? null,
      selectedOptionLabel: OPTION_LABELS[selectedIndex],
      selectedOptionText: question.choices[selectedIndex],
      reportReason: reportReason ?? undefined,
      freeText: freeText && freeText.trim() ? freeText.trim() : undefined,
    };
  };

  const handleSelect = async (index: number) => {
    if (isAnswered || submitting) return;
    recordAnswer(attempt.id, index);
    setSubmitting(true);
    // Silent: this records the answer + trap analytics, not a feedback action.
    await submitFeedback(buildFeedbackInput(index), attempt.id, {
      silent: true,
    });
    setSubmitting(false);
  };

  // Report submission (A-14 / H-13). The structured reason goes in the
  // dedicated `reportReason` field and the optional comment in `freeText`; the
  // question metadata is attached automatically here.
  const handleReportSubmit = async (
    reason: ReportReason,
    comment: string
  ): Promise<boolean> => {
    if (attempt.selectedIndex === null) return false;
    return submitFeedback(
      buildFeedbackInput(attempt.selectedIndex, comment || undefined, reason),
      attempt.id,
      { silent: true }
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium text-zinc-500">
        {question.sub_topic ??
          findChainById(attempt.chainId)?.label ??
          "Practice question"}
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
            Why this is correct
          </p>
          <p className="whitespace-pre-line text-sm text-zinc-700 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {isAnswered && (
        <div className="mt-4 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReportOpen(true)}
            className="gap-1.5 text-xs text-zinc-500 hover:text-[var(--primary)]"
          >
            <Flag className="h-3.5 w-3.5" />
            Report this question
          </Button>
        </div>
      )}

      <ReportQuestionDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
