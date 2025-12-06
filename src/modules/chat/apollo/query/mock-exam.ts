import { gql, TypedDocumentNode } from "@apollo/client";

type MockExam = {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  questionIds: string[];
};

export const FIND_MOCK_EXAMS_BY_USER_ID_QUERY: TypedDocumentNode<
  { findMockExamsByUserId: MockExam[] },
  Record<string, never>
> = gql`
  query FindMockExamsByUserId {
    findMockExamsByUserId {
      _id
      userId
      title
      createdAt
      updatedAt
      questionIds
    }
  }
`;