"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { ExperienceToggle } from "@/modules/extraction-quiz/components/experience-toggle";
import { TopicChangeDialog } from "@/modules/extraction-quiz/components/topic-change-dialog";
import { useLearningAction } from "@/modules/extraction-quiz/hooks/use-learning-action";
import {
  learningQuestionToExtractionData,
  toCurrentOptions,
} from "@/modules/extraction-quiz/utils/learning-action";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type { ExtractionEntry } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import { useArchivedSessionsStore } from "@/modules/extraction-quiz/store/archived-sessions-store";
import type {
  LearningActionQuestionPayload,
  LearningActionResponse,
  LearningActionTextPayload,
} from "@/modules/extraction-quiz/types";
import { WelcomeHeader } from "./welcome-header";

type ChatPageShellProps = {
  showWelcomeWhenEmpty?: boolean;
};

const DONT_ASK_KEY = "quizrx-topic-change-dont-ask";

const FRIENDLY_ERROR_TEXT =
  "Sorry, I couldn't generate a question just now. Please try again.";

// Ids of every question already shown this session, so the server avoids
// repeats (Reasoning) / samples without replacement (Practice Studio).
const collectSeenQuestionIds = (entries: ExtractionEntry[]): string[] =>
  entries
    .filter(
      (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
        e.kind === "attempt"
    )
    .map((e) => e.attempt.question.question.dp_id)
    .filter((id): id is string => Boolean(id));

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
  const archiveSession = useArchivedSessionsStore((s) => s.archive);
  const runLearningAction = useLearningAction();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  // Topic-change session dialog (A-11).
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
  }, [entries.length, isFetching]);

  const hasEntries = entries.length > 0;
  const shouldShowWelcome = showWelcomeWhenEmpty && !hasEntries;
  const selectedLabel = findChainById(selectedChainId)?.label ?? null;
  const bottomPlaceholder = selectedLabel
    ? `Ask anything about ${selectedLabel}...`
    : "Ask QuizRx anything...";

  // Topic selection with the approved session choice (A-11). When there is no
  // active session (or the user opted out of the prompt) we apply immediately.
  const handleSelectChain = (chainId: string | null) => {
    if (chainId === selectedChainId) return;
    if (!hasEntries || dontAskAgain) {
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
    // Preserve the current session in History before starting a fresh one.
    archiveSession({
      sessionId,
      title: deriveSessionTitle(entries, selectedChainId),
      chainId: selectedChainId,
      entries,
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

  // Render a typed learning-action response (Stage 2 X-01). We switch on
  // `responseType` only — never on payload shape — and never auto-fetch a
  // follow-up question after an explanation or review.
  const handleLearningResponse = (response: LearningActionResponse) => {
    switch (response.responseType) {
      case "question": {
        const payload = response.payload as LearningActionQuestionPayload;
        const chainId = payload.topic_id ?? selectedChainId ?? "";
        appendAttempt(chainId, learningQuestionToExtractionData(payload));
        return;
      }
      case "friendly_error": {
        const payload = response.payload as LearningActionTextPayload;
        appendSystem(payload?.text ?? FRIENDLY_ERROR_TEXT);
        return;
      }
      // small_talk | scope_redirect | explanation | question_review |
      // clarification are all text-only assistant replies.
      default: {
        const payload = response.payload as LearningActionTextPayload;
        if (payload?.text) appendAssistant(payload.text);
        return;
      }
    }
  };

  const runPrompt = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || isFetching) return;

    // Snapshot the pre-turn thread so we can derive follow-up context and the
    // is_first_turn flag before mutating the store.
    const { entries: priorEntries, contextFloor } =
      useExtractionQuizStore.getState();
    const isFirstTurn = !priorEntries.some((e) => e.kind === "user-prompt");
    // Only echo a current question from the ACTIVE mode. `contextFloor` moves
    // to the end of the thread when the learner switches mode, so follow-ups
    // never attach to a question from the previous mode (Final Handoff §6).
    const lastAttempt = [...priorEntries.slice(contextFloor)]
      .reverse()
      .find(
        (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
          e.kind === "attempt"
      );
    const currentQuestionId =
      lastAttempt?.attempt.question.question.dp_id ?? null;
    const currentOptions = lastAttempt
      ? toCurrentOptions(lastAttempt.attempt.question.question.choices)
      : null;

    appendUserPrompt(text);
    setIsFetching(true);
    try {
      const response = await runLearningAction({
        message: text,
        experience,
        topicId: selectedChainId,
        topicDisplayName: findChainById(selectedChainId)?.label ?? null,
        sessionId,
        currentQuestionId,
        isFirstTurn,
        currentOptions,
        seenQuestionIds: collectSeenQuestionIds(priorEntries),
      });
      handleLearningResponse(response);
    } finally {
      setIsFetching(false);
    }
  };

  // Explicit "Start a question" / "Next question" action (Final Handoff
  // routing). No user bubble is added — the loader then the question is enough.
  const runQuestionAction = async (
    action: "start_question" | "next_question"
  ) => {
    if (isFetching) return;
    const { entries: priorEntries } = useExtractionQuizStore.getState();
    const isFirstTurn = !priorEntries.some((e) => e.kind === "user-prompt");
    setIsFetching(true);
    try {
      const response = await runLearningAction({
        message: "",
        experience,
        topicId: selectedChainId,
        topicDisplayName: findChainById(selectedChainId)?.label ?? null,
        sessionId,
        action,
        seenQuestionIds: collectSeenQuestionIds(priorEntries),
        isFirstTurn,
      });
      handleLearningResponse(response);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await runPrompt(text);
  };

  return (
    <div className="relative flex flex-col overflow-hidden h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-white/55"
      />
      <img
        aria-hidden
        src="/chatBG.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-72 z-1 h-auto w-[220px] max-w-[32vw] select-none object-contain opacity-90 sm:w-[280px] md:w-[340px] lg:w-[400px]"
      />

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
            paddingBottom:
              "max(120px, calc(96px + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          {shouldShowWelcome ? (
            <WelcomeHeader
              selectedChainId={selectedChainId}
              onSelectChain={handleSelectChain}
              onPrompt={runPrompt}
              onStartQuestion={() => runQuestionAction("start_question")}
              isBusy={isFetching}
            />
          ) : (
            <ChatThreadView
              onNextQuestion={() => runQuestionAction("next_question")}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!shouldShowWelcome && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-20 border-t border-zinc-200/70 bg-white/80 px-3 pt-3 pb-3 backdrop-blur-md transition-all duration-500",
            isChatSidebarOpen ? "lg:pl-[316px]" : ""
          )}
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
          }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                {selectedLabel ?? "No topic selected yet"}
              </span>
              <div className="flex items-center gap-2">
                <ExperienceToggle disabled={isFetching} />
                <TopicDropdown
                  selectedChainId={selectedChainId}
                  onSelectChain={handleSelectChain}
                />
              </div>
            </div>
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
              <textarea
                value={draft}
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
                aria-label="Send"
                className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
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
}: {
  onNextQuestion: () => void;
}) {
  const entries = useExtractionQuizStore((s) => s.entries);
  const isFetching = useExtractionQuizStore((s) => s.isFetching);

  // Offer "Next question" once at least one question has been shown, so the
  // learner can advance without typing (Final Handoff action-driven flow).
  const hasAttempt = entries.some((e) => e.kind === "attempt");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-2 pt-4 sm:px-4">
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

        return (
          <div key={entry.id} className="flex justify-start mb-4">
            <div className="w-full max-w-[95%]">
              <ExtractionQuestionCard attempt={entry.attempt} />
            </div>
          </div>
        );
      })}

      {isFetching && (
        <div className="flex justify-start mb-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
            Preparing question...
          </div>
        </div>
      )}

      {hasAttempt && !isFetching && (
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
