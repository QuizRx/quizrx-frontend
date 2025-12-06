import { gql, TypedDocumentNode } from "@apollo/client";
import {
  InviteUserInput,
  UpdateUserInput,
  User,
} from "@/modules/graph/types/api/user";
import { ApiResponse } from "@/core/types/api/api";
import { CreateUserWithEmailAndPasswordInput } from "@/core/types/api/auth";

export const CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION: TypedDocumentNode<
  { createUserWithEmailAndPassword: ApiResponse<{ token: string }> },
  { createUserInput: CreateUserWithEmailAndPasswordInput }
> = gql`
  mutation CreateUserWithEmailAndPassword($createUserInput: CreateUserInput!) {
    createUserWithEmailAndPassword(createUserInput: $createUserInput) {
      cause
      data {
        token
      }
      error
      message
      status
    }
  }
`;

export const CREATE_USER_WITH_GOOGLE_MUTATION: TypedDocumentNode<
  { createUserWithGoogle: ApiResponse<{ token: string }> },
  { idToken: string; subscriptionId?: string }
> = gql`
  mutation CreateUserWithGoogle($idToken: String!) {
    createUserWithGoogle(idToken: $idToken) {
      cause
      data {
        token
      }
      error
      message
      status
    }
  }
`;

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  { updateUser: User },
  { updateUserInput: UpdateUserInput }
> = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      _id
      createdAt
      email
      firstName
      lastName
      role
      status
      updatedAt
    }
  }
`;

export const REMOVE_USER_MUTATION: TypedDocumentNode<
  { removeUser: boolean },
  { removeUserId: string }
> = gql`
  mutation RemoveUser($removeUserId: String!) {
    removeUser(id: $removeUserId)
  }
`;

export const INVITE_USER_MUTATION: TypedDocumentNode<
  { inviteUser: boolean },
  { inviteUserInput: InviteUserInput }
> = gql`
  mutation InviteUser($inviteUserInput: InviteUserInput!) {
    inviteUser(inviteUserInput: $inviteUserInput)
  }
`;
