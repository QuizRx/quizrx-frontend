"use client";
import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useAuth } from "./auth";


const GET_USER_SUBSCRIPTION = gql`
query FindUserSubscription {
  findUserSubscription {
    userId
    subscriptionId
    status
    cancelationInfo {
      date
      reason
    }
    availableUntil
    createdAt
    updatedAt
  }
}`
// GraphQL query to get user by id
export const GET_USER = gql`
  query User {
    user {
      _id
      firstName
      lastName
      email
      role
      status
      stripeCustomerId
      createdAt
      updatedAt
    }
  }
`;
/**
 * Custom hook to fetch the current user's information from GraphQL by their id.
 * Returns { data, loading, error, refetch }
 */
export function useCurrentUserGql() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const skip = !userId;
  const { data, loading, error, refetch } = useQuery(GET_USER, {
    skip,
    fetchPolicy: "cache-first", // Changed from network-only for much better performance
    // Only refetch if data is stale (older than 5 minutes)
    nextFetchPolicy: "cache-first",
  });
  return { data: data?.user, loading, error, refetch };
}

/**
 * Custom hook to fetch the current user's subscription from GraphQL by their id.
 * Returns { data, loading, error, refetch }
 */
export function useCurrentUserSubscriptionGql() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const skip = !userId;
  const { data, loading, error, refetch } = useQuery(GET_USER_SUBSCRIPTION, {
    skip,
    fetchPolicy: "cache-first", // Changed from network-only for much better performance
    // Only refetch if data is stale (older than 5 minutes)
    nextFetchPolicy: "cache-first",
  });
  return { data: data?.findUserSubscription, loading, error, refetch };
}

// User context type
interface UserContextType {
  user: ReturnType<typeof useCurrentUserGql>["data"];
  userSubscription: ReturnType<typeof useCurrentUserSubscriptionGql>["data"];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user, loading: userLoading, error: userError, refetch: refetchUser } = useCurrentUserGql();
  const { data: userSubscription, loading: subLoading, error: subError, refetch: refetchSub } = useCurrentUserSubscriptionGql();
  const loading = userLoading || subLoading;
  const error = userError || subError;
  const refetch = async () => {
    await Promise.all([refetchUser(), refetchSub()]);
  };
  return (
    <UserContext.Provider value={{ user, userSubscription, loading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

