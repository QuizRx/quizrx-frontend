"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/core/providers/auth";
import { useIsAdmin } from "@/modules/admin/hooks/use-is-admin";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    // 1. Unauthenticated -> kick to root (which renders the landing/login).
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
      return;
    }
    // 2. Authenticated but server says not an admin -> back to /chat.
    if (!loading && isAdmin === false && isAuthenticated) {
      router.replace("/chat");
    }
  }, [authLoading, isAuthenticated, isAdmin, loading, router]);

  if (authLoading || loading || isAdmin === null) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || isAdmin === false) {
    return null;
  }

  return <div className="min-h-dvh bg-background">{children}</div>;
}
