import { gql, TypedDocumentNode } from "@apollo/client";

export const CREATE_MOCK_EXAM_HISTORY: TypedDocumentNode<
  { createMockExamHistory: { _id: string } },
  {
    input: {
      mockExamId: string;
      questionIds?: string[];
      answers?: { questionId: string; answer: string; isCorrect: boolean }[];
      timeSpent?: number | null;
      score?: number | null;
      title: string;
    };
  }
> = gql`
  mutation CreateMockExamHistory($input: CreateMockExamHistoryInput!) {
    createMockExamHistory(input: $input) {
      _id
    }
  }
`;

export const DELETE_MOCK_EXAM_HISTORY = gql`
  mutation DeleteMockExamHistory($id: String!) {
    deleteMockExamHistory(id: $id)
  }
`;