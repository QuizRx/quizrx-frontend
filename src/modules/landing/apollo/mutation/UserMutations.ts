import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateUserWithEmailAndPasswordInput } from "@/core/types/api/auth";

export const CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION: TypedDocumentNode<
  { createUserWithEmailAndPassword: string },
  { createUserInput: CreateUserWithEmailAndPasswordInput }
> = gql`
  mutation CreateUserWithEmailAndPassword($createUserInput: CreateUserInput!) {
    createUserWithEmailAndPassword(createUserInput: $createUserInput)
  }
`;

export const CREATE_USER_WITH_GOOGLE_MUTATION: TypedDocumentNode<
  { createUserWithGoogle: string },
  { idToken: string }
> = gql`
  mutation CreateUserWithGoogle($idToken: String!) {
    createUserWithGoogle(idToken: $idToken)
  }
`;
