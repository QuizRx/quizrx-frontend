import { TypedDocumentNode, gql } from "@apollo/client";
import { Thread } from "../../types/api/thread";

export const GENERATE_QUIZ: TypedDocumentNode<
  {
    generateQuiz: Thread;
  },
  {
    title: string;
  }
> = gql`
  mutation GenerateQuiz($title: String!) {
    generateQuiz(title: $title) {
      _id
    }
  }
`;

export const GENERATE_QUIZ_FROM_QUESTION_BANKS: TypedDocumentNode<
  {
    generateQuizFromQuestionBanks: Thread;
  },
  {
    title: string;
    questionBankIds: string[];
  }
> = gql`
  mutation GenerateQuizFromQuestionBanks($title: String!, $questionBankIds: [String!]!) {
    generateQuizFromQuestionBanks(title: $title, questionBankIds: $questionBankIds) {
      _id
    }
  }
`;

export const UPDATE_QUIZ_MUTATION: TypedDocumentNode<
  {
    quizId: string;
    updateQuizInput: any;
  },
  {
    quizId: string;
    updateQuizInput: any;
  }
> = gql`
  mutation UpdateQuiz($quizId: String!, $updateQuizInput: UpdateQuizInput!) {
    updateQuiz(quizId: $quizId, updateQuizInput: $updateQuizInput) {
      _id
    }
  }
`;
