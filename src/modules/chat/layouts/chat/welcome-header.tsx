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

  const isFetching = isBusy;

  const suggestions = [
    {
      icon: FileText,
      label: "Generate a question on this topic",
    },
    {
      icon: UserRound,
      label: "Test me on this topic",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] md:items-start">
        <div className="hidden md:block">
          <img
            src="/images/about-us.png"
            alt="Calcium & Bone module illustration"
            className="w-full rounded-2xl object-cover opacity-90"
          />
        </div>

        <div className="space-y-5">
          <div>
            <span
              aria-hidden
              className="mb-3 inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
            />
            <h1 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
              Calcium &amp; Bone Module
            </h1>
            <div className="mt-3 space-y-1 text-sm text-zinc-700">
              <p>Welcome to the beta for our first module.</p>
              <p>This beta includes content on calcium and bone disorders only.</p>
              <p>
                Ask the model to generate questions or test you on any topic
                within this module.
              </p>
              <p>Your feedback will help us make QuizRx better.</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Privacy notice: QuizRx stores your account details, chat history,
              and generated questions during this closed beta. Read more in our{" "}
              <Link href="/privacy-policy" className="text-[var(--primary)] underline">
                privacy notice
              </Link>
              .
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--primary)]">
                AI Chat
              </h2>
              <TopicDropdown
                selectedChainId={selectedChainId}
                onSelectChain={onSelectChain}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendDraft();
                  }
                }}
                placeholder="Ask me to generate questions or test you."
                rows={3}
                disabled={isFetching}
                className="w-full resize-none rounded-2xl bg-transparent p-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
              />
              <div className="flex items-center justify-end px-3 pb-3">
                <button
                  type="button"
                  onClick={handleSendDraft}
                  disabled={isFetching || !draft.trim()}
                  aria-label="Send"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-opacity",
                    (isFetching || !draft.trim()) && "opacity-60"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-600">
              Suggested Prompts
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {suggestions.map((s) => (
                <Button
                  key={s.label}
                  variant="outline"
                  disabled={isFetching}
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
        </div>
      </div>
    </section>
  );
};
