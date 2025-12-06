import { gql, TypedDocumentNode } from "@apollo/client";
import { SubscriptionData } from "@/modules/landing/types/api/subscription";
import { ApiResponse, PaginatedResponse } from "@/core/types/api/api";

export const GET_ALL_SUBSCRIPTIONS: TypedDocumentNode<{
  findAllSubscriptions: PaginatedResponse<SubscriptionData>;
}> = gql`
  query FindAllSubscriptions($limit: Float!, $orderBy: String!, $page: Float!) {
    findAllSubscriptions(limit: $limit, orderBy: $orderBy, page: $page) {
      cause
      data {
        _id
        createdAt
        credits
        duration
        name
        pricing
        updatedAt
        details
        isPopular
        subtitle
      }
      error
      message
      meta {
        lastPage
        limit
        nextPage
        page
        prevPage
        total
      }
      status
      statusCode
    }
  }
`;

export const GET_SUBSCRIPTION_BY_ID: TypedDocumentNode<{
  findSubscriptionById: ApiResponse<SubscriptionData>;
}> = gql`
  query FindSubscriptionById($findSubscriptionByIdId: String!) {
    findSubscriptionById(id: $findSubscriptionByIdId) {
      cause
      data {
        _id
        createdAt
        credits
        duration
        name
        pricing
        updatedAt
        details
        isPopular
        subtitle
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;
