"use client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  signOut as firebaseSignOut,
  getIdToken,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { auth } from "../configs/firebase";
import { toast } from "../hooks/use-toast";
import { getTokenInfo } from "../middleware/decode-jwt";
import { DecodedJwtTokenType } from "../types/api/auth";

interface AuthProps {
  token: string | null;
  user: DecodedJwtTokenType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string, redirectPath?: string) => Promise<void>;
  signOut: (redirectPath?: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const initialState: Omit<AuthProps, "signIn" | "signOut" | "refreshToken"> = {
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthProps | null>(null);

// Token refresh interval (50 minutes)
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;

// Cookie max age (7 days)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] =
    useState<Omit<AuthProps, "signIn" | "signOut" | "refreshToken">>(
      initialState
    );
  const router = useRouter();

  // Use refs to track current token and refresh timers
  const currentTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Function to refresh the Firebase token
  const refreshToken = async (): Promise<string | null> => {
    try {
      if (!auth.currentUser) {
        console.log("No current user to refresh token");
        return null;
      }

      // Force token refresh
      const newToken = await getIdToken(auth.currentUser, true);

      if (newToken) {
        // Update cookie with new token
        setCookie("token", newToken, {
          maxAge: COOKIE_MAX_AGE,
          path: "/",
        });

        // Update current token ref
        currentTokenRef.current = newToken;

        // Update auth state with new token
        const decodedUser = await getTokenInfo(newToken);
        setAuthState((prev) => ({
          ...prev,
          token: newToken,
          user: decodedUser || prev.user,
        }));

        return newToken;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Function to set up token refresh timer
  const setupRefreshTimer = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set new refresh timer
    refreshTimerRef.current = setTimeout(async () => {
      console.log("Refreshing token...");
      await refreshToken();
      // Set up the next refresh
      setupRefreshTimer();
    }, TOKEN_REFRESH_INTERVAL);
  };

  const handleAuthStateChange = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        const decodedUser = await getTokenInfo(idToken);

        if (decodedUser) {
          setCookie("token", idToken, {
            maxAge: COOKIE_MAX_AGE,
            path: "/",
          });

          currentTokenRef.current = idToken;
          setAuthState({
            token: idToken,
            user: decodedUser,
            isLoading: false,
            isAuthenticated: true,
          });

          setupRefreshTimer();
        }
      } catch (error) {
        console.error("Error handling Firebase auth state change:", error);
        await handleSignOut();
      }
    } else {
      await handleSignOut();
    }
  };

  const handleSignOut = async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    deleteCookie("token", { path: "/" });

    currentTokenRef.current = null;

    setAuthState({
      ...initialState,
      isLoading: false,
    });
  };

  // Sign in method
  const signIn = async (
    token: string,
    redirectPath?: string
  ): Promise<void> => {
    try {
      // Validate the token by decoding it
      const decodedUser = await getTokenInfo(token);

      if (!decodedUser) {
        throw new Error("Invalid token");
      }

      // Set the token in cookies
      setCookie("token", token, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      // Update the ref
      currentTokenRef.current = token;

      // Update auth state
      setAuthState({
        token,
        user: decodedUser,
        isLoading: false,
        isAuthenticated: true,
      });

      // Show success message
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${
          decodedUser.name || decodedUser.email || "user"
        }!`,
      });

      // Set up token refresh timer
      setupRefreshTimer();

      // Redirect if path provided
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Unable to sign in with the provided token",
      });

      // Ensure auth state is reset
      currentTokenRef.current = null;
      setAuthState({
        ...initialState,
        isLoading: false,
      });
    }
  };

  // Sign out method
  const signOut = async (redirectPath: string = "/"): Promise<void> => {
    try {
      // Start redirect (but wait a bit before completing sign-out)
      router.push(redirectPath);

      // Wait 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Firebase sign out if using Firebase
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }

      await handleSignOut();

      // Show success message
      toast({
        title: "Signed out successfully",
        description: "You have been signed out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "There was an issue signing you out. Please try again.",
      });
    }
  };

  // Initial auth check and Firebase auth state listener setup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokenFromCookie = getCookie("token") as string | undefined;

        if (tokenFromCookie && !isInitializedRef.current) {
          // Update the ref
          currentTokenRef.current = tokenFromCookie;

          try {
            const decodedUser = await getTokenInfo(tokenFromCookie);

            if (decodedUser) {
              setAuthState({
                token: tokenFromCookie,
                user: decodedUser,
                isLoading: false,
                isAuthenticated: true,
              });

              setupRefreshTimer();
            } else {
              throw new Error("Invalid token in cookie");
            }
          } catch (error) {
            console.error("Token validation error:", error);

            // Try to refresh the token immediately if the current one is invalid
            const newToken = await refreshToken();
            if (!newToken) {
              throw new Error("Failed to refresh token");
            }
          }
        } else if (!tokenFromCookie) {
          setAuthState({
            ...initialState,
            isLoading: false,
          });
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.error("Auth initialization error:", error);

        if (getCookie("token")) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again",
          });
          router.push("/auth/login");
        }

        // Update the ref
        currentTokenRef.current = null;

        setAuthState({
          ...initialState,
          isLoading: false,
        });

        isInitializedRef.current = true;
      }
    };

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Only handle auth state changes after initial setup is complete
      if (isInitializedRef.current) {
        handleAuthStateChange(firebaseUser);
      }
    });

    // Initialize auth first
    initializeAuth();

    // Clean up the timer and listener on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      unsubscribe();
    };
  }, [router]);

  // The complete auth context value with methods
  const authContextValue: AuthProps = {
    ...authState,
    signIn,
    signOut,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
