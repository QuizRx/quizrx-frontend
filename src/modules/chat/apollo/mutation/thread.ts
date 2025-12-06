import { TypedDocumentNode, gql } from "@apollo/client";
import { CreateThreadInput, Thread } from "../../types/api/thread";

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
