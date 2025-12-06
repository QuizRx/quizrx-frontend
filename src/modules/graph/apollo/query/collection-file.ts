import { gql, TypedDocumentNode } from "@apollo/client";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { CollectionWithFileCount } from "../../types/api/collection-file";

export const GET_COLLECTION_FILES: TypedDocumentNode<
  { getFilesByCollection: PaginatedResponse<UploadedFile> },
  { collectionId: String; pagination?: PaginatedParams }
> = gql`
  query GetFilesByCollection(
    $collectionId: String!
    $pagination: PaginationArgs
  ) {
    getFilesByCollection(collectionId: $collectionId, pagination: $pagination) {
      data {
        _id
        createdAt
        filename
        mimetype
        path
        size
        updatedAt
        url
        userId
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

export const GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY: TypedDocumentNode<
  {
    getUserCollectionWithFileCountById: CollectionWithFileCount;
  },
  { collectionId: string }
> = gql`
  query GetUserCollectionWithFileCountById($collectionId: String!) {
    getUserCollectionWithFileCountById(collectionId: $collectionId) {
      _id
      createdAt
      fileCount
      title
      updatedAt
      userId
    }
  }
`;

// Then use them in the query definition
export const GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY: TypedDocumentNode<
  {
    getUserCollectionsWithFileCount: PaginatedResponse<CollectionWithFileCount>;
  },
  {
    pagination?: PaginatedParams;
  }
> = gql`
  query GetUserCollectionsWithFileCount($pagination: PaginationArgs) {
    getUserCollectionsWithFileCount(pagination: $pagination) {
      data {
        _id
        createdAt
        fileCount
        title
        updatedAt
        userId
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
