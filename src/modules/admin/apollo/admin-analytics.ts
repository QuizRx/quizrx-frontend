import { gql, TypedDocumentNode } from "@apollo/client";
import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import type {
  AdminThreadMessagesResponse,
  AdminThreadsResponse,
} from "../types";

export type AdminActivityKind = "login" | "logout" | "graphql" | "rest" | "chat";

export type AdminAnalyticsDay = {
  date: string;
  newUsers: number;
  activeUsers: number;
  logins: number;
  userMessages: number;
  learningAnswers: number;
};

export type AdminExperienceStat = {
  experience: string;
  answers: number;
  correct: number;
  partial: number;
  incorrect: number;
};

export type AdminCountStat = { key: string; count: number };

export type AdminAnalyticsOverview = {
  days: number;
  since: string;
  totals: {
    users: number;
    newUsers: number;
    activeUsers: number;
    activeToday: number;
    activeLast7Days: number;
    logins: number;
    threads: number;
    messages: number;
    userMessages: number;
    learningAnswers: number;
    feedbackCount: number;
    averageRating?: number | null;
  };
  daily: AdminAnalyticsDay[];
  experiences: AdminExperienceStat[];
  topTopics: AdminCountStat[];
  topActions: AdminCountStat[];
  loginProviders: AdminCountStat[];
};

export type AdminUserStatsRow = {
  _id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  status?: string | null;
  examPreparation?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  lastActivityAt?: string | null;
  loginCount: number;
  threadCount: number;
  learningAnswers: number;
  activityCount: number;
};

export type AdminUserSort = "createdAt" | "lastSeenAt" | "lastLoginAt" | "loginCount";

export type AdminUserDetail = {
  user: AdminUserStatsRow;
  userMessages: number;
  feedbackCount: number;
  experiences: AdminExperienceStat[];
  topTopics: AdminCountStat[];
  topActions: AdminCountStat[];
  daily: AdminAnalyticsDay[];
};

export type AdminActivityRow = {
  _id: string;
  userId: string;
  email?: string | null;
  kind: AdminActivityKind;
  operation: string;
  operationType?: string | null;
  summary?: string | null;
  details?: Record<string, unknown> | null;
  success: boolean;
  error?: string | null;
  durationMs?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  at: string;
};

export type AdminLearningRecordRow = {
  _id: string;
  experience: string;
  kind: string;
  topicId?: string | null;
  conceptId?: string | null;
  sessionId?: string | null;
  itemId?: string | null;
  selectedOption?: string | null;
  correctOption?: string | null;
  isCorrect?: boolean | null;
  anchorId?: string | null;
  generatedQuestion?: string | null;
  learnerResponse?: string | null;
  evaluation?: string | null;
  idealAnswerShown?: string | null;
  reportReason?: string | null;
  optionalComment?: string | null;
  responseTimeMs?: number | null;
  createdAt: string;
};

const META = `
  meta {
    total
    limit
    page
    lastPage
    nextPage
    prevPage
  }
`;

const DAY_FIELDS = gql`
  fragment AdminAnalyticsDayFields on AdminAnalyticsDay {
    date
    newUsers
    activeUsers
    logins
    userMessages
    learningAnswers
  }
`;

const EXPERIENCE_FIELDS = gql`
  fragment AdminExperienceStatFields on AdminExperienceStat {
    experience
    answers
    correct
    partial
    incorrect
  }
`;

const USER_STATS_FIELDS = gql`
  fragment AdminUserStatsFields on AdminUserStatsRow {
    _id
    email
    firstName
    lastName
    role
    status
    examPreparation
    createdAt
    lastLoginAt
    lastSeenAt
    lastActivityAt
    loginCount
    threadCount
    learningAnswers
    activityCount
  }
`;

export const ADMIN_ANALYTICS_OVERVIEW: TypedDocumentNode<
  { adminAnalyticsOverview: AdminAnalyticsOverview },
  { days?: number }
> = gql`
  ${DAY_FIELDS}
  ${EXPERIENCE_FIELDS}
  query AdminAnalyticsOverview($days: Int) {
    adminAnalyticsOverview(days: $days) {
      days
      since
      totals {
        users
        newUsers
        activeUsers
        activeToday
        activeLast7Days
        logins
        threads
        messages
        userMessages
        learningAnswers
        feedbackCount
        averageRating
      }
      daily {
        ...AdminAnalyticsDayFields
      }
      experiences {
        ...AdminExperienceStatFields
      }
      topTopics {
        key
        count
      }
      topActions {
        key
        count
      }
      loginProviders {
        key
        count
      }
    }
  }
`;

export const ADMIN_LIST_USERS_WITH_STATS: TypedDocumentNode<
  { adminListUsersWithStats: PaginatedResponse<AdminUserStatsRow> },
  {
    input?: {
      search?: string;
      sortBy?: AdminUserSort;
      page?: number;
      limit?: number;
    };
  }
> = gql`
  ${USER_STATS_FIELDS}
  query AdminListUsersWithStats($input: AdminUsersStatsInput) {
    adminListUsersWithStats(input: $input) {
      data {
        ...AdminUserStatsFields
      }
      ${META}
    }
  }
`;

export const ADMIN_USER_DETAIL: TypedDocumentNode<
  { adminUserDetail: AdminUserDetail },
  { userId: string }
> = gql`
  ${USER_STATS_FIELDS}
  ${DAY_FIELDS}
  ${EXPERIENCE_FIELDS}
  query AdminUserDetail($userId: String!) {
    adminUserDetail(userId: $userId) {
      user {
        ...AdminUserStatsFields
      }
      userMessages
      feedbackCount
      experiences {
        ...AdminExperienceStatFields
      }
      topTopics {
        key
        count
      }
      topActions {
        key
        count
      }
      daily {
        ...AdminAnalyticsDayFields
      }
    }
  }
`;

export const ADMIN_LIST_ACTIVITY: TypedDocumentNode<
  { adminListActivity: PaginatedResponse<AdminActivityRow> },
  {
    input?: {
      userId?: string;
      kind?: AdminActivityKind;
      search?: string;
      page?: number;
      limit?: number;
    };
  }
> = gql`
  query AdminListActivity($input: AdminActivityInput) {
    adminListActivity(input: $input) {
      data {
        _id
        userId
        email
        kind
        operation
        operationType
        summary
        details
        success
        error
        durationMs
        ip
        userAgent
        at
      }
      ${META}
    }
  }
`;

export const ADMIN_USER_LEARNING_RECORDS: TypedDocumentNode<
  { adminUserLearningRecords: PaginatedResponse<AdminLearningRecordRow> },
  {
    input: {
      userId: string;
      experience?: string;
      page?: number;
      limit?: number;
    };
  }
> = gql`
  query AdminUserLearningRecords($input: AdminLearningRecordsInput!) {
    adminUserLearningRecords(input: $input) {
      data {
        _id
        experience
        kind
        topicId
        conceptId
        sessionId
        itemId
        selectedOption
        correctOption
        isCorrect
        anchorId
        generatedQuestion
        learnerResponse
        evaluation
        idealAnswerShown
        reportReason
        optionalComment
        responseTimeMs
        createdAt
      }
      ${META}
    }
  }
`;

export const ADMIN_LIST_THREADS: TypedDocumentNode<
  { adminGetAllThreads: AdminThreadsResponse },
  { pagination?: PaginatedParams; userId?: string }
> = gql`
  query AdminListThreads($pagination: PaginationArgs, $userId: String) {
    adminGetAllThreads(pagination: $pagination, userId: $userId) {
      data {
        _id
        title
        description
        userId
        userEmail
        userName
        messageCount
        createdAt
        updatedAt
      }
      ${META}
    }
  }
`;

export const ADMIN_THREAD_MESSAGES: TypedDocumentNode<
  { adminGetThreadMessages: AdminThreadMessagesResponse },
  { threadId: string; pagination?: PaginatedParams }
> = gql`
  query AdminThreadMessages($threadId: String!, $pagination: PaginationArgs) {
    adminGetThreadMessages(threadId: $threadId, pagination: $pagination) {
      data {
        _id
        content
        threadId
        senderType
        messageType
        createdAt
        updatedAt
      }
      ${META}
    }
  }
`;