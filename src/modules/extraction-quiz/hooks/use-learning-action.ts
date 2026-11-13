"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";
import { LEARNING_ACTION_MUTATION } from "../apollo/mutation/learning-action";
import type { LearningActionInput, LearningActionResponse } from "../types";

// Approved client-side fallback used only when the request itself never
// reaches the backend (network error / thrown mutation). The backend already
// returns a `friendly_error` response for upstream failures, so this mirrors
// that same shape rather than inventing new copy.
const NETWORK_FALLBACK: LearningActionResponse = {
  responseType: "friendly_error",
  payload: { text: "Sorry, I couldn't generate a question just now. Please try again." },
  statusCode: 0,
  message: "network_error",
  error: "network_error",
};

const RETRY_DELAY_MS = 800;

// Thin wrapper over the learning-action mutation. Always resolves to a typed
// response so callers can `switch` on `responseType` without try/catch.
// `retryOnError` retries once on a friendly_error (transient upstream blips).
export function useLearningAction() {
  const [run] = useMutation<
    { learningAction: LearningActionResponse },
    { input: LearningActionInput }
  >(LEARNING_ACTION_MUTATION);

  return useCallback(
    async (
      input: LearningActionInput,
      options?: { retryOnError?: boolean }
    ): Promise<LearningActionResponse> => {
      const once = async () => {
        try {
          const { data } = await run({ variables: { input } });
          return data?.learningAction ?? NETWORK_FALLBACK;
        } catch {
          return NETWORK_FALLBACK;
        }
      };
      const response = await once();
      if (!options?.retryOnError || response.responseType !== "friendly_error") {
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return once();
    },
    [run]
  );
}
