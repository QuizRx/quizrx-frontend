import { gql, TypedDocumentNode } from "@apollo/client";

export type UpdateBillingAddressResponse = {
  updateBillingAddress: any; // Can be typed more strictly if backend returns a specific object
};

export type UpdateBillingAddressVariables = {
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

export const UPDATE_BILLING_ADDRESS: TypedDocumentNode<
  UpdateBillingAddressResponse,
  UpdateBillingAddressVariables
> = gql`
  mutation UpdateBillingAddress(
    $address: String!
    $city: String!
    $state: String!
    $postalCode: String!
  ) {
    updateBillingAddress(
      address: $address
      city: $city
      state: $state
      postalCode: $postalCode
    )
  }
`;
