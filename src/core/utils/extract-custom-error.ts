"use client";

import { ApolloError } from "@apollo/client";
import { CustomGraphQLError } from "@/core/types/api/api";

/**
 * Parse Apollo errors into your custom format
 */
export default function extractCustomError(
  error?: ApolloError
): CustomGraphQLError[] {
  if (!error || !error.graphQLErrors || error.graphQLErrors.length === 0) {
    return [];
  }

  return error.graphQLErrors.map((graphQLError) => {
    // Type assertion to any first to help with the conversion
    const errorObj = graphQLError as any;

    return {
      message: errorObj.message,
      statusCode: errorObj.statusCode || 500,
      code: errorObj.code || "ERROR",
      details: {
        path: errorObj.path || null,
        error: errorObj.details?.error || null,
      },
    };
  });
}
