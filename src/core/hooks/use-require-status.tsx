import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/providers/auth";
import { useUser } from "@/core/providers/user";
import { toast } from "@/core/hooks/use-toast";


/**
 * Hook to protect routes: redirects to /subscribe if user is not active.
 * @param redirectTo route to redirect to (default: "/subscribe")
 */
export function useRequireStatus(redirectTo: string = "/subscribe", status: string = "ACTIVE", toastTitle: string = "Subscription Required", toastMessage: string = "You must have an active subscription to access this area.") {
  const { user, loading } = useUser();
  const router = useRouter();
  const [loadOnce, setLoadOnce] = useState(false);
  useEffect(() => {
    if (loadOnce || !user) return;
    if (!loading && user)
      setLoadOnce(true)
      if (user?.status !== status) {
        toast({
          variant: "destructive",
          title: toastTitle,
          description: toastMessage,
        });
      router.replace(redirectTo);
    }
  }, [user, loading, router]);

  return { isActive: user?.status === "ACTIVE", loading };
}
