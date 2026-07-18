"use client";

import { ArrowUp, FileText, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import { TopicDropdown } from "@/modules/extraction-quiz";

type WelcomeHeaderProps = {
  selectedChainId: string | null;
  onSelectChain: (chainId: string) => void;
  onPrompt: (prompt: string) => Promise<void> | void;
  isBusy?: boolean;
};

const SUGGESTED_PROMPTS = [
  { icon: FileText, label: "Generate a question on this topic" },
  { icon: UserRound, label: "Test me on this topic" },
] as const;

export const WelcomeHeader = ({
  selectedChainId,
  onSelectChain,
  onPrompt,
  isBusy = false,
}: WelcomeHeaderProps) => {
  const [draft, setDraft] = useState("");

  const handleSendDraft = async () => {
    const value = draft.trim();
    if (!value) return;
    setDraft("");
    await onPrompt(value);
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    await onPrompt(prompt);
  };

  const canSend = !isBusy && draft.trim().length > 0;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-8 md:pt-14">
      <header className="mb-7 text-center">
        <span
          aria-hidden
          className="mx-auto mb-4 inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
        />
        <h1 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
          Calcium &amp; Bone Module
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
          Pick a topic and start whenever you&apos;re ready. Ask for a question
          or get tested on any calcium and bone topic.
        </p>
      </header>

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-900/5 ring-1 ring-black/5 transition-shadow focus-within:border-[var(--primary)]/40 focus-within:ring-2 focus-within:ring-[var(--primary)]/25 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            AI Chat
          </h2>
          <TopicDropdown
            selectedChainId={selectedChainId}
            onSelectChain={onSelectChain}
          />
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendDraft();
            }
          }}
          placeholder="Ask me to generate a question or test you."
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

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Try one of these
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((s) => (
            <Button
              key={s.label}
              variant="outline"
              disabled={isBusy}
              onClick={() => handleSuggestedPrompt(s.label)}
              className="h-auto justify-start gap-3 rounded-2xl border-zinc-200 bg-white px-4 py-3 text-left text-sm font-normal text-zinc-700 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-amber,#E0B16A)]/30 text-[var(--primary)]">
                <s.icon className="h-4 w-4" />
              </span>
              <span>{s.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
        During this closed beta, QuizRx stores your account details, chat
        history, and generated questions. Read more in our{" "}
        <Link href="/privacy-policy" className="text-[var(--primary)] underline">
          privacy notice
        </Link>
        .
      </p>
    </section>
  );
};
