"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { SUGGESTED_PROMPTS } from "../data/suggested-prompts";

type SuggestedPromptsPanelProps = {
  onSelect: (intent: string) => void;
  disabled?: boolean;
  className?: string;
};

// Configurable vertical suggested-prompts panel (spec A-12). Labels are
// data-driven (see data/suggested-prompts.ts). The selected topic is applied
// in the background by the chat surface, so it is intentionally not shown here.
export function SuggestedPromptsPanel({
  onSelect,
  disabled = false,
  className,
}: SuggestedPromptsPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-[var(--primary)]">
        <Sparkles className="h-4 w-4" />
        <h2 className="text-sm font-semibold">Suggested prompts</h2>
      </div>
      <div className="flex flex-col gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt.intent)}
            className={cn(
              "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
