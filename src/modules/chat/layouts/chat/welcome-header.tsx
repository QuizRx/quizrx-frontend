"use client";

import { cn } from "@/core/lib/utils";
import { findChainById, TopicDropdown } from "@/modules/extraction-quiz";
import { ModeSelectionCards } from "@/modules/extraction-quiz/components/mode-selection-cards";
import { SuggestedPromptsPanel } from "@/modules/extraction-quiz/components/suggested-prompts-panel";
import {
  QUESTION_MODES,
  TUTOR_MODE,
  getModeLabel,
  isConversationalMode,
  isQuestionMode,
} from "@/modules/extraction-quiz/data/learning-modes";
import { TUTOR_SUGGESTED_PROMPTS } from "@/modules/extraction-quiz/data/suggested-prompts";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";

type WelcomeHeaderProps = {
  selectedChainId: string | null;
  onSelectChain: (chainId: string | null) => void;
  onPrompt: (prompt: string) => Promise<void> | void;
  onStartQuestion: () => Promise<void> | void;
  onEnterTutor: () => void;
  isBusy?: boolean;
};

const buildGreeting = (
  modeLabel: string | null,
  topicLabel: string | null,
  isTutor: boolean
): string => {
  if (!modeLabel) {
    return "QuizRx asks you questions in Reasoning or Practice Studio. You ask QuizRx questions in Tutor.";
  }
  if (isTutor) {
    if (!topicLabel) {
      return "You're in Tutor. Pick a Calcium & Bone topic, then ask me to explain a concept, compare two conditions, or review what matters most.";
    }
    return `You're in Tutor for ${topicLabel}. Ask me to explain, compare, elaborate, or review — this is not a question generator.`;
  }
  if (!topicLabel) {
    return `You're in ${modeLabel}. Choose a Calcium & Bone topic, then use Start to begin. The chat box below is for Tutor.`;
  }
  return `You're in ${modeLabel}, exploring ${topicLabel}. Use Start or Next question — you don't need to type "quiz me."`;
};

export const WelcomeHeader = ({
  selectedChainId,
  onSelectChain,
  onPrompt,
  onStartQuestion,
  onEnterTutor,
  isBusy = false,
}: WelcomeHeaderProps) => {
  const experience = useExtractionQuizStore((s) => s.experience);
  const setExperience = useExtractionQuizStore((s) => s.setExperience);
  const selectedLabel = findChainById(selectedChainId)?.label ?? null;
  const modeLabel = getModeLabel(experience);
  const isTutor = isConversationalMode(experience);
  const greeting = buildGreeting(modeLabel, selectedLabel, isTutor);
  const canStartQuestion =
    !isBusy && isQuestionMode(experience) && Boolean(selectedChainId);
  const startLabel =
    experience === "practice_studio" ? "Start Practice" : "Start a question";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 md:pt-8">
      <header className="mb-4">
        <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          Calcium &amp; Bone
        </span>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
          Questions That Make You Think.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">
          {greeting}
        </p>
      </header>

      <div className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Choose a question experience
        </h2>
        <ModeSelectionCards disabled={isBusy} modes={QUESTION_MODES} />
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

      {isQuestionMode(experience) && (
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
            {startLabel}
          </button>
          {!canStartQuestion && !isBusy && (
            <p className="mt-2 text-xs text-zinc-500">
              {selectedChainId
                ? "Choose QuizRx Reasoning or Practice Studio to begin."
                : "Choose a Calcium & Bone topic to begin."}
            </p>
          )}
        </div>
      )}

      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setExperience("tutor");
            onEnterTutor();
          }}
          className={cn(
            "w-full rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
            isTutor
              ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
              : "border-zinc-200 bg-white hover:border-[var(--primary)]/50"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--primary)]">
              {TUTOR_MODE.label}
            </span>
            {TUTOR_MODE.badge && (
              <span className="inline-flex w-fit items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                {TUTOR_MODE.badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            {TUTOR_MODE.description}
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            Using the chat box below switches you into Tutor. Your Reasoning and
            Practice Studio questions stay where you left them.
          </p>
        </button>
      </div>

      {isTutor && (
        <SuggestedPromptsPanel
          onSelect={onPrompt}
          disabled={isBusy}
          prompts={TUTOR_SUGGESTED_PROMPTS}
          title="Try asking"
          className="mb-4"
        />
      )}
    </section>
  );
};
