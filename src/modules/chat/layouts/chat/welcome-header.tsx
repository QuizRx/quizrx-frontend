"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/core/lib/utils";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { ModeSelectionCards } from "@/modules/extraction-quiz/components/mode-selection-cards";
import { SuggestedPromptsPanel } from "@/modules/extraction-quiz/components/suggested-prompts-panel";
import { getModeLabel } from "@/modules/extraction-quiz/data/learning-modes";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";

type WelcomeHeaderProps = {
  selectedChainId: string | null;
  onSelectChain: (chainId: string | null) => void;
  onPrompt: (prompt: string) => Promise<void> | void;
  onStartQuestion: () => Promise<void> | void;
  isBusy?: boolean;
};

// Approved greeting copy (Final Handoff Appendix A), driven by the explicit
// mode + topic selection.
const buildGreeting = (
  modeLabel: string | null,
  topicLabel: string | null
): string => {
  if (!modeLabel) {
    return "Hello! Welcome to QuizRx. Choose QuizRx Reasoning or Practice Studio, then select a Calcium & Bone topic to begin.";
  }
  if (!topicLabel) {
    return `Hello! You're in ${modeLabel}. Choose a Calcium & Bone topic to begin, or tell me what you would like to review.`;
  }
  return `Hello! You're in ${modeLabel}, exploring ${topicLabel}. Start a question, ask for an explanation, or use one of the suggested prompts.`;
};

export const WelcomeHeader = ({
  selectedChainId,
  onSelectChain,
  onPrompt,
  onStartQuestion,
  isBusy = false,
}: WelcomeHeaderProps) => {
  const [draft, setDraft] = useState("");
  const experience = useExtractionQuizStore((s) => s.experience);
  const selectedLabel = findChainById(selectedChainId)?.label ?? null;
  const modeLabel = getModeLabel(experience);
  const greeting = buildGreeting(modeLabel, selectedLabel);
  // Both an explicit mode and a topic are required before a question can be
  // served (Final Handoff §6/§8).
  const canStartQuestion = !isBusy && Boolean(experience) && Boolean(selectedChainId);

  const placeholder = selectedLabel
    ? `Ask anything about ${selectedLabel}...`
    : "Ask QuizRx anything...";

  const handleSendDraft = async () => {
    const value = draft.trim();
    if (!value) return;
    setDraft("");
    await onPrompt(value);
  };

  const canSend = !isBusy && draft.trim().length > 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 md:pt-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* Main column: heading -> instruction -> topic -> chat box */}
        <div className="min-w-0">
          <header className="mb-5">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              Calcium &amp; Bone
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
              Questions That Make You Think.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
              {greeting}
            </p>
          </header>

          {/* Two-experience chooser, above the topic selector and chat (§7). */}
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Choose how you want to learn
            </h2>
            <ModeSelectionCards disabled={isBusy} />
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Choose a topic
            </h2>
            <TopicDropdown
              selectedChainId={selectedChainId}
              onSelectChain={onSelectChain}
            />
          </div>

          {/* Action-driven start: serve the first question without typing. */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => onStartQuestion()}
              disabled={!canStartQuestion}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--primary)]/90",
                !canStartQuestion && "cursor-not-allowed opacity-50"
              )}
            >
              Start a question
            </button>
            {!canStartQuestion && !isBusy && (
              <p className="mt-2 text-xs text-zinc-500">
                {experience
                  ? "Choose a Calcium & Bone topic to begin."
                  : "Choose a learning mode and a topic to begin."}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-900/5 ring-1 ring-black/5 transition-shadow focus-within:border-[var(--primary)]/40 focus-within:ring-2 focus-within:ring-[var(--primary)]/25 md:p-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendDraft();
                }
              }}
              placeholder={placeholder}
              rows={4}
              disabled={isBusy}
              autoFocus
              className="w-full resize-none bg-transparent px-1 text-base leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-400">
                Press Enter to send · Shift + Enter for a new line
              </span>
              <button
                type="button"
                onClick={handleSendDraft}
                disabled={!canSend}
                aria-label="Send"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm transition-all hover:bg-[var(--primary)]/90",
                  !canSend && "opacity-50"
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested prompts: right on desktop, below the chat box on mobile */}
        <SuggestedPromptsPanel
          onSelect={onPrompt}
          disabled={isBusy}
          className="lg:sticky lg:top-4"
        />
      </div>
    </section>
  );
};
