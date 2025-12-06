import { gql, TypedDocumentNode } from "@apollo/client";

export const RESTORE_SUBSCRIPTION: TypedDocumentNode<
  { restoreSubscription: boolean },
  void
> = gql`
  mutation RestoreSubscription {
    restoreSubscription
  }
`;
