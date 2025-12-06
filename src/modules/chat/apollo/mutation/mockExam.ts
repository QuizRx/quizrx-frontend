import { TypedDocumentNode, gql } from "@apollo/client";

export const GENERATE_MOCK_EXAM: TypedDocumentNode<
  {
    mockExamId: string;
  },
  {
    title: string;
  }
> = gql`
  mutation GenerateMockExam($title: String!) {
    mockExamId: generateMockExam(title: $title)
  }
`;

