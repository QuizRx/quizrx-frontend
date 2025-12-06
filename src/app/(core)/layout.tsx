"use client";

import { Background } from "@/core/components/ui/background";
import { useAuth } from "@/core/providers/auth";
import { useRequireStatus } from "@/core/hooks/use-require-status";
import { useRequireSubscription } from "@/core/hooks/use-require-subscription";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useRequireStatus(
    "/subscribe",
    "ACTIVE",
    "Subscription Required",
    "You must have an active subscription to access this area."
  );
  const { DialogComponent } = useRequireSubscription();

  // Show nothing while loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex-1">
      <Background
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center pointer-events-none"
        image="/background/bg.svg"
      />
      {DialogComponent}
      <div className="bg-transparent">{children}</div>
    </div>
  );
}
