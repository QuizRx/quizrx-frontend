import { TypedDocumentNode, gql } from "@apollo/client";
import {
  CreateThreadInput,
  Thread,
  UpdateThreadInput,
} from "../../types/api/thread";

export const CREATE_THREAD_MUTATION: TypedDocumentNode<
  {
    createThread: Thread;
  },
  {
    createThreadInput: CreateThreadInput;
  }
> = gql`
  mutation CreateThread($createThreadInput: CreateThreadInput!) {
    createThread(createThreadInput: $createThreadInput) {
      _id
      createdAt
      description
      title
      updatedAt
      userId
    }
  }
`;

export const DELETE_THREAD_MUTATION: TypedDocumentNode<
  {
    deleteThread: boolean;
  },
  {
    threadId: string;
  }
> = gql`
  mutation DeleteThread($threadId: String!) {
    deleteThread(threadId: $threadId)
  }
`;

export const UPDATE_THREAD_MUTATION: TypedDocumentNode<
  {
    updateThread: Thread;
  },
  {
    updateThreadInput: UpdateThreadInput;
  }
> = gql`
  mutation UpdateThread($updateThreadInput: UpdateThreadInput!) {
    updateThread(updateThreadInput: $updateThreadInput) {
      _id
      createdAt
      description
      title
      updatedAt
      userId
    }
  }
`;
