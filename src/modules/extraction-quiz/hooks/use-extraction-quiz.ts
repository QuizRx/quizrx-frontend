"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import type { ApolloClient } from "@apollo/client";
import { useCallback } from "react";
import { toast } from "@/core/hooks/use-toast";
import { GET_EXTRACTION_QUESTION_QUERY } from "../apollo/query/extraction-question";
import { SUBMIT_QUESTION_FEEDBACK_MUTATION } from "../apollo/mutation/submit-question-feedback";
import {
  buildDpId,
  useExtractionQuizStore,
} from "../store/extraction-quiz-store";
import { useChainPoolStore } from "../store/chain-pool-store";
import {
  parseExplicitDpIndex,
  pickBestMatch,
  pickNextUnseen,
} from "../utils/match";
import type {
  ExtractionQuestionData,
  ExtractionQuestionResponse,
  QuestionFeedbackInput,
  QuestionFeedbackResult,
} from "../types";

// Soft cap on how many DPs we'll attempt to warm per chain. The largest
// chains in this beta have ~30 DPs; 60 leaves comfortable headroom while
// keeping the worst-case API call count bounded.
const POOL_WARM_LIMIT = 60;

// Was this error caused by the cognitive service not having a question at
// this dp_id (i.e. we've walked past the end of the chain)?
const looksLikeChainExhausted = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "";
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("notfound") ||
    normalized.includes("404") ||
    normalized.includes("no question") ||
    normalized.includes("dp_id") ||
    normalized.includes("dpid")
  );
};

// Fetch a single dp_id from the cognitive service via GraphQL. Returns the
// raw question payload, or null on error. Centralised so the warm-up loop
// and the main fetch path share exactly the same plumbing.
async function fetchOneQuestion(
  client: ApolloClient<unknown>,
  chainId: string,
  dpId: string
): Promise<ExtractionQuestionData | null> {
  try {
    const result = await client.query<{
      getExtractionQuestion: ExtractionQuestionResponse;
    }>({
      query: GET_EXTRACTION_QUESTION_QUERY,
      variables: { chainId, dpId },
      fetchPolicy: "no-cache",
    });
    const payload = result.data?.getExtractionQuestion;
    if (!payload || payload.error) return null;
    const data = payload.data as ExtractionQuestionData | null;
    if (!data?.question) return null;
    return data;
  } catch {
    return null;
  }
}

export function useExtractionQuiz() {
  const client = useApolloClient();
  const setIsFetching = useExtractionQuizStore((s) => s.setIsFetching);
  const setError = useExtractionQuizStore((s) => s.setError);
  const appendAttempt = useExtractionQuizStore((s) => s.appendAttempt);
  const appendSystem = useExtractionQuizStore((s) => s.appendSystem);
  const sessionId = useExtractionQuizStore((s) => s.sessionId);
  const markFeedbackSubmitted = useExtractionQuizStore(
    (s) => s.markFeedbackSubmitted
  );
  const getNextDpIndex = useExtractionQuizStore((s) => s.getNextDpIndex);
  const advanceChainProgress = useExtractionQuizStore(
    (s) => s.advanceChainProgress
  );
  const resetChainProgress = useExtractionQuizStore(
    (s) => s.resetChainProgress
  );

  const [runSubmitFeedback] = useMutation<
    { submitQuestionFeedback: QuestionFeedbackResult },
    { input: QuestionFeedbackInput }
  >(SUBMIT_QUESTION_FEEDBACK_MUTATION);

  // -----------------------------------------------------------------------
  // warmChain
  // -----------------------------------------------------------------------
  // Lazily populate the per-chain pool of authored questions so we can do
  // content-aware picks later. We read directly off the store (NOT a hook
  // selector) so this can be called from callbacks without re-renders.
  // -----------------------------------------------------------------------
  const warmChain = useCallback(
    async (chainId: string): Promise<void> => {
      const pool = useChainPoolStore.getState();
      if (pool.loading[chainId]) return;
      // Already warmed at least once — skip. Pools don't change mid-session.
      if (pool.warmedAt[chainId]) return;

      pool.startLoading(chainId);

      try {
        const collected: ExtractionQuestionData[] = [];
        for (let i = 1; i <= POOL_WARM_LIMIT; i += 1) {
          const dpId = buildDpId(chainId, i);
          const data = await fetchOneQuestion(client, chainId, dpId);
          if (!data) {
            // Treat the first miss as "end of chain". This keeps API call
            // counts honest and stops us probing dp_ids that don't exist.
            break;
          }
          collected.push(data);
        }
        useChainPoolStore.getState().finishLoading(chainId, collected);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to warm chain pool.";
        useChainPoolStore.getState().failLoading(chainId, message);
      }
    },
    [client]
  );

  // -----------------------------------------------------------------------
  // fetchQuestion
  // -----------------------------------------------------------------------
  // Picks (and renders) the next question for the user. Selection priority:
  //   1. Caller-supplied dpId override (rare; mostly for re-fetches)
  //   2. Explicit "DP-N" / "question N" / "q N" / "#N" in the user prompt
  //   3. Keyword match against the cached chain pool (skipping seen dp_ids)
  //   4. Lowest-indexed unseen question in the cached pool
  //   5. Sequential walk using chainProgress (works even before the pool is
  //      warm, so the user is never blocked)
  //
  // Whichever path is chosen, the request goes to the cognitive service
  // with a SPECIFIC dpId — we never send a `null` dpId, so the server never
  // serves a random pick.
  // -----------------------------------------------------------------------
  const fetchQuestion = useCallback(
    async (
      chainId: string,
      options?: { userPrompt?: string; dpId?: string }
    ) => {
      const dpIdOverride = options?.dpId;
      const userPrompt = options?.userPrompt?.trim() ?? "";

      setIsFetching(true);
      setError(null);

      // Build the set of dp_ids the user has already seen this session.
      // We grab a snapshot at the top of the call so concurrent state
      // changes (e.g. appendAttempt firing later in this same call) don't
      // affect the picking decision.
      const seenDpIds = new Set(
        useExtractionQuizStore
          .getState()
          .entries.flatMap((e) =>
            e.kind === "attempt" ? [e.attempt.question.question.dp_id] : []
          )
      );

      // ---- Path 1: explicit override --------------------------------------
      let requestedDpId: string | null = dpIdOverride ?? null;
      let advance = false; // only sequential picks should bump chainProgress
      let pickSource: "override" | "explicit" | "match" | "next" | "walk" =
        "override";

      // ---- Path 2: explicit DP reference in the user's prompt -------------
      if (!requestedDpId && userPrompt) {
        const explicitIdx = parseExplicitDpIndex(userPrompt);
        if (explicitIdx !== null) {
          requestedDpId = buildDpId(chainId, explicitIdx);
          pickSource = "explicit";
        }
      }

      // Pool-driven paths only apply if the user actually typed something.
      // For an empty prompt we go straight to the sequential walk so the
      // behaviour stays predictable.
      if (!requestedDpId && userPrompt) {
        const pool = useChainPoolStore.getState().pools[chainId] ?? [];

        // ---- Path 3: keyword match ---------------------------------------
        const matched = pickBestMatch(userPrompt, pool, seenDpIds);
        if (matched) {
          requestedDpId = matched.question.dp_id;
          pickSource = "match";
        } else {
          // ---- Path 4: next unseen in the pool ---------------------------
          const next = pickNextUnseen(pool, seenDpIds);
          if (next) {
            requestedDpId = next.question.dp_id;
            pickSource = "next";
          }
        }
      }

      // ---- Path 5: sequential fallback ------------------------------------
      let targetIndex: number | null = null;
      if (!requestedDpId) {
        targetIndex = getNextDpIndex(chainId);
        requestedDpId = buildDpId(chainId, targetIndex);
        advance = true;
        pickSource = "walk";
      }

      try {
        // Try the in-memory pool first — if the question is already cached,
        // we can append the attempt without going back to the server.
        const cached = useChainPoolStore
          .getState()
          .pools[chainId]?.find(
            (q) => q.question.dp_id === requestedDpId
          );

        const data =
          cached ?? (await fetchOneQuestion(client, chainId, requestedDpId));

        if (!data) {
          throw new Error("Question not found for the requested dp_id.");
        }

        const attempt = appendAttempt(chainId, data);

        if (advance) {
          advanceChainProgress(chainId);
        }
        // `pickSource` is intentionally not surfaced to the UI — it's here
        // for future debugging / analytics if we want to log it.
        void pickSource;

        return attempt;
      } catch (err) {
        const exhausted =
          advance &&
          targetIndex !== null &&
          targetIndex > 1 &&
          looksLikeChainExhausted(err);

        if (exhausted) {
          resetChainProgress(chainId);
          appendSystem(
            "You've reached the end of this chain's questions. Pick another topic, start a new session, or ask again to begin from the first question."
          );
          setError(null);
          return null;
        }

        const message =
          err instanceof Error ? err.message : "Could not load a question.";
        setError(message);
        appendSystem(`We couldn't fetch a question: ${message}`);
        toast({ title: "Question failed", description: message });
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [
      client,
      setIsFetching,
      setError,
      appendAttempt,
      appendSystem,
      getNextDpIndex,
      advanceChainProgress,
      resetChainProgress,
    ]
  );

  // `submitQuestionFeedback` is reused for two different intents:
  //   1. Recording the initial answer + trap analytics (silent) — the user
  //      just clicked an option, they didn't opt into leaving feedback.
  //   2. Actual feedback: thumbs up/down or a free-text comment (noisy) —
  //      the user explicitly took a feedback action and expects an ack.
  // Callers pass `silent: true` for (1) so we skip the toast, and default
  // to (2) so thumbs / comments still get "Thanks for the feedback".
  const submitFeedback = useCallback(
    async (
      input: QuestionFeedbackInput,
      attemptId: string,
      options?: { silent?: boolean }
    ) => {
      const silent = options?.silent ?? false;
      try {
        const { data } = await runSubmitFeedback({
          variables: { input: { ...input, sessionId } },
        });
        const result = data?.submitQuestionFeedback;
        if (!result || result.error) {
          throw new Error(result?.error || "Feedback failed.");
        }
        markFeedbackSubmitted(attemptId);
        if (!silent) {
          toast({
            title: "Thanks for the feedback",
            description: "Your response was recorded.",
          });
        }
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not submit feedback.";
        // Only surface failures the user explicitly triggered. Silent
        // background submissions failing shouldn't spam a toast — the
        // attempt is still visible in the UI and the next explicit
        // action will retry the write.
        if (!silent) {
          toast({ title: "Feedback failed", description: message });
        }
        return false;
      }
    },
    [runSubmitFeedback, sessionId, markFeedbackSubmitted]
  );

  return { fetchQuestion, submitFeedback, warmChain };
}
