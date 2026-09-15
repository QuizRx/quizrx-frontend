// Approved exam-preparation options (spec A-06 / H-14). Values must persist
// exactly as written. Shared so the sign-up form and any future surfaces stay
// consistent with the backend-accepted values.
export const EXAM_PREPARATION_OPTIONS = [
  "EBEEDM",
  "UK SCE Endocrinology & Diabetes",
  "Both",
  "Other",
  "Not currently preparing for an exam",
] as const;

export type ExamPreparation = (typeof EXAM_PREPARATION_OPTIONS)[number];
