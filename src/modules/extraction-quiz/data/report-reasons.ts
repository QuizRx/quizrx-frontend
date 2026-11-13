// Approved "Report this question" reasons (spec A-14 / H-13, wire format per
// X-01 Integration Contract).
//
// The X-01 contract fixes the exact set of `reason` values sent to the backend
// as snake_case tokens. We keep a friendly display label for the UI, but the
// value that goes over the wire is always the token below. `ReportReason` is
// the wire (token) type — that's what the feedback payload carries.
export const REPORT_REASONS = [
  { value: "incorrect_answer", label: "Incorrect answer" },
  { value: "explanation_unclear", label: "Explanation unclear" },
  { value: "question_unclear", label: "Question unclear" },
  { value: "typo", label: "Typo" },
  { value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
