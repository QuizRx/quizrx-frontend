import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { Thread } from "../../types/api/thread";
import { Message } from "../../types/api/messages";

export const GET_USER_THREADS_QUERY: TypedDocumentNode<
  {
    getUserThreads: PaginatedResponse<Thread>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserThreads($pagination: PaginationArgs) {
    getUserThreads(pagination: $pagination) {
      data {
        _id
        createdAt
        description
        title
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
        quizId
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
          userChoice
          timeSpent
          generationTime
        }
        agentEvents {
          ... on LLMStreamingEvent {
            content
            event
            node
            timestamp
          }
          ... on ToolCallingEvent {
            data
            event
            timestamp
            tool_name
          }
        }
        senderType
        threadId
        updatedAt
      }
    }
  }
`;
