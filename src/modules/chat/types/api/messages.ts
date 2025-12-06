import { BaseEntityProps } from "@/core/types/api/api";
import { Question } from "./question";
import { AgentEvent } from "@/modules/chat/types/api/events";
export type Message = BaseEntityProps & {
  content?: string;
  senderType: SenderType;
  threadId: string;
  messageType?: MessageType;
  questions?: Question[]; // array from backend
  citations?: Citation[];
  quizId?: string;
  agentEvents?: AgentEvent[];
};

export type Citation = {
  text: string;
  pmid: string;
  url: string;
};

export enum SenderType {
  USER = "USER",
  AI = "AI",
}

export enum MessageType {
  FORM_TOPIC = "FORM_TOPIC",
  QUIZ = "QUIZ",
  ANSWER = "ANSWER",
  QUERY = "QUERY",
}

export type SendMessageInput = {
  threadId: string;
  content: string;
};
