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
  isCorrect: boolean;
  shownTrapIds?: string[];
  selectedTrapId?: string | null;
  selectedOptionLabel?: string;
  selectedOptionText?: string;
  rating?: "up" | "down" | null;
  freeText?: string;
  sessionId?: string;
};

export type QuestionFeedbackResult = {
  feedbackId?: string | null;
  statusCode: number;
  message: string;
  error?: string | null;
};
