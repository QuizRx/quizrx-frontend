import { TypedDocumentNode, gql } from "@apollo/client";
import { Feedback, SubmitFeedbackInput } from "../../types/api/feedback";

export const SUBMIT_FEEDBACK_MUTATION: TypedDocumentNode<
  {
    submitFeedback: Feedback;
  },
  {
    input: SubmitFeedbackInput;
  }
> = gql`
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input) {
      _id
      userId
      rating
      category
      message
      pagePath
      userAgent
      createdAt
      updatedAt
    }
  }
`;
