import { gql, TypedDocumentNode } from '@apollo/client';

// Type definitions for the response
export interface Message {
  role: 'SYSTEM' | 'USER' | 'ASSISTANT';
  content: string;
}

export enum ServiceId {
  BIOLIMITLESS_SERVICE = 'biolimitless_service',
  QUIZ_RX_SERVICE     = 'quiz_rx_service',
}

export interface V1LLMCallMessage {
  role: string
  content: string
}

export interface V1LLMCallToolCall {
  name: string
  args: any
  id: string
  type: string
}

export interface V1LLMCallOutputObject {
  text: string
  tool_calls: V1LLMCallToolCall[]
}

export interface LLMCallData {
  _id:         string
  id?:         string
  service_id:  ServiceId
  session_id:  string
  message_id:  string
  component:   string
  timestamps:  number
  messages?:   V1LLMCallMessage[]
  output?:     string | V1LLMCallOutputObject
  model?:      string
  status?:     string
  provider?:   string
  input_tokens?:  number
  output_tokens?: number
  usage?:        string
  duration?:     string
}

export interface LLMCallsResponse {
  data: LLMCallData[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  orderBy?: string;
}

export const GET_USAGE_STATS: TypedDocumentNode<
  {
    v1LLMCalls: LLMCallsResponse;
  },
  { pagination?: PaginationInput }
> = gql`
  query findAll($pagination: PaginationArgs) {
    v1LLMCalls(pagination: $pagination) {
      data {
        _id
        service_id
        session_id
        component
        model
        provider
        status
        duration
        usage
        messages {
          role
          content
        }
        output
        input_tokens
        output_tokens
        timestamps
      }
      total
      page
      limit
    }
  }
`;
