import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { Message } from "../../types/api/messages";
import { Question } from "../../types/api/question";

export const GET_USER_QUESTIONS_QUERY: TypedDocumentNode<
  {
    getUserQuestions: PaginatedResponse<Question>;
  },
  { pagination?: PaginatedParams; filter: { isSaved?: boolean } }
> = gql`
  query GetUserQuestions(
    $filter: UserQuestionFilterArgs
    $pagination: PaginationArgs
  ) {
    getUserQuestions(filter: $filter, pagination: $pagination) {
      data {
        _id
        answer
        choices
        createdAt
        explanation
        isCorrect
        isSaved
        level
        question
        questionBankId
        question_type
        sub_topic
        topic
        updatedAt
        isUserAnswerCorrect
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

export const GET_USER_THREAD_MESSAGES_QUERY: TypedDocumentNode<
  {
    getThreadMessages: PaginatedResponse<Message>;
  },
  { threadId: string; pagination?: PaginatedParams }
> = gql`
  query GetThreadMessages($threadId: String!, $pagination: PaginationArgs) {
    getThreadMessages(threadId: $threadId, pagination: $pagination) {
      data {
        _id
        citations {
          pmid
          text
          url
        }
        content
        createdAt
        messageType
        questions {
          _id
          answer
          choices
          createdAt
          explanation
          isSaved
          level
          question
          questionBankId
          question_type
          sub_topic
          topic
          updatedAt
          isUserAnswerCorrect
          userId
        }
        senderType
        threadId
        updatedAt
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

export const GET_QUESTIONS_BY_IDS_QUERY: TypedDocumentNode<
  {
    getQuestionsByIds: Question[];
  },
  {
    questionIds: string[];
  }
> = gql`
  query GetQuestionsByIds($questionIds: [String!]!) {
    getQuestionsByIds(questionIds: $questionIds) {
      _id
      question
      choices
      answer
      explanation
      level
      question_type
      topic
      sub_topic
      createdAt
    }
  }
`;


export const GET_QUESTIONS_BY_QUESTION_BANK_ID_QUERY: TypedDocumentNode<
  {
    getQuestionsByQuestionBankId: PaginatedResponse<Question>;
  },
  {
    questionBankId: string;
    pagination?: PaginatedParams;
  }
> = gql`
  query GetQuestionsByQuestionBankId($questionBankId: String!, $pagination: PaginationArgs) {
    getQuestionsByQuestionBankId(questionBankId: $questionBankId, pagination: $pagination) {
      data {
        _id
        question
        answer
        topic
        sub_topic
        level
        questionBankId
        userId
        createdAt
        updatedAt
        question_type
        choices
      }
      meta {
        total
        page
        limit
      }
    }
  }
`;