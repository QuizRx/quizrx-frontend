import { useCallback, useState } from "react";

export interface AuthErrorState {
  code: string;
  message: string;
  userMessage: string;
  recoveryAction?: string;
  retryable: boolean;
}

export const mapFirebaseAuthError = (error: any): AuthErrorState => {
  const errorMap: Record<string, Omit<AuthErrorState, "code">> = {
    "auth/user-not-found": {
      message: "User not found",
      userMessage: "No account found with this email address.",
      recoveryAction: "signup",
      retryable: false,
    },
    "auth/wrong-password": {
      message: "Invalid password",
      userMessage: "The password you entered is incorrect.",
      recoveryAction: "reset-password",
      retryable: false,
    },
    "auth/invalid-credential": {
      message: "Invalid credential",
      userMessage: "The credential you entered is incorrect.",
      recoveryAction: "reset-password",
      retryable: false,
    },
    "auth/too-many-requests": {
      message: "Too many requests",
      userMessage: "Too many failed attempts. Please try again later.",
      retryable: false,
    },
    "auth/network-request-failed": {
      message: "Network error",
      userMessage: "Network error. Please check your connection.",
      retryable: false,
    },
    "auth/email-already-in-use": {
      message: "Email in use",
      userMessage: "An account with this email already exists.",
      recoveryAction: "login",
      retryable: false,
    },
    "auth/popup-closed-by-user": {
      message: "Popup closed",
      userMessage: "The window was closed before completing the access.",
      retryable: false,
    },
    "auth/cancelled-popup-request": {
      message: "Cancelled popup request",
      userMessage: "There was another login in progress. Try again.",
      retryable: false,
    },
    "auth/popup-blocked": {
      message: "Popup blocked",
      userMessage:
        "The browser blocked the window. Allow popups or use the redirect mode.",
      recoveryAction: "use-redirect",
      retryable: false,
    },
  };

  const mappedError = errorMap[error.code] || {
    message: "Unknown error",
    userMessage: "An unexpected error occurred. Please try again.",
    retryable: true,
  };

  return {
    code: error.code,
    ...mappedError,
  };
};

// Hook for handling errors with automatic retry
export const useAuthErrorHandler = () => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleAuthError = useCallback(
    async (
      error: any,
      operation: () => Promise<any>,
      onError?: (errorState: AuthErrorState) => void
    ) => {
      const errorState = mapFirebaseAuthError(error);

      if (errorState.retryable && retryCount < maxRetries) {
        // Exponential backoff for retry
        const delay = Math.pow(2, retryCount) * 1000;

        setTimeout(async () => {
          try {
            setRetryCount((prev) => prev + 1);
            await operation();
            setRetryCount(0);
          } catch (retryError) {
            handleAuthError(retryError, operation, onError);
          }
        }, delay);
      } else {
        setRetryCount(0);
        onError?.(errorState);
      }
    },
    [retryCount, maxRetries]
  );

  return { handleAuthError };
};
