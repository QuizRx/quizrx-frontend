import { gql, TypedDocumentNode } from "@apollo/client";
import {
  UserPreference,
  UpdateUserPreferenceInput,
  OpenAIConnectionTestInput
} from "@/modules/graph/types/api/user-preference";
import { ApiResponse } from "@/core/types/api/api";

export const GET_USER_PREFERENCE: TypedDocumentNode<{
  findByUserIdUserPreference: ApiResponse<UserPreference>;
}> = gql`
  query FindByUserIdUserPreference {
    findByUserIdUserPreference {
      data {
        modelName
        apiKey
        embeddingModel
      }
      error
      message
      status
      statusCode
    }
  }
`;

export const UPDATE_USER_PREFERENCE: TypedDocumentNode<
  {
    findByUserIdUserPreference: UserPreference;
  },
  {
    input: UpdateUserPreferenceInput;
  }
> = gql`
  mutation UpdateUserPreference($input: UpdateUserPreferenceInput!) {
    updateUserPreference(preferenceData: $input) {
      modelName
      userId
      embeddingModel
      apiKey
    }
  }
`;


export const TEST_OPENAI_APIKEY: TypedDocumentNode<
  {
     testOpenAIconnection: {
      success: boolean;
    };
  },
  { input: OpenAIConnectionTestInput }
> = gql`
  mutation TestOpenAIconnection($input: OpenAIConnectionTestInput!) {
    testOpenAIconnection(input: $input) {
      success
    }
  }
`;