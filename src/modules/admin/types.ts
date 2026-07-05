import { PaginatedResponse } from "@/core/types/api/api";
import { FeedbackCategory } from "@/modules/feedback/types/api/feedback";
import { UserRole, UserStatus } from "@/modules/graph/types/api/enum";

export type AdminUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminThreadRow = {
  _id: string;
  title: string;
  description?: string | null;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminThreadMessage = {
  _id: string;
  content?: string | null;
  threadId: string;
  senderType: "USER" | "AI";
  messageType: "ANSWER" | "QUIZ" | "QUERY" | "FORM_TOPIC";
  createdAt: string;
  updatedAt: string;
};

export type BulkInviteResultEntry = {
  email: string;
  ok: boolean;
  error?: string | null;
};

export type BulkInviteResult = {
  totalRequested: number;
  succeeded: number;
  failed: number;
  results: BulkInviteResultEntry[];
};

export type AdminFeedbackRow = {
  _id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  rating: number;
  category: FeedbackCategory;
  message?: string | null;
  pagePath?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersResponse = PaginatedResponse<AdminUser>;
export type AdminThreadsResponse = PaginatedResponse<AdminThreadRow>;
export type AdminThreadMessagesResponse = PaginatedResponse<AdminThreadMessage>;
export type AdminFeedbackResponse = PaginatedResponse<AdminFeedbackRow>;

export type BulkInviteInput = {
  emails: string[];
  role?: UserRole;
};
