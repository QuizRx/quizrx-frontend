import { TypedDocumentNode, gql } from "@apollo/client";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { Feedback } from "../../types/api/feedback";

export const GET_MY_FEEDBACK_QUERY: TypedDocumentNode<
  {
    getMyFeedback: PaginatedResponse<Feedback>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetMyFeedback($pagination: PaginationArgs) {
    getMyFeedback(pagination: $pagination) {
      data {
        _id
        userId
        rating
        category
        message
        pagePath
        userAgent
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;

export const GET_LATEST_FEEDBACK_QUERY: TypedDocumentNode<
  {
    getLatestFeedback: Feedback | null;
  },
  Record<string, never>
> = gql`
  query GetLatestFeedback {
    getLatestFeedback {
      _id
      rating
      category
      createdAt
    }
  }
`;
