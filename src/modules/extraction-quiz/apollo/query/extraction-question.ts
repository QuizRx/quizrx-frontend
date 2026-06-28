import { gql } from "@apollo/client";

export const GET_EXTRACTION_QUESTION_QUERY = gql`
  query GetExtractionQuestion($chainId: String!, $dpId: String) {
    getExtractionQuestion(chainId: $chainId, dpId: $dpId) {
      data
      statusCode
      message
      error
    }
  }
`;
