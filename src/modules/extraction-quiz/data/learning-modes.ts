import type { LearningExperience } from "../types";

// The three learner-facing experiences, in the order shown in the mode
// switcher. Tutor is the starting page (QuizRx beta review, Oct 2026).
export type LearningModeMeta = {
  value: LearningExperience;
  label: string;
  // Used where the full label does not fit (narrow phones).
  shortLabel: string;
  description: string;
};

export const LEARNING_MODES: readonly LearningModeMeta[] = [
  {
    value: "tutor",
    label: "Tutor",
    shortLabel: "Tutor",
    description: "What would you like to understand about calcium and bone?",
  },
  {
    value: "practice_studio",
    label: "Practice Studio",
    shortLabel: "Practice",
    description:
      "Reinforce essential knowledge with short-answer recall questions.",
  },
  {
    value: "reasoning",
    label: "QuizRx Reasoning",
    shortLabel: "Reasoning",
    description:
      "30 curated clinical questions. Work through them at your own pace.",
  },
] as const;

export const MODE_LABELS: Record<LearningExperience, string> = {
  reasoning: "QuizRx Reasoning",
  practice_studio: "Practice Studio",
  tutor: "Tutor",
};

export const getModeMeta = (mode: LearningExperience): LearningModeMeta =>
  LEARNING_MODES.find((m) => m.value === mode) ?? LEARNING_MODES[0];

export type QuestionExperience = "reasoning" | "practice_studio";

export const isConversationalMode = (
  mode: LearningExperience | null
): boolean => mode === "tutor";

export const isQuestionMode = (
  mode: LearningExperience | null
): mode is QuestionExperience =>
  mode === "reasoning" || mode === "practice_studio";

export const getModeLabel = (mode: LearningExperience | null): string | null =>
  mode ? MODE_LABELS[mode] : null;
