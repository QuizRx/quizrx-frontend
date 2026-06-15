import { BaseEntityProps } from "@/core/types/api/api";

export enum FeedbackCategory {
  GENERAL = "GENERAL",
  BUG = "BUG",
  FEATURE_REQUEST = "FEATURE_REQUEST",
  UX = "UX",
  CONTENT = "CONTENT",
}

export type Feedback = BaseEntityProps & {
  userId: string;
  rating: number;
  category: FeedbackCategory;
  message?: string | null;
  pagePath?: string | null;
  userAgent?: string | null;
};

export type SubmitFeedbackInput = {
  rating: number;
  category?: FeedbackCategory;
  message?: string;
  pagePath?: string;
  userAgent?: string;
};

export const FEEDBACK_CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  [FeedbackCategory.GENERAL]: "General",
  [FeedbackCategory.BUG]: "Bug report",
  [FeedbackCategory.FEATURE_REQUEST]: "Feature request",
  [FeedbackCategory.UX]: "UX / Design",
  [FeedbackCategory.CONTENT]: "Content quality",
};
