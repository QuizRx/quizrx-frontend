import { gql, TypedDocumentNode } from "@apollo/client";
import { PineconeConfig } from "@/modules/graph/types/api/pinecone";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";

export const GET_USER_PINECONE_CONFIGS: TypedDocumentNode<
  { getUserPineconeConfigs: PaginatedResponse<PineconeConfig> },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserPineconeConfigs($pagination: PaginationArgs) {
    getUserPineconeConfigs(pagination: $pagination) {
      data {
        _id
        apiKey
        chunkOverlap
        chunkSize
        createdAt
        embeddingApiKey
        embeddingModel
        environmentUri
        indexName
        name
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
