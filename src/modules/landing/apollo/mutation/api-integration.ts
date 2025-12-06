import { gql, TypedDocumentNode } from "@apollo/client";

export const CREATE_API_INTEGRATION: TypedDocumentNode<
  {
    createApiIntegration: {
      apiKey: string;
      connectionString: string;
      dataStore: string;
      destinationApiKey: string;
      destinationConn: string;
      hasDestination: string;
      integrationId: string;
      type: string;
    };
  },
  {
    createApiIntegrationInput: {
      apiKey?: string;
      connectionString?: string;
      dataStore?: string;
      destinationApiKey?: string;
      destinationConn?: string;
      hasDestination?: string;
      integrationId?: string;
      type?: string;
    };
  }
> = gql`
  mutation CreateApiIntegration(
    $createApiIntegrationInput: CreateApiIntegrationInput!
  ) {
    createApiIntegration(
      createApiIntegrationInput: $createApiIntegrationInput
    ) {
      apiKey
      connectionString
      dataStore
      destinationApiKey
      destinationConn
      hasDestination
      integrationId
      type
    }
  }
`;
