import { gql, TypedDocumentNode } from "@apollo/client";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { QuestionBank } from "../../types/api/question-bank";

export const GET_PUBLIC_QUESTION_BANKS_QUERY: TypedDocumentNode<
  {
    getPublicQuestionBanks: PaginatedResponse<QuestionBank>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetPublicQuestionBanks($pagination: PaginationArgs) {
    getPublicQuestionBanks(pagination: $pagination) {
      data {
        _id
        createdAt
        description
        isPublic
        name
        tags
        updatedAt
        userId
      }
      meta {
        lastPage
        limit
        nextPage
        page
        prevPage
        total
      }
    }
  }
`;

export const GET_USER_QUESTION_BANKS_QUERY: TypedDocumentNode<
  {
    getUserQuestionBanks: PaginatedResponse<QuestionBank>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserQuestionBanks($pagination: PaginationArgs) {
    getUserQuestionBanks(pagination: $pagination) {
      data {
        _id
        createdAt
        description
        isPublic
        name
        tags
        updatedAt
        userId
        totalQuestions
        sub_topics
      }
      meta {
        lastPage
        limit
        nextPage
        page
        prevPage
        total
      }
    }
  }
`;

export const GET_QUESTION_BANK_BY_ID_QUERY: TypedDocumentNode<
  {
    getQuestionBankById: QuestionBank;
  },
  { id: string }
> = gql`
  query GetQuestionBankById($id: ID!) {
    getQuestionBankById(id: $id) {
      _id
      createdAt
      description
      isPublic
      name
      tags
      updatedAt
      userId
    }
  }
`;
