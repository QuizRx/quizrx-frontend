import { gql, TypedDocumentNode } from "@apollo/client";
import { PaginatedParams } from "@/core/types/api/api";
import { FeedbackCategory } from "@/modules/feedback/types/api/feedback";
import type {
  AdminCreateKnowledgeNoteInput,
  AdminKnowledgeNoteMutationResult,
  AdminKnowledgeNoteResponse,
  AdminKnowledgeNoteRow,
  AdminKnowledgeNotesListInput,
  AdminKnowledgeNotesListResponse,
  AdminKnowledgeNotesPublishState,
  AdminKnowledgeNoteVersionRow,
  AdminThreadMessagesResponse,
  AdminUpdateKnowledgeNoteInput,
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

const ADMIN_KNOWLEDGE_NOTE_ROW = gql`
  fragment AdminKnowledgeNoteFields on AdminKnowledgeNoteRow {
    anchorId
    topicId
    conceptId
    section
    type
    text
    chainVersion
    status
    substrate
    publishedAt
    archivedAt
    lastEditedBy
    createdAt
    updatedAt
  }
`;

export const ADMIN_LIST_KNOWLEDGE_NOTES: TypedDocumentNode<
  { adminListKnowledgeNotes: AdminKnowledgeNotesListResponse },
  { input?: AdminKnowledgeNotesListInput }
> = gql`
  query AdminListKnowledgeNotes($input: AdminKnowledgeNotesListInput) {
    adminListKnowledgeNotes(input: $input) {
      data {
        ...AdminKnowledgeNoteFields
      }
      meta {
        total
        limit
        page
        lastPage
        nextPage
        prevPage
      }
      processingState
      processingError
      activeNoteVersion
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_GET_KNOWLEDGE_NOTE: TypedDocumentNode<
  { adminGetKnowledgeNote: AdminKnowledgeNoteResponse },
  { anchorId: string }
> = gql`
  query AdminGetKnowledgeNote($anchorId: String!) {
    adminGetKnowledgeNote(anchorId: $anchorId) {
      note {
        ...AdminKnowledgeNoteFields
      }
      processingState
      processingError
      activeNoteVersion
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_KNOWLEDGE_NOTES_PUBLISH_STATE: TypedDocumentNode<
  { adminKnowledgeNotesPublishState: AdminKnowledgeNotesPublishState }
> = gql`
  query AdminKnowledgeNotesPublishState {
    adminKnowledgeNotesPublishState {
      processingState
      processingError
      activeNoteVersion
    }
  }
`;

export const ADMIN_LIST_KNOWLEDGE_NOTE_VERSIONS: TypedDocumentNode<
  { adminListKnowledgeNoteVersions: AdminKnowledgeNoteVersionRow[] },
  { anchorId: string }
> = gql`
  query AdminListKnowledgeNoteVersions($anchorId: String!) {
    adminListKnowledgeNoteVersions(anchorId: $anchorId) {
      versionId
      anchorId
      topicId
      conceptId
      section
      type
      text
      chainVersion
      publishedBy
      publishedAt
    }
  }
`;

export const ADMIN_CREATE_KNOWLEDGE_NOTE: TypedDocumentNode<
  { adminCreateKnowledgeNote: AdminKnowledgeNoteRow },
  { input: AdminCreateKnowledgeNoteInput }
> = gql`
  mutation AdminCreateKnowledgeNote($input: AdminCreateKnowledgeNoteInput!) {
    adminCreateKnowledgeNote(input: $input) {
      ...AdminKnowledgeNoteFields
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_UPDATE_KNOWLEDGE_NOTE: TypedDocumentNode<
  { adminUpdateKnowledgeNote: AdminKnowledgeNoteRow },
  { anchorId: string; input: AdminUpdateKnowledgeNoteInput }
> = gql`
  mutation AdminUpdateKnowledgeNote(
    $anchorId: String!
    $input: AdminUpdateKnowledgeNoteInput!
  ) {
    adminUpdateKnowledgeNote(anchorId: $anchorId, input: $input) {
      ...AdminKnowledgeNoteFields
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_PUBLISH_KNOWLEDGE_NOTE: TypedDocumentNode<
  { adminPublishKnowledgeNote: AdminKnowledgeNoteMutationResult },
  { anchorId: string }
> = gql`
  mutation AdminPublishKnowledgeNote($anchorId: String!) {
    adminPublishKnowledgeNote(anchorId: $anchorId) {
      ok
      note {
        ...AdminKnowledgeNoteFields
      }
      processingState
      processingError
      activeNoteVersion
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_ARCHIVE_KNOWLEDGE_NOTE: TypedDocumentNode<
  { adminArchiveKnowledgeNote: AdminKnowledgeNoteMutationResult },
  { anchorId: string }
> = gql`
  mutation AdminArchiveKnowledgeNote($anchorId: String!) {
    adminArchiveKnowledgeNote(anchorId: $anchorId) {
      ok
      note {
        ...AdminKnowledgeNoteFields
      }
      processingState
      processingError
      activeNoteVersion
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

export const ADMIN_RESTORE_KNOWLEDGE_NOTE_VERSION: TypedDocumentNode<
  { adminRestoreKnowledgeNoteVersion: AdminKnowledgeNoteRow },
  { versionId: string }
> = gql`
  mutation AdminRestoreKnowledgeNoteVersion($versionId: String!) {
    adminRestoreKnowledgeNoteVersion(versionId: $versionId) {
      ...AdminKnowledgeNoteFields
    }
  }
  ${ADMIN_KNOWLEDGE_NOTE_ROW}
`;

