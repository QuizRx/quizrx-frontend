import { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { ApiResponse } from "@/core/types/api/api";

interface NewsletterSubscription {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SUBSCRIBE_TO_NEWSLETTER: TypedDocumentNode<
  { subscribeToNewsletter: ApiResponse<NewsletterSubscription> },
  { email: string }
> = gql`
  mutation SubscribeToNewsletter($email: String!) {
    subscribeToNewsletter(email: $email) {
      cause
      data {
        _id
        createdAt
        email
        isActive
        updatedAt
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;
