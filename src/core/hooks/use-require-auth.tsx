import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/providers/auth";
import { toast } from "@/core/hooks/use-toast";

/**
 * Hook to protect routes: redirects to a specified path if user is not authenticated.
 * @param redirectTo route to redirect to (default: "/")
 */
export function useRequireAuth(redirectTo: string = "/") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [runOnce, setRunOnce] = useState(false);
  useEffect(() => {
    if (runOnce) return; // Prevents multiple redirects on initial render
    if (!isLoading){ 
      setRunOnce(true); // Set to true to prevent further redirects
      if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to:", redirectTo);
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "You must be logged in to access this area.",
        });
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}
