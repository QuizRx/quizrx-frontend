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
import { useLearningAction } from "../hooks/use-learning-action";
import type { ReportReason } from "../data/report-reasons";
import type { LearningActionReviewPayload, QuestionFeedbackInput } from "../types";
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
  const recordFreeText = useExtractionQuizStore((s) => s.recordFreeText);
  const recordReview = useExtractionQuizStore((s) => s.recordReview);
  const experience = useExtractionQuizStore((s) => s.experience);
  const sessionId = useExtractionQuizStore((s) => s.sessionId);
  const { submitFeedback } = useExtractionQuiz();
  const runLearningAction = useLearningAction();

  const { question } = attempt.question;
  const explanation =
    attempt.question.part2_data?.explanation?.trim() || null;
  const explanationSections = question.explanationSections ?? [];
  const isShortAnswer = question.format === "short_answer";

  const trapIds = useMemo(
    () => question.option_trap_ids?.filter(Boolean) as string[],
    [question.option_trap_ids]
  );

  // Short-answer counts as "answered" once a non-empty answer is recorded;
  // MCQ counts as answered once an option is selected.
  const isAnswered = isShortAnswer
    ? attempt.freeText.trim().length > 0
    : attempt.selectedIndex !== null;

  const [answerDraft, setAnswerDraft] = useState(attempt.freeText ?? "");

  const buildMcqFeedbackInput = (
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
      experience,
    };
  };

  // Report input that works for both formats (short-answer has no selected
  // option). Question metadata is always attached so the backend can key the
  // report to the right question.
  const buildReportInput = (
    reason: ReportReason,
    comment: string
  ): QuestionFeedbackInput => {
    const idx = attempt.selectedIndex;
    const hasOption = !isShortAnswer && idx !== null;
    return {
      chainId: attempt.chainId,
      dpId: question.dp_id,
      questionId: question.dp_id,
      isCorrect:
        hasOption && idx !== null
          ? question.choices[idx] === question.answer
          : false,
      shownTrapIds: trapIds,
      selectedTrapId:
        hasOption && idx !== null
          ? question.option_trap_ids?.[idx] ?? null
          : null,
      selectedOptionLabel:
        hasOption && idx !== null ? OPTION_LABELS[idx] : undefined,
      selectedOptionText:
        hasOption && idx !== null ? question.choices[idx] : undefined,
      reportReason: reason,
      freeText: comment.trim() ? comment.trim() : undefined,
      experience,
    };
  };

  const handleSelect = async (index: number) => {
    if (isShortAnswer || isAnswered || submitting) return;
    recordAnswer(attempt.id, index);
    setSubmitting(true);
    // Silent: this records the answer + trap analytics, not a feedback action.
    await submitFeedback(buildMcqFeedbackInput(index), attempt.id, {
      silent: true,
    });
    setSubmitting(false);
  };

  // Short-answer submit (Practice Studio): the backend semantically grades the
  // typed answer against the anchor-grounded ideal answer and returns a
  // `question_review` (Final Handoff §9). We record the answer, then store the
  // grade + ideal answer so the review panel renders below the question.
  const handleShortSubmit = async () => {
    const text = answerDraft.trim();
    if (!text || submitting || isAnswered) return;
    setSubmitting(true);
    recordFreeText(attempt.id, text);
    try {
      const response = await runLearningAction({
        message: text,
        experience,
        topicId: attempt.chainId,
        topicDisplayName: findChainById(attempt.chainId)?.label ?? null,
        sessionId,
        action: "submit_answer",
        learnerAnswer: text,
        currentQuestionId: question.dp_id,
      });
      if (response.responseType === "question_review") {
        const p = response.payload as LearningActionReviewPayload;
        recordReview(attempt.id, {
          evaluation: p?.evaluation ?? "partial",
          feedback: p?.feedback,
          idealAnswer: p?.ideal_answer,
        });
      } else {
        // friendly_error / unexpected shape: still close the loop with any
        // returned copy so the learner is not left hanging.
        const p = response.payload as { text?: string };
        recordReview(attempt.id, {
          evaluation: "partial",
          feedback: p?.text,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Report submission (A-14 / H-13). Structured reason + optional comment; the
  // question metadata is attached automatically.
  const handleReportSubmit = async (
    reason: ReportReason,
    comment: string
  ): Promise<boolean> => {
    if (!isAnswered) return false;
    return submitFeedback(buildReportInput(reason, comment), attempt.id, {
      silent: true,
    });
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

      {isShortAnswer ? (
        <div className="space-y-3">
          <textarea
            value={isAnswered ? attempt.freeText : answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleShortSubmit();
              }
            }}
            disabled={isAnswered || submitting}
            rows={4}
            placeholder="Type your answer..."
            className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--primary)] disabled:bg-zinc-50 disabled:text-zinc-600"
          />
          {!isAnswered && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleShortSubmit}
                disabled={!answerDraft.trim() || submitting}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              >
                Submit answer
              </Button>
            </div>
          )}
          {isAnswered && submitting && !attempt.review && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
              Checking your answer...
            </div>
          )}
          {isAnswered && attempt.review && (
            <div
              className={cn(
                "rounded-xl border p-4",
                attempt.review.evaluation === "correct" &&
                  "border-emerald-200 bg-emerald-50",
                attempt.review.evaluation === "partial" &&
                  "border-amber-200 bg-amber-50",
                attempt.review.evaluation === "incorrect" &&
                  "border-rose-200 bg-rose-50"
              )}
            >
              <p
                className={cn(
                  "mb-1 text-xs font-semibold uppercase tracking-wide",
                  attempt.review.evaluation === "correct" && "text-emerald-700",
                  attempt.review.evaluation === "partial" && "text-amber-700",
                  attempt.review.evaluation === "incorrect" && "text-rose-700"
                )}
              >
                {attempt.review.evaluation === "correct"
                  ? "Correct"
                  : attempt.review.evaluation === "partial"
                  ? "Partially correct"
                  : "Not quite"}
              </p>
              {attempt.review.feedback && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                  {attempt.review.feedback}
                </p>
              )}
              {attempt.review.idealAnswer && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ideal answer
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">
                    {attempt.review.idealAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
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
      )}

      {isAnswered && explanationSections.length > 0 ? (
        <div className="mt-5 space-y-3">
          {explanationSections.map((section, i) => (
            <div
              key={section.id ?? i}
              className="rounded-xl border border-zinc-200 bg-[var(--primary)]/5 p-4"
            >
              {section.heading && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {section.heading}
                </p>
              )}
              {section.body && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                  {section.body}
                </p>
              )}
              {section.options && section.options.length > 0 && (
                <div className="mt-2 space-y-3">
                  {section.options.map((opt) => (
                    <div key={opt.option}>
                      <p className="text-sm font-semibold text-zinc-800">
                        Option {opt.option}
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                        {opt.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        isAnswered &&
        explanation && (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-[var(--primary)]/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              Why this is correct
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
              {explanation}
            </p>
          </div>
        )
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
