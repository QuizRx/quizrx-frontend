import { gql, TypedDocumentNode } from "@apollo/client";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";

export const GET_USER_FILES: TypedDocumentNode<
  { getUserFiles: PaginatedResponse<UploadedFile> },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserFiles($pagination: PaginationArgs) {
    getUserFiles(pagination: $pagination) {
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
