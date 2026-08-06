"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/core/lib/utils";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { SuggestedPromptsPanel } from "@/modules/extraction-quiz/components/suggested-prompts-panel";

type WelcomeHeaderProps = {
  selectedChainId: string | null;
  onSelectChain: (chainId: string | null) => void;
  onPrompt: (prompt: string) => Promise<void> | void;
  isBusy?: boolean;
};

export const WelcomeHeader = ({
  selectedChainId,
  onSelectChain,
  onPrompt,
  isBusy = false,
}: WelcomeHeaderProps) => {
  const [draft, setDraft] = useState("");
  const selectedLabel = findChainById(selectedChainId)?.label ?? null;

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
          <header className="mb-6">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              Calcium &amp; Bone
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
              Questions That Make You Think.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
              Choose a topic (optional), then type a request - or start with a
              suggested prompt.
            </p>
          </header>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Ask QuizRx
            </h2>
            <TopicDropdown
              selectedChainId={selectedChainId}
              onSelectChain={onSelectChain}
            />
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
