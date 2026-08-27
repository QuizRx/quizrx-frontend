"use client";

import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import {
  type ArchivedSession,
  type ExtractionEntry,
  findChainById,
  useArchivedSessionsStore,
  useExtractionQuizStore,
} from "@/modules/extraction-quiz";

const deriveSessionTitle = (
  chainId: string | null,
  entries: ExtractionEntry[]
): string => {
  const chain = findChainById(chainId);
  if (chain) return chain.label;

  const firstAttempt = entries.find((e) => e.kind === "attempt");
  if (firstAttempt && firstAttempt.kind === "attempt") {
    const chainFromAttempt = findChainById(firstAttempt.attempt.chainId);
    if (chainFromAttempt) return chainFromAttempt.label;
  }

  const firstPrompt = entries.find((e) => e.kind === "user-prompt");
  if (firstPrompt && firstPrompt.kind === "user-prompt") {
    const text = firstPrompt.content.trim();
    return text.length > 40 ? `${text.slice(0, 40)}…` : text;
  }

  return "Untitled session";
};

export function ChatHistorySidebar() {
  const { isChatSidebarOpen, closeChatSidebar } = useChatSidebar();
  // The desktop docked panel only appears at lg+ (matching the content's
  // `lg:pl-[300px]` offset). Below lg — including tablets — the sidebar must
  // render as an overlay drawer, otherwise toggling it does nothing.
  const [isOverlay, setIsOverlay] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsOverlay(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const entries = useExtractionQuizStore((s) => s.entries);
  const sessionId = useExtractionQuizStore((s) => s.sessionId);
  const selectedChainId = useExtractionQuizStore((s) => s.selectedChainId);
  const resetSession = useExtractionQuizStore((s) => s.resetSession);
  const loadSession = useExtractionQuizStore((s) => s.loadSession);

  const archivedSessions = useArchivedSessionsStore((s) => s.sessions);
  const archiveSession = useArchivedSessionsStore((s) => s.archive);
  const removeArchivedSession = useArchivedSessionsStore((s) => s.remove);

  const recentAttempts = useMemo(
    () =>
      entries
        .filter(
          (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
            e.kind === "attempt"
        )
        .slice()
        .reverse(),
    [entries]
  );

  const archiveCurrentIfNeeded = () => {
    if (entries.length === 0) return;
    archiveSession({
      sessionId,
      chainId: selectedChainId,
      title: deriveSessionTitle(selectedChainId, entries),
      entries,
    });
  };

  const handleNewSession = () => {
    archiveCurrentIfNeeded();
    resetSession();
    if (isOverlay) closeChatSidebar();
  };

  const handleLoadArchived = (archived: ArchivedSession) => {
    if (archived.sessionId === sessionId) {
      if (isOverlay) closeChatSidebar();
      return;
    }
    archiveCurrentIfNeeded();
    // Pull the clicked session out of the archive — it becomes the current.
    removeArchivedSession(archived.sessionId);
    loadSession({
      sessionId: archived.sessionId,
      chainId: archived.chainId,
      entries: archived.entries,
    });
    if (isOverlay) closeChatSidebar();
  };

  const handleDeleteArchived = (
    e: React.MouseEvent<HTMLButtonElement>,
    archived: ArchivedSession
  ) => {
    e.stopPropagation();
    removeArchivedSession(archived.sessionId);
  };

  return (
    <AnimatePresence>
      {isChatSidebarOpen && (
        <>
          {isOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={closeChatSidebar}
            />
          )}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "border-r border-border bg-white/80 backdrop-blur-md",
              isOverlay
                ? "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] shadow-xl"
                : "fixed left-0 top-[56px] bottom-0 z-30 w-[300px] hidden lg:block"
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-2 text-[var(--primary)]">
                  <ChatBubbleIcon className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">History</h2>
                </div>
                {isOverlay && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeChatSidebar}
                    aria-label="Close history"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="border-b border-zinc-200 p-3">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-dashed border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/5"
                  onClick={handleNewSession}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>New session</span>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                <section>
                  <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                    Current session
                  </p>
                  {recentAttempts.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                      No questions yet. Pick a topic and ask a question to begin.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {recentAttempts.map((entry) => {
                        const chain = findChainById(entry.attempt.chainId);
                        const status =
                          entry.attempt.selectedIndex === null
                            ? "Unanswered"
                            : entry.attempt.isCorrect
                            ? "Correct"
                            : "Incorrect";
                        return (
                          <li
                            key={entry.id}
                            className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3 text-sm shadow-sm"
                          >
                            <p className="text-xs font-medium text-[var(--primary)]">
                              {chain?.label ?? "Practice question"}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-700">
                              {entry.attempt.question.question.question}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                              <span>
                                {formatDistanceToNow(
                                  new Date(entry.attempt.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5",
                                  entry.attempt.selectedIndex === null
                                    ? "bg-zinc-100 text-zinc-500"
                                    : entry.attempt.isCorrect
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                )}
                              >
                                {status}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {archivedSessions.length > 0 && (
                  <section>
                    <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      Past sessions
                    </p>
                    <ul className="space-y-2">
                      {archivedSessions.map((archived) => {
                        const isActive = archived.sessionId === sessionId;
                        return (
                          <li key={archived.sessionId}>
                            <button
                              type="button"
                              onClick={() => handleLoadArchived(archived)}
                              className={cn(
                                "group w-full rounded-lg border p-3 text-left text-sm shadow-sm transition-colors",
                                isActive
                                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                                  : "border-zinc-200 bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="line-clamp-2 text-xs font-medium text-[var(--primary)]">
                                  {archived.title}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleDeleteArchived(e, archived)
                                  }
                                  aria-label="Delete session"
                                  className="opacity-0 transition-opacity group-hover:opacity-100 text-zinc-400 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="mt-1 text-[10px] text-zinc-400">
                                {archived.attemptCount} question
                                {archived.attemptCount === 1 ? "" : "s"} ·{" "}
                                {formatDistanceToNow(
                                  new Date(archived.archivedAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
