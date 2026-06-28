import { gql } from "@apollo/client";

export const SUBMIT_QUESTION_FEEDBACK_MUTATION = gql`
  mutation SubmitQuestionFeedback($input: QuestionFeedbackInput!) {
    submitQuestionFeedback(input: $input) {
      feedbackId
      statusCode
      message
      error
    }
  }
`;
