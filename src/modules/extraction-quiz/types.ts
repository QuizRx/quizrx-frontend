export type QuestionFormat = "mcq" | "short_answer";

// One rendered explanation section for a curated Reasoning item
// (Final Handoff §8). Either a prose `body` or, for the "why the other options
// fail" section, a list of per-option explanations.
export type ExplanationSectionOption = {
  option: string;
  text: string;
};

export type ExplanationSection = {
  id?: string;
  heading: string;
  body?: string;
  options?: ExplanationSectionOption[];
};

export type ExtractionQuestion = {
  question: string;
  choices: string[];
  answer: string;
  option_trap_ids: (string | null)[];
  dp_id: string;
  concept_target: string;
  topic?: string;
  sub_topic?: string;
  // Render format (X-01). "mcq" = multiple choice (QuizRx Reasoning / curated);
  // "short_answer" = free-text input + submit (Practice Studio). Absent for the
  // legacy extraction path, which is always MCQ.
  format?: QuestionFormat;
  // Structured explanation for curated Reasoning items (Final Handoff §8).
  // Rendered in order after the learner submits; falls back to the flat
  // `part2_data.explanation` string when absent.
  explanationSections?: ExplanationSection[];
};

export type ExtractionPart2Data = {
  explanation?: string;
  answer?: string;
};

export type ExtractionQuestionData = {
  question: ExtractionQuestion;
  part2_data?: ExtractionPart2Data;
  concept_target: string;
};

export type ExtractionQuestionResponse = {
  data: ExtractionQuestionData | null;
  statusCode: number;
  message: string;
  error?: string | null;
};

export type QuestionFeedbackInput = {
  chainId: string;
  dpId: string;
  // Opaque question id echoed back to the backend (X-01 contract). The frontend
  // never parses it; pre-migration it mirrors `dp_id`.
  questionId?: string;
  isCorrect: boolean;
  shownTrapIds?: string[];
  selectedTrapId?: string | null;
  selectedOptionLabel?: string;
  selectedOptionText?: string;
  // Structured "Report this question" reason (spec H-13 / A-14). Snake_case
  // token per the X-01 contract. Set only by the report dialog.
  reportReason?: string | null;
  freeText?: string;
  sessionId?: string;
  // Learning experience this record belongs to (Final Handoff §11). Every
  // feedback/report record must identify its experience and content source.
  experience?: LearningExperience | null;
};

export type QuestionFeedbackResult = {
  feedbackId?: string | null;
  statusCode: number;
  message: string;
  error?: string | null;
};

// --- Learning Action contract (Stage 2 X-01) -------------------------------

export type LearningExperience = "reasoning" | "practice_studio";

export type LearningResponseType =
  | "small_talk"
  | "scope_redirect"
  | "explanation"
  | "question"
  | "question_review"
  | "clarification"
  | "friendly_error";

export type LearningActionOption = {
  label: string;
  text: string;
};

// Wire shape of a curated Reasoning explanation section (Final Handoff §8).
// `body_markdown` for prose sections; `option_explanations` for "why_others".
export type LearningActionExplanationSection = {
  id?: string;
  heading?: string;
  body_markdown?: string;
  option_explanations?: {
    option: string;
    explanation_markdown: string;
  }[];
};

// The `question` payload shape. The frontend never parses `question_id`; it
// only echoes it back for follow-ups / reports. `source`/`format`/`experience`
// are informational — rendering is identical regardless. Curated Reasoning
// items additionally carry `explanation_sections` for structured rendering.
export type LearningActionQuestionPayload = {
  question_id: string;
  experience?: string;
  source?: string;
  format?: string;
  stem: string;
  options: LearningActionOption[];
  correct_label: string;
  explanation?: string;
  explanation_sections?: LearningActionExplanationSection[];
  topic_id?: string | null;
};

export type LearningActionTextPayload = {
  text: string;
  question_id?: string;
};

// The `question_review` payload for a graded Practice Studio short answer
// (Final Handoff §9). `evaluation` is the semantic grade; `ideal_answer` is the
// anchor-grounded model answer revealed after submission.
export type LearningActionReviewPayload = {
  question_id?: string;
  evaluation?: "correct" | "partial" | "incorrect";
  feedback?: string;
  ideal_answer?: string;
};

// Explicit UI action that drives the learning flow without an LLM classifier
// (Final Handoff routing decision). Absent for a free-text chat message.
export type LearningAction =
  | "start_question"
  | "next_question"
  | "submit_answer"
  | "explain"
  | "review";

export type LearningActionInput = {
  message: string;
  // Explicit learning mode (Final Handoff §6); null until the learner chooses.
  experience: LearningExperience | null;
  // Always sent; explicit null when no topic is selected.
  topicId: string | null;
  topicDisplayName?: string | null;
  sessionId: string;
  currentQuestionId?: string | null;
  isFirstTurn?: boolean;
  currentOptions?: LearningActionOption[] | null;
  // Explicit action (start/next question, submit answer, explain). When set the
  // server routes directly instead of classifying `message`.
  action?: LearningAction | null;
  // Learner's free-text answer for a Practice Studio short-answer submission.
  learnerAnswer?: string | null;
  // Question ids already shown this session, so the server avoids repeats.
  seenQuestionIds?: string[] | null;
};

export type LearningActionResponse = {
  responseType: LearningResponseType;
  // JSON payload — shape depends on responseType (see payload types above).
  payload:
    | LearningActionQuestionPayload
    | LearningActionTextPayload
    | LearningActionReviewPayload
    | Record<string, unknown>
    | null;
  statusCode: number;
  message: string;
  error?: string | null;
};
