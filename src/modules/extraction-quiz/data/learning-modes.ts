import type { LearningExperience } from "../types";

// The two learner-facing experiences (Final Handoff §7). Copy is fixed and
// must match the approved wording. Practice Studio is explicitly labelled
// short-answer so the format is clear before the learner begins.
export type LearningModeMeta = {
  value: LearningExperience;
  label: string;
  description: string;
  badge?: string;
};

export const LEARNING_MODES: readonly LearningModeMeta[] = [
  {
    value: "reasoning",
    label: "QuizRx Reasoning",
    description:
      "Work through curated clinical decisions and detailed explanations.",
  },
  {
    value: "practice_studio",
    label: "Practice Studio",
    description:
      "Reinforce essential knowledge with short-answer recall questions.",
    badge: "Short-answer",
  },
] as const;

export const MODE_LABELS: Record<LearningExperience, string> = {
  reasoning: "QuizRx Reasoning",
  practice_studio: "Practice Studio",
};

export const getModeLabel = (mode: LearningExperience | null): string | null =>
  mode ? MODE_LABELS[mode] : null;
