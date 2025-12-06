import { StatusTypesEnum } from "@/core/types/api/api.enum";

export type ApiResponse<T> = {
  status: StatusTypesEnum;
  statusCode: number;
  message?: string | undefined;
  subscriptionRoute?: string | undefined;
  data?: T | undefined;
  error?: string | undefined;
  cause?: string | undefined;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    limit: number;
    page: number;
    lastPage: number;
    nextPage?: number;
    prevPage?: number;
  };
};

export type PaginatedParams = {
  page: number;
  limit: number;
  orderBy?: "asc" | "desc";
};

export type TokenPayload = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  iat: number;
  exp: number;
};

// Define the structure of a single error object in the errors array
export interface CustomGraphQLError {
  message: string;
  statusCode: number;
  code: string;
  details: {
    path?: string[];
    error?: string;
  };
}

export type BaseEntityProps = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
