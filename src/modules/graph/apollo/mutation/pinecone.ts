import { TypedDocumentNode, gql } from "@apollo/client";
import {
  CreatePineconeConfigInput,
  PineconeConfig,
  PineconeConnectionTestInput,
  UpdatePineconeConfigInput,
} from "@/modules/graph/types/api/pinecone";

export const TEST_MULTIPLE_PINECONE_CONNECTIONS: TypedDocumentNode<
  {
    testMultiplePineconeConnections: {
      errorMessage: string;
      success: boolean;
    }[];
  },
  { input: { configs: PineconeConnectionTestInput[] } }
> = gql`
  mutation TestMultiplePineconeConnections(
    $input: PineconeMultipleConnectionTestInput!
  ) {
    testMultiplePineconeConnections(input: $input) {
      errorMessage
      success
    }
  }
`;

export const TEST_PINECONE_CONNECTION: TypedDocumentNode<
  {
    testPineconeConnection: {
      errorMessage: string;
      success: boolean;
    };
  },
  { input: PineconeConnectionTestInput }
> = gql`
  mutation TestPineconeConnection($input: PineconeConnectionTestInput!) {
    testPineconeConnection(input: $input) {
      errorMessage
      success
    }
  }
`;

export const UPDATE_PINECONE_CONFIG: TypedDocumentNode<
  {
    updatePineconeConfig: PineconeConfig;
  },
  {
    updatePineconeConfigId: string;
    configData: UpdatePineconeConfigInput;
    validateConnections: boolean;
  }
> = gql`
  mutation UpdatePineconeConfig(
    $configData: UpdatePineconeConfigInput!
    $updatePineconeConfigId: String!
    $validateConnection: Boolean
  ) {
    updatePineconeConfig(
      configData: $configData
      id: $updatePineconeConfigId
      validateConnection: $validateConnection
    ) {
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
  }
`;
export const CREATE_MULTIPLE_PINECONE_CONFIGS: TypedDocumentNode<
  {
    createMultiplePineconeConfigs: PineconeConfig[];
  },
  {
    input: {
      configs: CreatePineconeConfigInput[];
      validateConnections: boolean;
    };
  }
> = gql`
  mutation CreateMultiplePineconeConfigs(
    $input: CreateMultiplePineconeConfigsInput!
  ) {
    createMultiplePineconeConfigs(input: $input) {
      _id
      apiKey
      chunkOverlap
      chunkSize
      userId
      createdAt
      embeddingApiKey
      embeddingModel
      environmentUri
      indexName
      name
      updatedAt
    }
  }
`;

export const DELETE_PINECONE_CONFIG: TypedDocumentNode<
  { deletePineconeConfig: boolean },
  { deletePineconeConfigId: string }
> = gql`
  mutation DeletePineconeConfig($deletePineconeConfigId: String!) {
    deletePineconeConfig(id: $deletePineconeConfigId)
  }
`;
