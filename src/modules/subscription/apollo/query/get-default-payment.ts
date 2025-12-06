import { gql, TypedDocumentNode } from "@apollo/client";
import type { PaymentMethod } from "@stripe/stripe-js";

export type GetDefaultPaymentResponse = {
  getDefaultPayment: PaymentMethod | string | null | undefined
};

export const GET_DEFAULT_PAYMENT: TypedDocumentNode<
  GetDefaultPaymentResponse,
  void
> = gql`
  query GetDefaultPayment {
    getDefaultPayment
  }
`;
