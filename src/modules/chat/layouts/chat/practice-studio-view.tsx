"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { cn } from "@/core/lib/utils";
import { CALCIUM_BONE_CHAINS, findChainById } from "@/modules/extraction-quiz";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { getModeMeta } from "@/modules/extraction-quiz/data/learning-modes";
import { useLearningAction } from "@/modules/extraction-quiz/hooks/use-learning-action";
import {
  type ExtractionEntry,
  useExtractionQuizStore,
} from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type {
  LearningActionQuestionPayload,
  LearningActionTextPayload,
} from "@/modules/extraction-quiz/types";
import { learningQuestionToExtractionData } from "@/modules/extraction-quiz/utils/learning-action";
import { ModeHero } from "./mode-hero";

type AttemptEntry = Extract<ExtractionEntry, { kind: "attempt" }>;

const QUESTION_ERROR =
  "Sorry, I couldn't generate a question just now. Please try again.";

const topicAttempts = (
  entries: ExtractionEntry[],
  topicId: string | null
): AttemptEntry[] =>
  entries.filter(
    (e): e is AttemptEntry => e.kind === "attempt" && e.attempt.chainId === topicId
  );

export function PracticeStudioView({ active }: { active: boolean }) {
  const topicId = useExtractionQuizStore((s) => s.selectedChainId);
  const setTopicId = useExtractionQuizStore((s) => s.setSelectedChainId);
  const entries = useExtractionQuizStore((s) => s.modeEntries.practice_studio);
  const pending = useExtractionQuizStore((s) => s.pending.practice_studio);
  const appendAttempt = useExtractionQuizStore((s) => s.appendAttempt);
  const setPending = useExtractionQuizStore((s) => s.setPending);
  const runLearningAction = useLearningAction();
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const shownCount = useRef(0);

  // Each topic keeps its own questions, so switching topics (or modes) and
  // coming back restores exactly where the learner was.
  const attempts = useMemo(() => topicAttempts(entries, topicId), [entries, topicId]);

  useEffect(() => setError(null), [topicId]);

  useEffect(() => {
    if (!active) return;
    const count = attempts.length + (pending ? 1 : 0);
    if (count === shownCount.current) return;
    shownCount.current = count;
    if (attempts.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [attempts.length, pending, active]);

  const requestQuestion = async () => {
    const state = useExtractionQuizStore.getState();
    const chainId = state.selectedChainId;
    if (!chainId || state.pending.practice_studio) return;
    const seen = topicAttempts(state.modeEntries.practice_studio, chainId)
      .map((e) => e.attempt.question.question.dp_id)
      .filter(Boolean);
    const isFirst = seen.length === 0;
    setError(null);
    setPending("practice_studio", true);
    try {
      const response = await runLearningAction(
        {
          message: isFirst ? "start a question" : "next question",
          experience: "practice_studio",
          topicId: chainId,
          topicDisplayName: findChainById(chainId)?.label ?? null,
          sessionId: state.sessionId,
          action: isFirst ? "start_question" : "next_question",
          seenQuestionIds: seen,
          isFirstTurn: isFirst,
        },
        { retryOnError: true }
      );
      if (response.responseType === "question") {
        const payload = response.payload as LearningActionQuestionPayload;
        appendAttempt(
          chainId,
          learningQuestionToExtractionData(payload),
          "practice_studio"
        );
      } else {
        setError(
          (response.payload as LearningActionTextPayload | null)?.text ??
            QUESTION_ERROR
        );
      }
    } finally {
      setPending("practice_studio", false);
    }
  };

  if (attempts.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center pb-[6vh] pt-6 sm:pt-8">
          <ModeHero
            title="Practice Studio"
            subtitle={getModeMeta("practice_studio").description}
          >
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-5 shadow-sm sm:p-6">
              <p
                id="practice-topic-label"
                className="mb-2 text-sm font-medium text-zinc-700"
              >
                Choose a topic
              </p>
              <TopicSelect
                value={topicId}
                onChange={setTopicId}
                labelledBy="practice-topic-label"
              />
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Button
                  onClick={requestQuestion}
                  disabled={!topicId || pending}
                  className="h-11 rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start practice
                </Button>
                {!topicId && (
                  <p className="text-sm text-zinc-500">Choose a topic to begin.</p>
                )}
              </div>
              {error && <ErrorNote message={error} />}
            </div>
          </ModeHero>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        <div className="sticky top-2 z-10 mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white/85 py-2 pl-4 pr-2 shadow-sm backdrop-blur">
          <p className="text-sm text-zinc-500">
            <span className="font-medium text-[var(--primary)]">Practice Studio</span>
            <span className="mx-1.5 text-zinc-300">·</span>
            {attempts.length} question{attempts.length === 1 ? "" : "s"}
          </p>
          <TopicSelect value={topicId} onChange={setTopicId} compact />
        </div>

        <div className="mt-4 space-y-4">
          {attempts.map((entry, i) => (
            <ExtractionQuestionCard
              key={entry.id}
              attempt={entry.attempt}
              questionNumber={i + 1}
            />
          ))}
        </div>

        {error && <ErrorNote message={error} />}

        <div className="flex justify-center pt-5">
          {pending ? (
            <p className="inline-flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
              Preparing question...
            </p>
          ) : (
            <Button
              onClick={requestQuestion}
              className="rounded-full bg-[var(--primary)] px-5 hover:bg-[var(--primary)]/90"
            >
              Next question
            </Button>
          )}
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function TopicSelect({
  value,
  onChange,
  compact = false,
  labelledBy,
}: {
  value: string | null;
  onChange: (chainId: string) => void;
  compact?: boolean;
  labelledBy?: string;
}) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        aria-label={labelledBy ? undefined : "Practice Studio topic"}
        aria-labelledby={labelledBy}
        className={cn(
          "bg-white text-zinc-800",
          compact
            ? "h-9 w-auto min-w-[13rem] gap-2 rounded-full px-4"
            : "h-12 rounded-xl px-4 text-base"
        )}
      >
        <SelectValue placeholder="Select a topic" />
      </SelectTrigger>
      <SelectContent>
        {CALCIUM_BONE_CHAINS.map((chain) => (
          <SelectItem key={chain.chainId} value={chain.chainId}>
            {chain.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
      {message}
    </p>
  );
}
