import { gql, TypedDocumentNode } from "@apollo/client";

type MockExamHistory = {
  _id: string;
  mockExamId: string;
  score: number;
  createdAt: string;
  questionIds: string[];
  title: string;
  timeSpent?: number;
  totalQuestions: number;
};

export const GET_MOCK_EXAMS_HISTORY: TypedDocumentNode<
  { getUserMockExamHistory: { data: MockExamHistory[] } },
  Record<string, never>
> = gql`
  query GetUserMockExamHistory {
    getUserMockExamHistory {
      data {
        _id
        mockExamId
        score
        createdAt
        questionIds
        title
        timeSpent
      }
    }
  }
`;