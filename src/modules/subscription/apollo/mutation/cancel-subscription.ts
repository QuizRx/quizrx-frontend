import { gql, TypedDocumentNode } from "@apollo/client";

export type CancelSubscriptionResponse = {
  cancelSubscription: {
    success: boolean;
    message: string;
  };
};

export type CancelSubscriptionVariables = {
  reason: string;
};

export const CANCEL_SUBSCRIPTION: TypedDocumentNode<
  { cancelSubscription: CancelSubscriptionResponse },
  CancelSubscriptionVariables
> = gql`
  mutation CancelSubscription($reason: String!) {
    cancelSubscription(reason: $reason)
  }
`;