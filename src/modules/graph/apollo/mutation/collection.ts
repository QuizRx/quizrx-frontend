import { gql, TypedDocumentNode } from "@apollo/client";
import { Collection } from "@/modules/graph/types/api/collection";

import { ApiResponse } from "@/core/types/api/api";

export const CREATE_COLLECTION_MUTATION: TypedDocumentNode<
  {
    createCollection: Collection;
  },
  { createCollectionInput: { title: string } }
> = gql`
  mutation CreateCollection($createCollectionInput: CreateCollectionInput!) {
    createCollection(createCollectionInput: $createCollectionInput) {
      _id
      createdAt
      title
      updatedAt
      userId
    }
  }
`;

export const UPDATE_COLLECTION_MUTATION: TypedDocumentNode<
  {
    updateCollection: ApiResponse<{ data: Collection }>;
  },
  { updateCollectionInput: { id: string; title: string } }
> = gql`
  mutation UpdateCollection($updateCollectionInput: UpdateCollectionInput!) {
    updateCollection(updateCollectionInput: $updateCollectionInput) {
      cause
      data {
        _id
        createdAt
        title
        updatedAt
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;

export const REMOVE_COLLECTION_MUTATION: TypedDocumentNode<
  {
    removeCollection: ApiResponse<{ data: Collection }>;
  },
  { removeCollectionId: string }
> = gql`
  mutation RemoveCollection($removeCollectionId: String!) {
    removeCollection(id: $removeCollectionId) {
      cause
      data {
        _id
        createdAt
        title
        updatedAt
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;
