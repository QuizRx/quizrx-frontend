import { gql, TypedDocumentNode } from "@apollo/client";
import { Collection } from "@/modules/graph/types/api/collection";

import { ApiResponse } from "@/core/types/api/api";
import {
  AddFileToCollectionInput,
  CollectionFile,
} from "../../types/api/collection-file";

export const ADD_FILE_TO_COLLECTION_MUTATION: TypedDocumentNode<
  {
    addFileToCollection: CollectionFile;
  },
  { addFileToCollectionInput: AddFileToCollectionInput }
> = gql`
  mutation AddFileToCollection(
    $addFileToCollectionInput: AddFileToCollectionInput!
  ) {
    addFileToCollection(addFileToCollectionInput: $addFileToCollectionInput) {
      _id
      collectionId
      createdAt
      fileId
      updatedAt
    }
  }
`;

export const REMOVE_FILE_FROM_COLLECTION_MUTATION: TypedDocumentNode<
  {
    removeFileFromCollection: ApiResponse<{ data: Collection }>;
  },
  { collectionId: string; fileId: string }
> = gql`
  mutation RemoveFileFromCollection($collectionId: String!, $fileId: String!) {
    removeFileFromCollection(collectionId: $collectionId, fileId: $fileId)
  }
`;
