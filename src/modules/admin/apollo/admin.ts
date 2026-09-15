import { gql, TypedDocumentNode } from "@apollo/client";
import { PaginatedParams } from "@/core/types/api/api";
import { FeedbackCategory } from "@/modules/feedback/types/api/feedback";
import type {
  AdminThreadMessagesResponse,
  AdminUsersResponse,
} from "../types";

/**
 * These queries hit the EXISTING prod backend endpoints. They are the
 * legacy non-role-guarded queries — every authenticated user can call
 * them. The closed-beta admin UI uses `useIsAdmin` (a client-side email
 * check) to limit who SEES the admin panel, but the hardening happens
 * when the new `AdminGuard`'d backend (already written, not yet deployed)
 * ships. When it does, swap these queries for `adminGetAllUsers` /
 * `adminGetAllThreads` / `adminBulkInviteUsers`.
 */

export const ADMIN_GET_ALL_USERS: TypedDocumentNode<
  { getAllUsers: AdminUsersResponse },
  { pagination?: PaginatedParams }
> = gql`
  query AdminGetAllUsers($pagination: PaginationArgs) {
    getAllUsers(pagination: $pagination) {
      data {
        _id
        email
        firstName
        lastName
        role
        status
        createdAt
        updatedAt
      }
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;

/**
 * Lightweight thread row that matches what prod actually returns.
 * Note: prod has no joined user-email / message-count fields, so the
 * UI shows userId and last-activity instead. When the AdminGuard
 * backend deploys, this will be replaced with `adminGetAllThreads`
 * which joins those columns server-side.
 */
export type ProdThreadRow = {
  _id: string;
  title: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_GET_ALL_THREADS: TypedDocumentNode<
  {
    getAllThreads: {
      data: ProdThreadRow[];
      meta: {
        total: number;
        limit: number;
        page: number;
        lastPage: number;
        nextPage?: number;
        prevPage?: number;
      };
    };
  },
  { pagination?: PaginatedParams }
> = gql`
  query AdminGetAllThreads($pagination: PaginationArgs) {
    getAllThreads(pagination: $pagination) {
      data {
        _id
        title
        description
        userId
        createdAt
        updatedAt
      }
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;

export const ADMIN_GET_THREAD_MESSAGES: TypedDocumentNode<
  { getThreadMessages: AdminThreadMessagesResponse },
  { threadId: string; pagination?: PaginatedParams }
> = gql`
  query AdminGetThreadMessages(
    $threadId: String!
    $pagination: PaginationArgs
  ) {
    getThreadMessages(threadId: $threadId, pagination: $pagination) {
      data {
        _id
        content
        threadId
        senderType
        messageType
        createdAt
        updatedAt
      }
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;

/**
 * Feedback row as returned by the plain `getAllFeedback` query on the
 * feedback resolver. Prod does NOT join the user's email/name — the
 * frontend column just shows the raw userId. When the AdminModule
 * `adminGetAllFeedback` ships (which joins userEmail/userName server
 * side), swap the query here and enrich this type.
 */
export type ProdFeedbackRow = {
  _id: string;
  userId: string;
  rating: number;
  category: FeedbackCategory;
  message?: string | null;
  pagePath?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_GET_ALL_FEEDBACK: TypedDocumentNode<
  {
    getAllFeedback: {
      data: ProdFeedbackRow[];
      meta: {
        total: number;
        limit: number;
        page: number;
        lastPage: number;
        nextPage?: number;
        prevPage?: number;
      };
    };
  },
  { pagination?: PaginatedParams }
> = gql`
  query AdminGetAllFeedback($pagination: PaginationArgs) {
    getAllFeedback(pagination: $pagination) {
      data {
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
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;

/**
 * Fallback query used when the backend doesn't yet expose `getAllFeedback`
 * (i.e. before the new resolver has been deployed to prod). This is the
 * long-standing `getMyFeedback` endpoint — it only returns feedback
 * submitted by the currently authenticated user, so the admin will only
 * see their own rows until deploy lands.
 */
export const ADMIN_GET_MY_FEEDBACK_FALLBACK: TypedDocumentNode<
  {
    getMyFeedback: {
      data: ProdFeedbackRow[];
      meta: {
        total: number;
        limit: number;
        page: number;
        lastPage: number;
        nextPage?: number;
        prevPage?: number;
      };
    };
  },
  { pagination?: PaginatedParams }
> = gql`
  query AdminGetMyFeedbackFallback($pagination: PaginationArgs) {
    getMyFeedback(pagination: $pagination) {
      data {
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
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
    }
  }
`;
