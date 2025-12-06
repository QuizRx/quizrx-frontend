"use client";
import SubscriptionPlanLayout from "@/modules/landing/layouts/subscription/subscription-plan";
import { useRequireAuth } from "@/core/hooks/use-require-auth";

export default function Page() {
  const { isAuthenticated, isLoading } = useRequireAuth();
   if (isLoading || !isAuthenticated) return null;
  return (
    <div className="flex flex-col gap-4">
      <SubscriptionPlanLayout />
    </div>
  );
}
