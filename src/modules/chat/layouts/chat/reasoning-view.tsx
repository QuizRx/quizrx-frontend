"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Progress } from "@/core/components/ui/progress";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { getModeMeta } from "@/modules/extraction-quiz/data/learning-modes";
import { useLearningAction } from "@/modules/extraction-quiz/hooks/use-learning-action";
import {
  type ExtractionAttempt,
  type ExtractionEntry,
  useExtractionQuizStore,
} from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type {
  LearningActionQuestionPayload,
  LearningActionTextPayload,
} from "@/modules/extraction-quiz/types";
import { learningQuestionToExtractionData } from "@/modules/extraction-quiz/utils/learning-action";
import { ModeHero } from "./mode-hero";

const COLLECTION_SIZE = 30;
const QUESTION_ERROR =
  "Sorry, I couldn't load the question just now. Please try again.";

type ReasoningAction = "start_question" | "next_question";

const sequencedAttempts = (entries: ExtractionEntry[]): ExtractionAttempt[] =>
  entries.flatMap((e) =>
    e.kind === "attempt" && e.attempt.question.question.sequence ? [e.attempt] : []
  );

const numberOf = (attempt: ExtractionAttempt | undefined): number =>
  attempt?.question.question.sequence?.number ?? 0;

export function ReasoningView({ active }: { active: boolean }) {
  const entries = useExtractionQuizStore((s) => s.modeEntries.reasoning);
  const pending = useExtractionQuizStore((s) => s.pending.reasoning);
  const appendAttempt = useExtractionQuizStore((s) => s.appendAttempt);
  const setPending = useExtractionQuizStore((s) => s.setPending);
  const resetReasoning = useExtractionQuizStore((s) => s.resetReasoning);
  const runLearningAction = useLearningAction();

  // Page-session UI state. The view stays mounted while other modes are on
  // screen, so returning to Reasoning restores the open question.
  const [opened, setOpened] = useState(false);
  const [finished, setFinished] = useState(false);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const attempts = useMemo(() => sequencedAttempts(entries), [entries]);
  const last = attempts[attempts.length - 1];
  const total = last?.question.question.sequence?.total ?? COLLECTION_SIZE;
  const answered = attempts.filter((a) => a.selectedIndex !== null);
  const correctCount = answered.filter((a) => a.isCorrect).length;
  const lastAnswered = Boolean(last && last.selectedIndex !== null);
  const allDone = lastAnswered && numberOf(last) >= total;
  const resumeNumber = !last
    ? 1
    : lastAnswered
      ? Math.min(numberOf(last) + 1, total)
      : numberOf(last);

  const index = Math.min(viewIndex ?? attempts.length - 1, attempts.length - 1);
  const current = attempts[index];
  const currentAnswered = Boolean(current && current.selectedIndex !== null);
  const onNewest = index === attempts.length - 1;
  const atEnd = numberOf(current) >= total;

  useEffect(() => {
    if (active) scrollRef.current?.scrollTo({ top: 0 });
  }, [current?.id, finished, active]);

  const load = async (action: ReasoningAction, currentQuestionId: string | null) => {
    const state = useExtractionQuizStore.getState();
    if (state.pending.reasoning) return;
    const known = sequencedAttempts(state.modeEntries.reasoning);
    setError(null);
    setPending("reasoning", true);
    try {
      const response = await runLearningAction(
        {
          message: action === "next_question" ? "next question" : "start a question",
          experience: "reasoning",
          topicId: null,
          topicDisplayName: null,
          sessionId: state.sessionId,
          action,
          currentQuestionId,
          seenQuestionIds: known.map((a) => a.question.question.dp_id),
          isFirstTurn: known.length === 0,
        },
        { retryOnError: true }
      );
      const text = (response.payload as LearningActionTextPayload | null)?.text;
      if (response.responseType === "question") {
        const payload = response.payload as LearningActionQuestionPayload;
        const existing = known.findIndex(
          (a) => a.question.question.dp_id === payload.question_id
        );
        if (existing >= 0) {
          setViewIndex(existing);
        } else {
          appendAttempt(
            payload.topic_id ?? "",
            learningQuestionToExtractionData(payload),
            "reasoning"
          );
          setViewIndex(null);
        }
        setFinished(false);
        setOpened(true);
      } else if (response.responseType === "clarification" && text && /completed/i.test(text)) {
        setFinished(true);
        setOpened(true);
      } else {
        setError(text ?? QUESTION_ERROR);
      }
    } finally {
      setPending("reasoning", false);
    }
  };

  const continueReasoning = () => {
    if (!last) return load("start_question", null);
    if (allDone) {
      setFinished(true);
      setOpened(true);
      return;
    }
    if (!lastAnswered) {
      setViewIndex(null);
      setFinished(false);
      setOpened(true);
      return;
    }
    return load("next_question", last.question.question.dp_id);
  };

  const goNext = () => {
    if (!current) return;
    if (!onNewest) return setViewIndex(index + 1);
    if (atEnd) return setFinished(true);
    return load("next_question", current.question.question.dp_id);
  };

  const reviewFromStart = () => {
    setViewIndex(0);
    setFinished(false);
    setOpened(true);
  };

  const startAgain = () => {
    resetReasoning();
    setViewIndex(null);
    setFinished(false);
    return load("start_question", null);
  };

  const progress = (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--primary)]">QuizRx Reasoning</span>
        <span className="text-zinc-500">
          {answered.length} of {total} answered
        </span>
      </div>
      <Progress
        value={(answered.length / total) * 100}
        className="mt-2 h-1.5 bg-[var(--primary)]/10"
      />
    </div>
  );

  if (!opened || (!finished && !current)) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center pb-[6vh] pt-6 sm:pt-8">
          <ModeHero
            title="QuizRx Reasoning"
            subtitle={getModeMeta("reasoning").description}
          >
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">
                  {allDone
                    ? `All ${total} questions completed`
                    : `Question ${resumeNumber} of ${total}`}
                </span>
                {answered.length > 0 && (
                  <span className="text-zinc-500">{answered.length} answered</span>
                )}
              </div>
              {answered.length > 0 && (
                <Progress
                  value={(answered.length / total) * 100}
                  className="mt-3 h-1.5 bg-[var(--primary)]/10"
                />
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {allDone ? (
                  <>
                    <Button
                      onClick={reviewFromStart}
                      className="h-11 rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
                    >
                      Review answers
                    </Button>
                    <Button
                      variant="outline"
                      onClick={startAgain}
                      disabled={pending}
                      className="h-11 rounded-full px-6"
                    >
                      Start again
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={continueReasoning}
                    disabled={pending}
                    className="h-11 rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
                  >
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {last ? "Continue" : "Start reasoning"}
                    {!pending && <ArrowRight className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Your progress is saved as you go.
              </p>
              {error && <ErrorNote message={error} />}
            </div>
          </ModeHero>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div ref={scrollRef} className="h-full overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center pb-[6vh] pt-6 sm:pt-8">
          <ModeHero
            title="QuizRx Reasoning"
            subtitle={`You have completed all ${total} questions.`}
          >
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-5 shadow-sm sm:p-6">
              <p className="text-sm text-zinc-700">
                You answered{" "}
                <span className="font-semibold text-[var(--primary)]">
                  {correctCount} of {total}
                </span>{" "}
                correctly.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  onClick={reviewFromStart}
                  className="h-11 rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
                >
                  Review answers
                </Button>
                <Button
                  variant="outline"
                  onClick={startAgain}
                  disabled={pending}
                  className="h-11 rounded-full px-6"
                >
                  Start again
                </Button>
              </div>
              {error && <ErrorNote message={error} />}
            </div>
          </ModeHero>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-3 sm:px-6">
        {progress}
        <div className="mt-4">
          <ExtractionQuestionCard key={current.id} attempt={current} />
        </div>
        {error && <ErrorNote message={error} />}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setViewIndex(Math.max(0, index - 1))}
            disabled={index === 0 || pending}
            className="rounded-full text-zinc-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={goNext}
            disabled={!currentAnswered || pending}
            className="rounded-full bg-[var(--primary)] px-5 hover:bg-[var(--primary)]/90"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {onNewest && atEnd ? "Finish" : "Next question"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
        {!currentAnswered && (
          <p className="mt-3 text-right text-xs text-zinc-500">
            Choose an answer to see the explanation and continue.
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
      {message}
    </p>
  );
}
