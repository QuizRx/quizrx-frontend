"use client";

import { useAuth } from "@/core/providers/auth";

/**
 * Closed-beta admin allowlist.
 *
 * NOTE: This is a CLIENT-SIDE gate only. Any authenticated user could bypass
 * the UI and call the underlying GraphQL queries directly, since the prod
 * backend currently has no role guard on `getAllUsers` / `getAllThreads`.
 * The hardened, server-trusted version (`isCurrentUserAdmin` + `AdminGuard`)
 * is already in `quizrx-backend-api/src/core/admin/` and just needs the
 * backend to be deployed for it to take effect.
 *
 * To add more admins for now, edit this array (case-insensitive match).
 */
const ADMIN_EMAILS: ReadonlyArray<string> = ["test@gmail.com"];

const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

export function useIsAdmin(): { isAdmin: boolean | null; loading: boolean } {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  if (authLoading) {
    return { isAdmin: null, loading: true };
  }
  if (!isAuthenticated) {
    return { isAdmin: false, loading: false };
  }

  const email = (user?.email || "").toLowerCase();
  return { isAdmin: email.length > 0 && ADMIN_EMAIL_SET.has(email), loading: false };
}
