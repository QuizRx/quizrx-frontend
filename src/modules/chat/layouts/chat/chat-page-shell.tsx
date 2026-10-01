"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { ExperienceToggle } from "@/modules/extraction-quiz/components/experience-toggle";
import { LearningStatusBar } from "@/modules/extraction-quiz/components/learning-status-bar";
import { SuggestedPromptsPanel } from "@/modules/extraction-quiz/components/suggested-prompts-panel";
import { TUTOR_SUGGESTED_PROMPTS } from "@/modules/extraction-quiz/data/suggested-prompts";
import { TopicChangeDialog } from "@/modules/extraction-quiz/components/topic-change-dialog";
import { useLearningAction } from "@/modules/extraction-quiz/hooks/use-learning-action";
import { learningQuestionToExtractionData } from "@/modules/extraction-quiz/utils/learning-action";
import {
  flattenModeEntries,
  useExtractionQuizStore,
} from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type { ExtractionEntry } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import { useArchivedSessionsStore } from "@/modules/extraction-quiz/store/archived-sessions-store";
import {
  isConversationalMode,
  isQuestionMode,
} from "@/modules/extraction-quiz/data/learning-modes";
import type {
  LearningActionQuestionPayload,
  LearningActionResponse,
  LearningActionTextPayload,
  LearningTurn,
} from "@/modules/extraction-quiz/types";
import { WelcomeHeader } from "./welcome-header";

type ChatPageShellProps = {
  showWelcomeWhenEmpty?: boolean;
};

const DONT_ASK_KEY = "quizrx-topic-change-dont-ask";

const FRIENDLY_ERROR_TEXT =
  "Sorry, I couldn't generate a question just now. Please try again.";

const collectSeenQuestionIds = (entries: ExtractionEntry[]): string[] =>
  entries
    .filter(
      (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
        e.kind === "attempt"
    )
    .map((e) => e.attempt.question.question.dp_id)
    .filter((id): id is string => Boolean(id));

const MAX_TUTOR_HISTORY = 8;
const collectTutorHistory = (entries: ExtractionEntry[]): LearningTurn[] =>
  entries
    .filter(
      (e): e is Extract<ExtractionEntry, { kind: "user-prompt" | "assistant" }> =>
        e.kind === "user-prompt" || e.kind === "assistant"
    )
    .map(
      (e): LearningTurn => ({
        role: e.kind === "user-prompt" ? "user" : "assistant",
        content: e.content,
      })
    )
    .slice(-MAX_TUTOR_HISTORY);

const deriveSessionTitle = (
  entries: ExtractionEntry[],
  chainId: string | null
): string => {
  const firstPrompt = entries.find((e) => e.kind === "user-prompt");
  if (firstPrompt && firstPrompt.kind === "user-prompt") {
    const text = firstPrompt.content.trim();
    if (text) return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  }
  return findChainById(chainId)?.label ?? "Study session";
};

export function ChatPageShell({
  showWelcomeWhenEmpty = false,
}: ChatPageShellProps) {
  const { isChatSidebarOpen } = useChatSidebar();
  const entries = useExtractionQuizStore((s) => s.entries);
  const modeEntries = useExtractionQuizStore((s) => s.modeEntries);
  const sessionId = useExtractionQuizStore((s) => s.sessionId);
  const selectedChainId = useExtractionQuizStore((s) => s.selectedChainId);
  const setSelectedChainId = useExtractionQuizStore(
    (s) => s.setSelectedChainId
  );
  const resetSession = useExtractionQuizStore((s) => s.resetSession);
  const appendUserPrompt = useExtractionQuizStore((s) => s.appendUserPrompt);
  const appendAssistant = useExtractionQuizStore((s) => s.appendAssistant);
  const appendSystem = useExtractionQuizStore((s) => s.appendSystem);
  const appendAttempt = useExtractionQuizStore((s) => s.appendAttempt);
  const setIsFetching = useExtractionQuizStore((s) => s.setIsFetching);
  const isFetching = useExtractionQuizStore((s) => s.isFetching);
  const experience = useExtractionQuizStore((s) => s.experience);
  const lastQuestionExperience = useExtractionQuizStore(
    (s) => s.lastQuestionExperience
  );
  const setExperience = useExtractionQuizStore((s) => s.setExperience);
  const actionInFlightRef = useRef(false);
  const archiveSession = useArchivedSessionsStore((s) => s.archive);
  const runLearningAction = useLearningAction();
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  const [pendingTopic, setPendingTopic] = useState<{
    chainId: string | null;
  } | null>(null);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    try {
      setDontAskAgain(localStorage.getItem(DONT_ASK_KEY) === "1");
    } catch {
      // ignore storage access errors (private mode, etc.)
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries.length, isFetching, experience]);

  const allEntries = flattenModeEntries(modeEntries);
  const hasAnyEntries = allEntries.length > 0;
  const selectedLabel = findChainById(selectedChainId)?.label ?? null;
  const isTutor = isConversationalMode(experience);
  const isLearning = Boolean(experience && selectedChainId);
  const hasCurrentAttempts = entries.some((e) => e.kind === "attempt");
  const canStart =
    isLearning && isQuestionMode(experience) && !hasCurrentAttempts;
  const canNext = isLearning && isQuestionMode(experience) && hasCurrentAttempts;
  const showTutorChips = isLearning && isTutor && entries.length === 0 && !isFetching;
  const bottomPlaceholder = selectedLabel
    ? `Ask your tutor about ${selectedLabel}...`
    : "Ask your tutor anything about Calcium & Bone...";

  const enterTutor = () => {
    if (experience !== "tutor") setExperience("tutor");
  };

  const handleSelectChain = (chainId: string | null) => {
    if (chainId === selectedChainId) return;
    if (!hasAnyEntries || dontAskAgain) {
      setSelectedChainId(chainId);
      return;
    }
    setPendingTopic({ chainId });
    setTopicDialogOpen(true);
  };

  const handleContinueHere = () => {
    if (pendingTopic) setSelectedChainId(pendingTopic.chainId);
    setPendingTopic(null);
    setTopicDialogOpen(false);
  };

  const handleStartNewSession = () => {
    const target = pendingTopic?.chainId ?? null;
    archiveSession({
      sessionId,
      title: deriveSessionTitle(allEntries, selectedChainId),
      chainId: selectedChainId,
      entries: allEntries,
      modeEntries,
      experience,
      lastQuestionExperience,
    });
    resetSession();
    setSelectedChainId(target);
    setPendingTopic(null);
    setTopicDialogOpen(false);
  };

  const handleDontAskAgainChange = (value: boolean) => {
    setDontAskAgain(value);
    try {
      if (value) localStorage.setItem(DONT_ASK_KEY, "1");
      else localStorage.removeItem(DONT_ASK_KEY);
    } catch {
      // ignore storage access errors
    }
  };

  const handleLearningResponse = (response: LearningActionResponse) => {
    switch (response.responseType) {
      case "question": {
        const payload = response.payload as LearningActionQuestionPayload;
        const chainId = selectedChainId ?? payload.topic_id ?? "";
        appendAttempt(chainId, learningQuestionToExtractionData(payload));
        return;
      }
      case "friendly_error": {
        const payload = response.payload as LearningActionTextPayload;
        appendSystem(payload?.text ?? FRIENDLY_ERROR_TEXT);
        return;
      }
      default: {
        const payload = response.payload as LearningActionTextPayload;
        if (payload?.text) appendAssistant(payload.text);
        return;
      }
    }
  };

  const runPrompt = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || actionInFlightRef.current) return;
    if (useExtractionQuizStore.getState().isFetching) return;

    enterTutor();
    const { modeEntries: priorModes } = useExtractionQuizStore.getState();
    const tutorEntries = priorModes.tutor;
    const isFirstTurn = tutorEntries.length === 0;

    actionInFlightRef.current = true;
    appendUserPrompt(text);
    setIsFetching(true);
    try {
      const response = await runLearningAction({
        message: text,
        experience: "tutor",
        topicId: selectedChainId,
        topicDisplayName: findChainById(selectedChainId)?.label ?? null,
        sessionId,
        isFirstTurn,
        history: collectTutorHistory(tutorEntries),
      });
      handleLearningResponse(response);
    } finally {
      actionInFlightRef.current = false;
      setIsFetching(false);
    }
  };

  const runQuestionAction = async (
    action: "start_question" | "next_question"
  ) => {
    if (actionInFlightRef.current) return;
    if (useExtractionQuizStore.getState().isFetching) return;
    const current = useExtractionQuizStore.getState();
    if (!isQuestionMode(current.experience)) return;
    const priorEntries = current.modeEntries[current.experience];
    actionInFlightRef.current = true;
    setIsFetching(true);
    try {
      const input = {
        message:
          action === "next_question" ? "next question" : "start a question",
        experience: current.experience,
        topicId: selectedChainId,
        topicDisplayName: findChainById(selectedChainId)?.label ?? null,
        sessionId,
        action,
        seenQuestionIds: collectSeenQuestionIds(priorEntries),
        isFirstTurn: priorEntries.length === 0,
      } as const;

      let response = await runLearningAction(input);
      if (response.responseType === "friendly_error") {
        await new Promise((r) => setTimeout(r, 800));
        response = await runLearningAction(input);
      }
      handleLearningResponse(response);
    } finally {
      actionInFlightRef.current = false;
      setIsFetching(false);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await runPrompt(text);
  };

  // Discovery until both a mode and a topic are chosen. After that the
  // selected experience occupies the page; bottom controls stay compact.
  const showDiscovery = !isLearning && (showWelcomeWhenEmpty || !hasAnyEntries);

  return (
    <div className="relative flex flex-col overflow-hidden h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-white/55"
      />
      {showDiscovery && (
        <img
          aria-hidden
          src="/chatBG.png"
          alt=""
          className="pointer-events-none absolute bottom-0 right-4 z-1 hidden h-auto w-[200px] max-w-[28vw] select-none object-contain opacity-40 sm:block md:w-[260px] lg:right-8 lg:w-[300px]"
        />
      )}

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col min-h-0 transition-all duration-500",
          isChatSidebarOpen ? "lg:pl-[300px]" : ""
        )}
      >
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-hidden overflow-y-auto px-2 pt-2 min-h-0 mt-12"
          style={{
            paddingBottom: showDiscovery
              ? "max(24px, env(safe-area-inset-bottom, 0px))"
              : isTutor
                ? showTutorChips
                  ? "max(208px, calc(188px + env(safe-area-inset-bottom, 0px)))"
                  : "max(168px, calc(148px + env(safe-area-inset-bottom, 0px)))"
                : "max(96px, calc(80px + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          {showDiscovery ? (
            <WelcomeHeader
              selectedChainId={selectedChainId}
              onSelectChain={handleSelectChain}
              isBusy={isFetching}
            />
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 pt-4">
              <LearningStatusBar
                topicLabel={selectedLabel}
                experience={experience}
                className="mb-6"
              />
              {showTutorChips && (
                <p className="mb-2 text-sm text-zinc-500">
                  Ask your tutor anything{selectedLabel ? ` about ${selectedLabel}` : ""}.
                </p>
              )}
              {canStart && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/70 px-6 py-16 text-center">
                  <p className="mb-4 max-w-md text-sm text-zinc-500">
                    {experience === "practice_studio"
                      ? `Start a short-answer question${selectedLabel ? ` on ${selectedLabel}` : ""}.`
                      : `Start a curated clinical question${selectedLabel ? ` on ${selectedLabel}` : ""}.`}
                  </p>
                  <Button
                    onClick={() => runQuestionAction("start_question")}
                    disabled={isFetching}
                    className="rounded-full bg-[var(--primary)] px-5 hover:bg-[var(--primary)]/90"
                  >
                    {experience === "practice_studio"
                      ? "Start Practice"
                      : "Start a question"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {isLearning &&
            (hasCurrentAttempts || (isTutor && (entries.length > 0 || isFetching))) && (
            <ChatThreadView
              onNextQuestion={() => runQuestionAction("next_question")}
              showNext={canNext}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isLearning && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-20 border-t border-zinc-200/70 bg-white/80 px-3 pt-3 backdrop-blur-md transition-all duration-500",
            isChatSidebarOpen ? "lg:pl-[316px]" : ""
          )}
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
          }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            {showTutorChips && (
              <SuggestedPromptsPanel
                onSelect={runPrompt}
                disabled={isFetching}
                prompts={TUTOR_SUGGESTED_PROMPTS}
                compact
              />
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ExperienceToggle disabled={isFetching} />
              <TopicDropdown
                selectedChainId={selectedChainId}
                onSelectChain={handleSelectChain}
              />
            </div>
            {isTutor && (
              <div className="flex items-end gap-2 rounded-2xl border border-[var(--primary)] bg-white p-2 ring-2 ring-[var(--primary)]/15">
                <textarea
                  ref={chatInputRef}
                  value={draft}
                  onFocus={enterTutor}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={bottomPlaceholder}
                  rows={1}
                  disabled={isFetching}
                  className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isFetching || !draft.trim()}
                  aria-label="Send to Tutor"
                  className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <TopicChangeDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        onStartNewSession={handleStartNewSession}
        onContinueHere={handleContinueHere}
        onDontAskAgainChange={handleDontAskAgainChange}
      />
    </div>
  );
}

function ChatThreadView({
  onNextQuestion,
  showNext,
}: {
  onNextQuestion: () => void;
  showNext: boolean;
}) {
  const entries = useExtractionQuizStore((s) => s.entries);
  const isFetching = useExtractionQuizStore((s) => s.isFetching);
  const experience = useExtractionQuizStore((s) => s.experience);
  let attemptOrdinal = 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-2 pt-2 sm:px-4">
      {entries.map((entry) => {
        if (entry.kind === "user-prompt") {
          return (
            <div key={entry.id} className="flex justify-end mb-4">
              <div className="max-w-[85%] rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm text-white shadow-sm whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>
          );
        }
        if (entry.kind === "system") {
          return (
            <div key={entry.id} className="flex justify-start mb-4">
              <div className="max-w-[85%] rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
                {entry.content}
              </div>
            </div>
          );
        }

        if (entry.kind === "assistant") {
          return (
            <div key={entry.id} className="flex justify-start mb-4">
              <div className="max-w-[85%] rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>
          );
        }

        attemptOrdinal += 1;
        const questionNumber = attemptOrdinal;
        return (
          <div key={entry.id} className="flex justify-start mb-4">
            <div className="w-full max-w-[95%]">
              <ExtractionQuestionCard
                attempt={entry.attempt}
                questionNumber={questionNumber}
              />
            </div>
          </div>
        );
      })}

      {isFetching && (
        <div className="flex justify-start mb-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
            {experience === "tutor"
              ? "Tutor is thinking..."
              : "Preparing question..."}
          </div>
        </div>
      )}

      {showNext && !isFetching && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNextQuestion}
            className="rounded-full border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/5"
          >
            Next question
          </Button>
        </div>
      )}
    </div>
  );
}
