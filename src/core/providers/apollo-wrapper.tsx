"use client";

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  FetchResult,
  HttpLink,
  InMemoryCache,
  Observable,
  RefetchQueriesInclude,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { getCookie } from "cookies-next";

// Create a client instance that can be accessed throughout the app
export let apolloClientInstance: ApolloClient<any> | null = null;

// Function to refresh queries
export function refetchQueries(include: RefetchQueriesInclude) {
  if (!apolloClientInstance) {
    console.error("Apollo client not initialized yet");
    return;
  }

  apolloClientInstance.refetchQueries({
    include,
  });
}

// Create wrapper component
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  const { token, refreshToken } = useAuth();
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  useEffect(() => {
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL + "/graphql",
      fetchOptions: {
        cache: "no-store",
      },
    });

    // Create an error handling link with token refresh
    const errorLink = onError(
      ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          for (const err of graphQLErrors) {
            const message = err.message || "";

            // Look for authentication errors (adjust based on your backend error format)
            if (
              message.includes("token expired") ||
              message.includes("auth/id-token-expired") ||
              message.includes("jwt expired") ||
              message.includes("Unauthorized") ||
              message.includes("invalid token")
            ) {
              // Return a promise that will retry the operation with a new token
              return new Observable<FetchResult>((observer) => {
                // Silent refresh
                refreshToken()
                  .then((newToken) => {
                    if (!newToken) {
                      throw new Error("Failed to refresh token");
                    }

                    // Clone the operation and modify headers with new token
                    const oldHeaders = operation.getContext().headers;
                    operation.setContext({
                      headers: {
                        ...oldHeaders,
                        Authorization: `Bearer ${newToken}`,
                      },
                    });
                  })
                  .then(() => {
                    // Retry the operation with new token
                    const subscriber = {
                      next: observer.next.bind(observer),
                      error: observer.error.bind(observer),
                      complete: observer.complete.bind(observer),
                    };

                    forward(operation).subscribe(subscriber);
                  })
                  .catch((error) => {
                    observer.error(error);
                  });
              });
            }
          }
        }

        if (networkError) {
          console.error(`[Network error]:`, networkError);
        }
      }
    );

    // Create authentication link to add the token to every request
    const authLink = new ApolloLink((operation, forward) => {
      const newToken = token || getCookie("token");
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          Authorization: newToken ? `Bearer ${newToken}` : "",
        },
      }));

      return forward(operation);
    });

    // Combine the links
    const link = ApolloLink.from([errorLink, authLink, httpLink]);

    const apolloClient = new ApolloClient({
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              getUserQuestions: {
                // Merge function to handle paginated data
                keyArgs: ["filter"],
                merge(existing, incoming, { args }) {
                  // If it's a new page request, return the incoming data
                  return incoming;
                },
              },
              getUserQuestionBanks: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
              getUserQuiz: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
              topics: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
      link,
      defaultOptions: {
        mutate: {
          errorPolicy: "all",
        },
        watchQuery: {
          fetchPolicy: "cache-and-network", // Changed from no-cache to cache-and-network
          errorPolicy: "all",
          nextFetchPolicy: "cache-first", // Use cache for subsequent requests
        },
        query: {
          fetchPolicy: "cache-first", // Changed from no-cache to cache-first for better performance
          errorPolicy: "all",
        },
      },
    });

    // Store client instance for use outside of React components
    apolloClientInstance = apolloClient;

    // Also make it available globally for backward compatibility
    if (typeof window !== "undefined") {
      window.apolloClient = apolloClient;
    }

    setClient(apolloClient);
  }, [token, refreshToken]);

  if (!client) {
    // You could return a loading state here if needed
    return null;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

// Add the global type declaration in the same file
declare global {
  interface Window {
    apolloClient: ApolloClient<any>;
  }
}
