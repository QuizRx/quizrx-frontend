import { gql, TypedDocumentNode } from "@apollo/client";
import { UserSubscriptionData } from "@/modules/landing/types/api/subscription";
import { ApiResponse } from "@/core/types/api/api";

export const GET_USER_SUBSCRIPTION: TypedDocumentNode<
  {
    findByUserIdUserSubscription: ApiResponse<UserSubscriptionData>;
  },
  { userId: string }
> = gql`
  query FindByUserIdUserSubscription($userId: String!) {
    findByUserIdUserSubscription(userId: $userId) {
      cause
      data {
        _id
        createdAt
        creditsRemaining
        subscriptionId
        updatedAt
        userId
        subscription {
          _id
          createdAt
          credits
          details
          duration
          isPopular
          name
          pricing
          subtitle
          updatedAt
        }
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;
