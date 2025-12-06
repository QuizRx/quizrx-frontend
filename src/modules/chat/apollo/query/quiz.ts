import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { Message } from "../../types/api/messages";
import { Quiz } from "../../types/api/quiz";

export const GET_USER_QUIZ_QUERY: TypedDocumentNode<
  {
    getUserQuiz: PaginatedResponse<Quiz>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserQuiz($pagination: PaginationArgs) {
    getUserQuiz(pagination: $pagination) {
      data {
        _id
        quizName
        timeSpent
        score
        totalQuestions
        createdAt
        questionIds
      }
    }
  }
`;

export const GET_QUIZ_BY_ID_QUERY: TypedDocumentNode<
  {
    getQuizById: Quiz;
  },
  {
    id: string;
  }
> = gql`
  query GetQuizById($id: String!) {
    getQuizById(id: $id) {
      _id
      quizName
      timeSpent
      score
      answers{
        answer
        questionId
        isCorrect
      }
    }
  }
`;