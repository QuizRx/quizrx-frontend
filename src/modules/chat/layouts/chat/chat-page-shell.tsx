"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { TopicChangeDialog } from "@/modules/extraction-quiz/components/topic-change-dialog";
import { useExtractionQuiz } from "@/modules/extraction-quiz/hooks/use-extraction-quiz";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type { ExtractionEntry } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import { useArchivedSessionsStore } from "@/modules/extraction-quiz/store/archived-sessions-store";
import {
  APPROVED_RESPONSES,
  classifyScope,
  classifySmallTalk,
  isComparisonRequest,
  scopeReply,
  smallTalkReply,
} from "@/modules/extraction-quiz/utils/small-talk";
import {
  useChainPoolLoading,
  useChainPoolWarmedAt,
} from "@/modules/extraction-quiz/store/chain-pool-store";
import { WelcomeHeader } from "./welcome-header";

type ChatPageShellProps = {
  showWelcomeWhenEmpty?: boolean;
};

const DONT_ASK_KEY = "quizrx-topic-change-dont-ask";

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
  const isFetching = useExtractionQuizStore((s) => s.isFetching);
  const archiveSession = useArchivedSessionsStore((s) => s.archive);
  const { fetchQuestion, warmChain } = useExtractionQuiz();
  const isWarmingPool = useChainPoolLoading(selectedChainId);
  const poolWarmedAt = useChainPoolWarmedAt(selectedChainId);

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

  // Kick off (or top up) the content-aware pool for the selected chain.
  useEffect(() => {
    if (!selectedChainId) return;
    void warmChain(selectedChainId);
  }, [selectedChainId, warmChain]);

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

  const runPrompt = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || isFetching) return;

    const topicLabel = findChainById(selectedChainId)?.label ?? null;

    // 1. Small talk → warm conversational reply, no question generated.
    const smallTalkKind = classifySmallTalk(text);
    if (smallTalkKind) {
      appendUserPrompt(text);
      appendAssistant(smallTalkReply(smallTalkKind, { topicLabel }));
      return;
    }

    // 2. Outside QuizRx scope → approved redirect, no question generated.
    const scope = classifyScope(text);
    if (scope) {
      appendUserPrompt(text);
      appendAssistant(scopeReply(scope));
      return;
    }

    // 3. Comparison request → approved redirect, then a comparison-style
    //    question in the current topic when one is selected.
    if (isComparisonRequest(text)) {
      appendUserPrompt(text);
      appendAssistant(APPROVED_RESPONSES.comparisonRedirect);
      if (selectedChainId) {
        await fetchQuestion(selectedChainId, { userPrompt: text });
      }
      return;
    }

    // 4. QuizRx learning action.
    if (!selectedChainId) {
      toast({
        title: "Choose a topic",
        description: "Choose a topic from the Choose Topic menu to begin.",
      });
      return;
    }
    appendUserPrompt(text);
    await fetchQuestion(selectedChainId, { userPrompt: text });
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
              isBusy={isFetching}
            />
          ) : (
            <ChatThreadView />
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
                {selectedChainId && isWarmingPool && !poolWarmedAt && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Preparing questions
                  </span>
                )}
              </span>
              <TopicDropdown
                selectedChainId={selectedChainId}
                onSelectChain={handleSelectChain}
              />
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

function ChatThreadView() {
  const entries = useExtractionQuizStore((s) => s.entries);
  const isFetching = useExtractionQuizStore((s) => s.isFetching);

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
    </div>
  );
}
