// Public "Feedback" page submission (spec A-07 / backend H-15).
// Reason values persist exactly as the approved labels.
export const BETA_FEEDBACK_REASONS = [
  "Bug Report",
  "Question",
  "Suggestion",
  "Other",
] as const;

export type BetaFeedbackReason = (typeof BETA_FEEDBACK_REASONS)[number];

export type BetaFeedbackInput = {
  name: string;
  email: string;
  reason: BetaFeedbackReason;
  message: string;
};

export type BetaFeedbackResult = {
  success: boolean;
};
