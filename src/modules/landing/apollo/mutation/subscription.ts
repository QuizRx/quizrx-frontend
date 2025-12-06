import { gql, TypedDocumentNode } from "@apollo/client";

export const CREATE_PAYMENT_INTENT: TypedDocumentNode<
  { createStripePayment: { clientSecret: string; paymentIntentId: string } },
  { createStripeInput: { amount: number; currency: string, email?: string } }
> = gql`
  mutation CreateStripePayment($createStripeInput: CreateStripeInput!) {
    createStripePayment(createStripeInput: $createStripeInput) {
      clientSecret
      paymentIntentId
    }
  }
`;
