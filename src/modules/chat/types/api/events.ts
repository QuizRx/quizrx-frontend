// events.ts

import { Message } from "./messages";
import { Question } from "./question";

export type UnixTimestamp = number;

interface BaseEvent {
  timestamp: UnixTimestamp;
}

/** ── NEW: stream metadata (present on multi-stream events) ── */
export interface StreamMeta {
  stream_id?: string;
  macro_title?: string;
  subtopic_title?: string;
  thread_id?: string;
}

export interface LLMStreamingEvent extends BaseEvent, StreamMeta {
  event: "llm_streaming";
  node: string;
  content: string;
}

export interface ToolCallingEvent extends BaseEvent, StreamMeta {
  event: "tool_calling";
  tool_name: string;
  data: string;
}

/** ── NEW: retry / error / opened / batch_done ── */
export interface RetryEvent extends BaseEvent, StreamMeta {
  event: "retry";
  attempt: number;
  next_retry_in_sec: number;
  error?: string;
}

export interface ErrorEvent extends BaseEvent, StreamMeta {
  event: "error";
  error: string;
}

export interface StreamOpenedEvent extends BaseEvent, StreamMeta {
  event: "stream_opened";
}

export interface BatchDoneEvent extends BaseEvent, StreamMeta {
  event: "batch_done";
  thread_id: string; // server sends this when all streams finish
}

export interface EndEvent extends BaseEvent, StreamMeta {
  event: "done";
}

export interface FinalResponseData extends BaseEvent, StreamMeta {
  event: "final_response";
  message: Message;
}

/** Discriminated union */
export type AgentEvent =
  | LLMStreamingEvent
  | ToolCallingEvent
  | FinalResponseData
  | EndEvent
  | RetryEvent
  | ErrorEvent
  | StreamOpenedEvent
  | BatchDoneEvent;

export type StreamBucket = {
  streamId: string;
  macroTitle?: string;
  subtopicTitle?: string;
  status: 'open' | 'done' | 'error';
  events: AgentEvent[];
};

/** Type-guards (kept + extended) */
export const isRetryEvent = (e: AgentEvent): e is RetryEvent =>
  e.event && e.event.toLowerCase() === "retry";

export const isErrorEvent = (e: AgentEvent): e is ErrorEvent =>
  e.event && e.event.toLowerCase() === "error";

export const isStreamOpenedEvent = (e: AgentEvent): e is StreamOpenedEvent =>
  e.event && e.event.toLowerCase() === "stream_opened";

export const isBatchDoneEvent = (e: AgentEvent): e is BatchDoneEvent =>
  e.event && e.event.toLowerCase() === "batch_done";

export const isLLMStreamingEvent = (e: AgentEvent): e is LLMStreamingEvent =>
  e.event && e.event.toLowerCase() === "llm_streaming";

export const isToolCallingEvent = (e: AgentEvent): e is ToolCallingEvent =>
  e.event && e.event.toLowerCase() === "tool_calling";

export const isFinalResponseEvent = (e: AgentEvent): e is FinalResponseData =>
  e.event && e.event.toLowerCase() === "final_response";

export const isEndEvent = (e: AgentEvent): e is EndEvent =>
  e.event && e.event.toLowerCase() === "done";
