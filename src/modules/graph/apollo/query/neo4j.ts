import { gql, TypedDocumentNode } from "@apollo/client";
import { Neo4jConfig } from "@/modules/graph/types/api/neo4j";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";

export const GET_USER_NEO4J_CONFIGS: TypedDocumentNode<
  { getUserNeo4jConfigs: PaginatedResponse<Neo4jConfig> },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserNeo4jConfigs($pagination: PaginationArgs) {
    getUserNeo4jConfigs(pagination: $pagination) {
      data {
        _id
        createdAt
        name
        password
        updatedAt
        uri
        userId
        username
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
