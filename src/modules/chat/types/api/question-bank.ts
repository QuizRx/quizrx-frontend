import { BaseEntityProps } from "@/core/types/api/api";

export interface QuestionBank extends BaseEntityProps {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  userId: string;
  totalQuestions: number;
  sub_topics: string[];
}