// Starter prompts on the Tutor start page. `label` is what the learner sees;
// `intent` is the message sent to Tutor (currently identical). Tutor works
// across the whole Calcium & Bone module, so prompts never depend on a topic.
export type SuggestedPrompt = {
  id: string;
  label: string;
  intent: string;
};

export const TUTOR_STARTER_PROMPTS: readonly SuggestedPrompt[] = [
  {
    id: "pth-calcium",
    label: "Explain how PTH controls calcium",
    intent: "Explain how PTH controls calcium",
  },
  {
    id: "hyperparathyroidism",
    label: "Compare primary and secondary hyperparathyroidism",
    intent: "Compare primary and secondary hyperparathyroidism",
  },
  {
    id: "magnesium",
    label: "Why can low magnesium cause hypocalcaemia?",
    intent: "Why can low magnesium cause hypocalcaemia?",
  },
] as const;
