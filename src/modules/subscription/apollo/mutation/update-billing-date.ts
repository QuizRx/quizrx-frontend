import { gql, TypedDocumentNode } from "@apollo/client";

export type UpdateDefaultBillingDateResponse = {
  updateDefaultBillingDate: any; // Stripe.Response<Stripe.Subscription> or a more specific type if available
};



export const UPDATE_DEFAULT_BILLING_DATE: TypedDocumentNode<
  UpdateDefaultBillingDateResponse,
  void
> = gql`
  mutation UpdateDefaultBillingDate {
    updateDefaultBillingDate
  }
`;
