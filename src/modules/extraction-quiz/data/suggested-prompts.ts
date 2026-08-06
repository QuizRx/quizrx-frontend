// Configurable suggested-prompt panel (spec A-12). The final prompt set will
// be supplied separately by Ramy; keep this list data-driven so the labels can
// change without touching the panel layout.
//
// `label` is what the user sees. `intent` is what we submit to the backend as
// the message text (currently identical). The selected topic is applied in the
// background by the chat surface, so it must NOT be baked into these labels.
export type SuggestedPrompt = {
  id: string;
  label: string;
  intent: string;
};

export const SUGGESTED_PROMPTS: readonly SuggestedPrompt[] = [
  {
    id: "generate",
    label: "Generate a clinical question",
    intent: "Generate a clinical question",
  },
  { id: "quiz", label: "Quiz me", intent: "Quiz me" },
  {
    id: "explain",
    label: "Explain a concept",
    intent: "Explain a concept",
  },
  {
    id: "review",
    label: "Review a question",
    intent: "Review a question",
  },
] as const;
