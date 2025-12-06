import { BaseEntityProps } from "@/core/types/api/api";

interface Answer {
  questionId: string;
  answer:string;
  isCorrect: boolean
}

export interface Quiz extends BaseEntityProps {
  quizName: string;
  timeSpent: number;
  score: number;
  totalQuestions: number;
  answers?:Answer[]
  questionIds?:string[]
}

