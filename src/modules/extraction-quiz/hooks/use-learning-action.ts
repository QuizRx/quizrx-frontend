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

// Thin wrapper over the learning-action mutation. Always resolves to a typed
// response so callers can `switch` on `responseType` without try/catch.
export function useLearningAction() {
  const [run] = useMutation<
    { learningAction: LearningActionResponse },
    { input: LearningActionInput }
  >(LEARNING_ACTION_MUTATION);

  return useCallback(
    async (input: LearningActionInput): Promise<LearningActionResponse> => {
      try {
        const { data } = await run({ variables: { input } });
        return data?.learningAction ?? NETWORK_FALLBACK;
      } catch {
        return NETWORK_FALLBACK;
      }
    },
    [run]
  );
}
