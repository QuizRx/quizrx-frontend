import { gql, TypedDocumentNode } from '@apollo/client';

// Type definitions for the response
export interface LLMCallUsageStats {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
}

export const GET_LLM_CALL_USAGE_STATS: TypedDocumentNode<
  {
    v1LLMCallUsageStats: LLMCallUsageStats;
  },
  {}
> = gql`
  query {
    v1LLMCallUsageStats {
      totalCalls
      totalInputTokens
      totalOutputTokens
      totalTokens
      totalCost
      avgLatency
    }
  }
`;
