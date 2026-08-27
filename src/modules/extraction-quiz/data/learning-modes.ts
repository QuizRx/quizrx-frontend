import type { LearningExperience } from "../types";

// The three learner-facing experiences (Final Handoff §7). Copy is fixed and
// must match the approved wording. Practice Studio is explicitly labelled
// short-answer so the format is clear before the learner begins; Tutor is a
// conversational teaching mode rather than a question generator.
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
  {
    value: "tutor",
    label: "Tutor",
    description:
      "Chat with a medical tutor to explain concepts, compare conditions, and review topics.",
    badge: "Conversational",
  },
] as const;

export const MODE_LABELS: Record<LearningExperience, string> = {
  reasoning: "QuizRx Reasoning",
  practice_studio: "Practice Studio",
  tutor: "Tutor",
};

// Tutor is a conversation, not an action-driven question flow. Callers use this
// to hide question affordances (Start / Next question) and treat the chat box
// as the primary surface.
export const isConversationalMode = (
  mode: LearningExperience | null
): boolean => mode === "tutor";

export const getModeLabel = (mode: LearningExperience | null): string | null =>
  mode ? MODE_LABELS[mode] : null;
