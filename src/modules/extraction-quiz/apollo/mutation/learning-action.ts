import { gql } from "@apollo/client";

// Single learning-action mutation (Stage 2 X-01 contract). Every chat message
// goes through this; the frontend switches on `responseType` and renders that
// type only. `payload` is a JSON scalar whose shape depends on the type.
export const LEARNING_ACTION_MUTATION = gql`
  mutation LearningAction($input: LearningActionInput!) {
    learningAction(input: $input) {
      responseType
      payload
      statusCode
      message
      error
    }
  }
`;
