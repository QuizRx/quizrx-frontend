import { gql, TypedDocumentNode } from "@apollo/client";

export const DELETE_TEST_USER_MUTATION: TypedDocumentNode<
  { deleteUserByTestEmail: boolean },
  {}
> = gql`
  mutation DeleteTestUser {
    deleteUserByTestEmail
  }
`;
