"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import {
  findChainById,
  TopicDropdown,
} from "@/modules/extraction-quiz";
import { ExtractionQuestionCard } from "@/modules/extraction-quiz/components/extraction-question-card";
import { useExtractionQuiz } from "@/modules/extraction-quiz/hooks/use-extraction-quiz";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import {
  classifySmallTalk,
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

export function ChatPageShell({
  showWelcomeWhenEmpty = false,
}: ChatPageShellProps) {
  const { isChatSidebarOpen } = useChatSidebar();
  const entries = useExtractionQuizStore((s) => s.entries);
  const selectedChainId = useExtractionQuizStore((s) => s.selectedChainId);
  const setSelectedChainId = useExtractionQuizStore(
    (s) => s.setSelectedChainId
  );
  const appendUserPrompt = useExtractionQuizStore((s) => s.appendUserPrompt);
  const appendAssistant = useExtractionQuizStore((s) => s.appendAssistant);
  const isFetching = useExtractionQuizStore((s) => s.isFetching);
  const { fetchQuestion, warmChain } = useExtractionQuiz();
  const isWarmingPool = useChainPoolLoading(selectedChainId);
  const poolWarmedAt = useChainPoolWarmedAt(selectedChainId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (entries.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries.length, isFetching]);

  // Kick off (or top up) the content-aware pool for the selected chain.
  // warmChain is a no-op when the pool is already loaded or in flight, so
  // it's safe to fire on every selection change.
  useEffect(() => {
    if (!selectedChainId) return;
    void warmChain(selectedChainId);
  }, [selectedChainId, warmChain]);

  const hasEntries = entries.length > 0;
  const shouldShowWelcome = showWelcomeWhenEmpty && !hasEntries;

  const runPrompt = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || isFetching) return;

    // Small-talk ("hi", "thanks", "bye", "what can you do") gets a conversational
    // reply instead of consuming a question. Handled before the topic check so a
    // greeting works even when no topic is selected yet.
    const smallTalkKind = classifySmallTalk(text);
    if (smallTalkKind) {
      const isFirstTurn = !entries.some(
        (e) => e.kind === "assistant" || e.kind === "attempt"
      );
      appendUserPrompt(text);
      appendAssistant(
        smallTalkReply(smallTalkKind, {
          isFirstTurn,
          topicLabel: findChainById(selectedChainId)?.label ?? null,
        })
      );
      return;
    }

    if (!selectedChainId) {
      toast({
        title: "Pick a topic",
        description:
          "Choose a topic from the Explore Topics dropdown to begin.",
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
    <div className="relative flex flex-col overflow-hidden h-[100vh]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-white/55"
      />
      <img
        aria-hidden
        src="/chatBG.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-72 z-1 h-auto w-[280px] max-w-[40vw] select-none object-contain sm:w-[360px] md:w-[440px] lg:w-[520px]"
      />

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col min-h-0 transition-all duration-500",
          isChatSidebarOpen ? "lg:pl-[300px]" : "",
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
              onSelectChain={setSelectedChainId}
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
            isChatSidebarOpen ? "lg:pl-[316px]" : "",
          )}
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
          }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                {findChainById(selectedChainId)?.label ??
                  "No topic selected yet"}
                {selectedChainId && isWarmingPool && !poolWarmedAt && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Preparing questions
                  </span>
                )}
              </span>
              <TopicDropdown
                selectedChainId={selectedChainId}
                onSelectChain={setSelectedChainId}
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
                placeholder="Ask me to generate questions or test you."
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
            Fetching question...
          </div>
        </div>
      )}
    </div>
  );
}
