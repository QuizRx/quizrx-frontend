"use client";

import { TopicDropdown } from "@/modules/extraction-quiz";
import { ModeSelectionCards } from "@/modules/extraction-quiz/components/mode-selection-cards";
import { LEARNING_MODES } from "@/modules/extraction-quiz/data/learning-modes";

type WelcomeHeaderProps = {
  selectedChainId: string | null;
  onSelectChain: (chainId: string | null) => void;
  isBusy?: boolean;
};

export const WelcomeHeader = ({
  selectedChainId,
  onSelectChain,
  isBusy = false,
}: WelcomeHeaderProps) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 md:pt-8">
      <header className="mb-6">
        <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          Calcium &amp; Bone
        </span>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
          Questions That Make You Think.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">
          Choose an experience and a topic to begin.
        </p>
      </header>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Choose an experience
        </h2>
        <ModeSelectionCards disabled={isBusy} modes={LEARNING_MODES} />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Choose a topic
        </h2>
        <TopicDropdown
          selectedChainId={selectedChainId}
          onSelectChain={onSelectChain}
        />
      </div>
    </section>
  );
};
