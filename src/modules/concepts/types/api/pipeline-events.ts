// ---- Shared metadata for LangGraph/OpenAI ----
export interface LangGraphMetadata {
  langgraph_step: number;
  langgraph_node: string;
  langgraph_triggers: string[];
  langgraph_path: string[];
  langgraph_checkpoint_ns: string;
  checkpoint_ns: string;

  // LLM-specific
  ls_provider: string;      // e.g., "openai"
  ls_model_name: string;    // e.g., "o3-mini"
  ls_model_type: string;    // e.g., "chat"
  ls_temperature: number | null;

  // Allow future/unknown keys without breaking types
  [k: string]: unknown;
}

// Optional: tool call chunks that can appear during token events
export interface ToolCallChunk {
  type?: 'tool_call_chunk' | string;
  index?: number;
  name?: string | null;
  args?: string | null;
  id?: string | null;
  [k: string]: unknown;
}

// ---- Agent event inside a message (from your example) ----
export interface AgentEvent {
  event: 'token';
  node?: string;
  content?: string;
  metadata?: {
    time_taken?: number;
    status_code?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

// ---- Event: final_response ----
export interface FinalResponseEvent {
  event: 'final_response';
  content: string;
  last_node_id: string;
}

// ---- Event: token ----
export interface TokenEvent {
  event: 'token';
  node: string;
  content: string;
  tool_call: ToolCallChunk[]; // empty array in your sample is fine
  metadata: LangGraphMetadata;
  [k: string]: unknown;
}

// ---- Union of all stream events you provided ----
export type StreamEvent = FinalResponseEvent | TokenEvent;

// ---- Type guards ----
export const isFinalResponseEvent = (e: StreamEvent): e is FinalResponseEvent =>
  e.event === 'final_response';

export const isTokenEvent = (e: StreamEvent): e is TokenEvent =>
  e.event === 'token';
