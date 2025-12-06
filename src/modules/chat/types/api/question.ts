import { Citation } from "./messages";
import { BaseEntityProps } from "@/core/types/api/api";

export interface AnswerExplanation {
  content: string;
  explanation: string;
}

export interface DistractorExplanation {
  content: string;
  explanation: string;
}

export interface EnhancedExplanation {
  correct_answer: AnswerExplanation;
  distractors: DistractorExplanation[];
  key_points: string[];
}

export interface Question extends BaseEntityProps {
  choices: string[];
  explanation: string | EnhancedExplanation;
  level: string;
  question: string;
  question_type: string;
  answer: string;
  isSaved?: boolean;
  questionBankId?: string;
  isUserAnswerCorrect?: boolean;
  isCorrect: boolean;
  topic: string;
  sub_topic: string;
  userChoice?: number;
  timeSpent?: number;
  generationTime?: number;
}

export interface UpdateQuestionInput {
  questionId: string;
  isSaved?: boolean;
  answer?: string;
  choices?: string[];
  explanation?: string | EnhancedExplanation;
  level?: string;
  question?: string;
  questionBankId?: string;
  question_type?: string;
  topic?: string;
  sub_topic?: string;
  generationTime?: number;
}
