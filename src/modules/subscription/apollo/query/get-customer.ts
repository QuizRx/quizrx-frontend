import { gql, TypedDocumentNode } from "@apollo/client";
export type GetStripeCustomerJSONResponse = {
  getStripeCustomerJSON: any | null | undefined;
};

export const GET_STRIPE_CUSTOMER_JSON: TypedDocumentNode<
  GetStripeCustomerJSONResponse,
  void
> = gql`
  query GetStripeCustomerJSON {
    getStripeCustomerJSON
  }
`;
