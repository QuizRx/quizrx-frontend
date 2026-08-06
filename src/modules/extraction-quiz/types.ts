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
