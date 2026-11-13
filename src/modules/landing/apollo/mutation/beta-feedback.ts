import { TypedDocumentNode, gql } from "@apollo/client";
import { BetaFeedbackInput, BetaFeedbackResult } from "../../types/beta-feedback";

export const SUBMIT_BETA_FEEDBACK_MUTATION: TypedDocumentNode<
  { submitBetaFeedback: BetaFeedbackResult },
  { input: BetaFeedbackInput }
> = gql`
  mutation SubmitBetaFeedback($input: BetaFeedbackInput!) {
    submitBetaFeedback(input: $input) {
      success
    }
  }
`;
