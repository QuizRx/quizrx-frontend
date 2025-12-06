import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { FileWithEmbedding } from "../../types/api/embedding";

export const GET_USER_FILE_EMBEDDINGS_QUERY: TypedDocumentNode<
  {
    getUserFileEmbeddings: PaginatedResponse<FileWithEmbedding>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserFileEmbeddings($pagination: PaginationArgs) {
    getUserFileEmbeddings(pagination: $pagination) {
      data {
        _id
        createdAt
        embeddingStatus
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
