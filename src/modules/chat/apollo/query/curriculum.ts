import { gql, TypedDocumentNode } from "@apollo/client";

// Adjust the type below to match your actual curriculum data structure if needed
export type CurriculumSection = {
  title: string;
  totalSubtopics: number;
  id?: string; // Optional ID field
  completedSubtopics: number;
  totalQuestions: number;
  subtopics: Array<{
    title: string;
    id?: string;
    completed: boolean;
    totalQuestions: number;
  }>;
};

export type GetCurriculumResponse = {
  getCurriculum: CurriculumSection[];
};

export const GET_CURRICULUM_QUERY: TypedDocumentNode<GetCurriculumResponse, void> = gql`
  query GetCurriculum {
    getCurriculum {
      title
      id
      totalSubtopics
      completedSubtopics
      totalQuestions
      subtopics {
        id
        title
        completed
        totalQuestions
      }
    }
  }
`;
