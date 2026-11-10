"use client";

import { useAuth } from "@/core/providers/auth";

/**
 * Closed-beta admin allowlist.
 *
 * NOTE: This is a CLIENT-SIDE gate only for showing the admin nav.
 * Server trust is `AdminGuard` + `NEST_ADMIN_EMAILS` on every admin* query
 * (analytics, users, activity, chats). Keep this allowlist in sync with
 * that env for the UI to match API access.
 *
 * To add more admins for now, edit this array (case-insensitive match).
 */
const ADMIN_EMAILS: ReadonlyArray<string> = ["admin@quizrx.ai"];

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
