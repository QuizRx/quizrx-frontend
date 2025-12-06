import { gql, TypedDocumentNode } from "@apollo/client";

export type SubscriptionOfUser = {
  name: string;
  pricing: number;
  duration: number;
  credits: number;
  subtitle: string;
  details: string;
  usersIncluded: number;
};

export const GET_SUBSCRIPTION_OF_USER: TypedDocumentNode<
  { getSubscriptionOfUser: SubscriptionOfUser },
  void
> = gql`
  query GetSubscriptionOfUser {
    getSubscriptionOfUser {
      name
      pricing
      duration
      credits
      subtitle
      details
      usersIncluded
    }
  }
`;