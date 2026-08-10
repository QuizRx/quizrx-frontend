export type ExtractionQuestion = {
  question: string;
  choices: string[];
  answer: string;
  option_trap_ids: (string | null)[];
  dp_id: string;
  concept_target: string;
  topic?: string;
  sub_topic?: string;
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

// The `question` payload shape. The frontend never parses `question_id`; it
// only echoes it back for follow-ups / reports. `source`/`format`/`experience`
// are informational — rendering is identical regardless.
export type LearningActionQuestionPayload = {
  question_id: string;
  experience?: string;
  source?: string;
  format?: string;
  stem: string;
  options: LearningActionOption[];
  correct_label: string;
  explanation?: string;
  topic_id?: string | null;
};

export type LearningActionTextPayload = {
  text: string;
  question_id?: string;
};

export type LearningActionInput = {
  message: string;
  experience: LearningExperience;
  // Always sent; explicit null when no topic is selected.
  topicId: string | null;
  topicDisplayName?: string | null;
  sessionId: string;
  currentQuestionId?: string | null;
  isFirstTurn?: boolean;
  currentOptions?: LearningActionOption[] | null;
};

export type LearningActionResponse = {
  responseType: LearningResponseType;
  // JSON payload — shape depends on responseType (see payload types above).
  payload:
    | LearningActionQuestionPayload
    | LearningActionTextPayload
    | Record<string, unknown>
    | null;
  statusCode: number;
  message: string;
  error?: string | null;
};
