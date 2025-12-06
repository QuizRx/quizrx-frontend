import { TypedDocumentNode, gql } from "@apollo/client";
import {
  CreateNeo4jConfigInput,
  Neo4jConfig,
  Neo4jConnectionTestInput,
  UpdateNeo4jConfigInput,
} from "@/modules/graph/types/api/neo4j";

export const TEST_MULTIPLE_NEO4J_CONNECTIONS: TypedDocumentNode<
  {
    testMultipleNeo4jConnections: {
      errorMessage: string;
      success: boolean;
    }[];
  },
  { input: { configs: Neo4jConnectionTestInput[] } }
> = gql`
  mutation TestMultipleNeo4jConnections(
    $input: Neo4jMultipleConnectionTestInput!
  ) {
    testMultipleNeo4jConnections(input: $input) {
      errorMessage
      success
    }
  }
`;

export const TEST_NEO4J_CONNECTION: TypedDocumentNode<
  {
    testNeo4jConnection: {
      errorMessage: string;
      success: boolean;
    };
  },
  { input: Neo4jConnectionTestInput }
> = gql`
  mutation TestNeo4jConnection($input: Neo4jConnectionTestInput!) {
    testNeo4jConnection(input: $input) {
      errorMessage
      success
    }
  }
`;

export const CREATE_MULTIPLE_NEO4J_CONFIGS: TypedDocumentNode<
  {
    createMultipleNeo4jConfigs: Neo4jConfig[];
  },
  {
    input: {
      configs: CreateNeo4jConfigInput[];
      validateConnections: boolean;
    };
  }
> = gql`
  mutation CreateMultipleNeo4jConfigs(
    $input: CreateMultipleNeo4jConfigsInput!
  ) {
    createMultipleNeo4jConfigs(input: $input) {
      _id
      userId
      createdAt
      name
      password
      updatedAt
      uri
      username
    }
  }
`;

export const UPDATE_MULTIPLE_NEO4J_CONFIGS: TypedDocumentNode<
  {
    updateNeo4jConfig: Neo4jConfig;
  },
  {
    updateNeo4JConfigId: string;
    configData: UpdateNeo4jConfigInput;
    validateConnections: boolean;
  }
> = gql`
  mutation UpdateNeo4jConfig(
    $configData: UpdateNeo4jConfigInput!
    $updateNeo4JConfigId: String!
    $validateConnection: Boolean
  ) {
    updateNeo4jConfig(
      configData: $configData
      id: $updateNeo4JConfigId
      validateConnection: $validateConnection
    ) {
      _id
      createdAt
      name
      password
      updatedAt
      uri
      userId
      username
    }
  }
`;

export const DELETE_NEO4J_CONFIG: TypedDocumentNode<
  { deleteNeo4jConfig: boolean },
  { deleteNeo4JConfigId: string }
> = gql`
  mutation DeleteNeo4jConfig($deleteNeo4JConfigId: String!) {
    deleteNeo4jConfig(id: $deleteNeo4JConfigId)
  }
`;
