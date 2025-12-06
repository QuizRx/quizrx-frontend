import { gql, TypedDocumentNode } from "@apollo/client";
import { User } from "@/modules/graph/types/api/user";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";

export const GET_ALL_USERS: TypedDocumentNode<
  { getAllUsers: PaginatedResponse<User> },
  { pagination?: PaginatedParams }
> = gql`
  query GetAllUsers($pagination: PaginationArgs) {
    getAllUsers(pagination: $pagination) {
      data {
        _id
        createdAt
        email
        firstName
        lastName
        updatedAt
        role
        status
      }
      meta {
        lastPage
        limit
        nextPage
        page
        prevPage
        total
      }
    }
  }
`;

export const GET_CURRENT_USER: TypedDocumentNode<
  { user: User },
  {}
> = gql`
  query GetCurrentUser {
    user {
      firstName
      lastName
      email
      role
      status
    }
  }
`;