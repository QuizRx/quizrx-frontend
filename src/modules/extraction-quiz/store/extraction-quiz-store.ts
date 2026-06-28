import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import type { ExtractionQuestionData } from "../types";

export type ExtractionAttempt = {
  id: string;
  chainId: string;
  question: ExtractionQuestionData;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  rating: "up" | "down" | null;
  feedbackSubmitted: boolean;
  freeText: string;
  createdAt: number;
};

export type ExtractionEntry =
  | {
      id: string;
      kind: "user-prompt";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      kind: "attempt";
      attempt: ExtractionAttempt;
    }
  | {
      id: string;
      kind: "system";
      content: string;
      createdAt: number;
    };

export type LoadSessionPayload = {
  sessionId: string;
  chainId: string | null;
  entries: ExtractionEntry[];
};

interface ExtractionQuizState {
  selectedChainId: string | null;
  sessionId: string;
  entries: ExtractionEntry[];
  isFetching: boolean;
  error: string | null;
  // Per-chain pointer into the deterministic walk through that chain's
  // pre-authored decision points. `chainProgress[chainId]` holds the
  // 1-based DP index we should request NEXT for that chain. Defaults to 1
  // when a chain has not been touched in this session.
  chainProgress: Record<string, number>;
}

interface ExtractionQuizActions {
  setSelectedChainId: (chainId: string | null) => void;
  appendUserPrompt: (content: string) => void;
  appendSystem: (content: string) => void;
  appendAttempt: (
    chainId: string,
    question: ExtractionQuestionData
  ) => ExtractionAttempt;
  recordAnswer: (attemptId: string, selectedIndex: number) => void;
  recordRating: (attemptId: string, rating: "up" | "down" | null) => void;
  recordFreeText: (attemptId: string, freeText: string) => void;
  markFeedbackSubmitted: (attemptId: string) => void;
  setIsFetching: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  loadSession: (payload: LoadSessionPayload) => void;
  // Returns the 1-based DP index that should be requested NEXT for this
  // chain. Defaults to 1 when nothing has been fetched yet.
  getNextDpIndex: (chainId: string) => number;
  // Bump the per-chain DP pointer (called after a successful fetch).
  advanceChainProgress: (chainId: string) => void;
  // Reset a single chain's pointer back to 1. Used when the user has
  // walked off the end of the chain's DP list, so they can re-walk.
  resetChainProgress: (chainId: string) => void;
}

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// Pull the trailing DP index from a dp_id like "CAL-BONE-01-DP-08" → 8.
// Returns null if the dp_id doesn't match the expected pattern (e.g. the
// cognitive service ever changes its format).
const parseDpIndex = (dpId: string | undefined | null): number | null => {
  if (!dpId) return null;
  const match = dpId.match(/-DP-(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
};

// When loading an archived session we want to resume the deterministic walk
// where the user left off. We derive that from the dp_ids already shown:
// `max(seen index) + 1` per chain.
const deriveChainProgressFromEntries = (
  entries: ExtractionEntry[]
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.kind !== "attempt") continue;
    const chainId = entry.attempt.chainId;
    const idx = parseDpIndex(entry.attempt.question.question.dp_id);
    if (idx === null) continue;
    const next = idx + 1;
    if ((result[chainId] ?? 0) < next) {
      result[chainId] = next;
    }
  }
  return result;
};

// Public helper so callers (e.g. the fetch hook) can build dp_ids
// consistently with whatever index they got from the store.
export const buildDpId = (chainId: string, index: number): string =>
  `${chainId}-DP-${String(index).padStart(2, "0")}`;

export const useExtractionQuizStore = create<
  ExtractionQuizState & ExtractionQuizActions
>()(
  devtools(
    persist(
      (set, get) => ({
        selectedChainId: null,
        sessionId: generateId(),
        entries: [],
        isFetching: false,
        error: null,
        chainProgress: {},

        setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),

        appendUserPrompt: (content) =>
          set((state) => ({
            entries: [
              ...state.entries,
              {
                id: generateId(),
                kind: "user-prompt",
                content,
                createdAt: Date.now(),
              },
            ],
          })),

        appendSystem: (content) =>
          set((state) => ({
            entries: [
              ...state.entries,
              {
                id: generateId(),
                kind: "system",
                content,
                createdAt: Date.now(),
              },
            ],
          })),

        appendAttempt: (chainId, question) => {
          const attempt: ExtractionAttempt = {
            id: generateId(),
            chainId,
            question,
            selectedIndex: null,
            isCorrect: null,
            rating: null,
            feedbackSubmitted: false,
            freeText: "",
            createdAt: Date.now(),
          };

          set((state) => ({
            entries: [
              ...state.entries,
              { id: attempt.id, kind: "attempt", attempt },
            ],
          }));

          return attempt;
        },

        recordAnswer: (attemptId, selectedIndex) =>
          set((state) => ({
            entries: state.entries.map((entry) => {
              if (entry.kind !== "attempt" || entry.attempt.id !== attemptId) {
                return entry;
              }

              const choices = entry.attempt.question.question.choices;
              const correctText = entry.attempt.question.question.answer;
              const isCorrect = choices[selectedIndex] === correctText;

              return {
                ...entry,
                attempt: {
                  ...entry.attempt,
                  selectedIndex,
                  isCorrect,
                },
              };
            }),
          })),

        recordRating: (attemptId, rating) =>
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.kind === "attempt" && entry.attempt.id === attemptId
                ? {
                    ...entry,
                    attempt: { ...entry.attempt, rating },
                  }
                : entry
            ),
          })),

        recordFreeText: (attemptId, freeText) =>
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.kind === "attempt" && entry.attempt.id === attemptId
                ? {
                    ...entry,
                    attempt: { ...entry.attempt, freeText },
                  }
                : entry
            ),
          })),

        markFeedbackSubmitted: (attemptId) =>
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.kind === "attempt" && entry.attempt.id === attemptId
                ? {
                    ...entry,
                    attempt: { ...entry.attempt, feedbackSubmitted: true },
                  }
                : entry
            ),
          })),

        setIsFetching: (value) => set({ isFetching: value }),
        setError: (error) => set({ error }),

        // Note: this clears the current session AND mints a new sessionId.
        // It does NOT archive the previous session by itself — the caller
        // (e.g. the sidebar "New session" button) is responsible for
        // pushing a snapshot into useArchivedSessionsStore before calling
        // this if it wants the session preserved.
        resetSession: () =>
          set({
            entries: [],
            selectedChainId: null,
            sessionId: generateId(),
            isFetching: false,
            error: null,
            chainProgress: {},
          }),

        // Replace the current session in-place with an archived session.
        // Used when the user clicks a past session in the sidebar.
        // chainProgress is reconstructed from the archived entries so the
        // deterministic walk continues where the user left off.
        loadSession: (payload) =>
          set({
            sessionId: payload.sessionId,
            selectedChainId: payload.chainId,
            entries: payload.entries,
            isFetching: false,
            error: null,
            chainProgress: deriveChainProgressFromEntries(payload.entries),
          }),

        getNextDpIndex: (chainId) => get().chainProgress[chainId] ?? 1,

        advanceChainProgress: (chainId) =>
          set((state) => ({
            chainProgress: {
              ...state.chainProgress,
              [chainId]: (state.chainProgress[chainId] ?? 1) + 1,
            },
          })),

        resetChainProgress: (chainId) =>
          set((state) => ({
            chainProgress: { ...state.chainProgress, [chainId]: 1 },
          })),
      }),
      {
        name: "extraction-quiz-current",
        storage: createJSONStorage(() => localStorage),
        version: 2,
        // Don't persist transient UI state.
        partialize: (state) => ({
          selectedChainId: state.selectedChainId,
          sessionId: state.sessionId,
          entries: state.entries,
          chainProgress: state.chainProgress,
        }),
        // v1 → v2: chainProgress didn't exist yet. Reconstruct it from the
        // entries already in the session so the deterministic walk picks
        // up where the user actually left off, instead of replaying DP-01.
        migrate: (persistedState, fromVersion) => {
          if (fromVersion < 2) {
            const prev = (persistedState ?? {}) as {
              entries?: ExtractionEntry[];
              chainProgress?: Record<string, number>;
            };
            return {
              ...prev,
              chainProgress:
                prev.chainProgress ??
                deriveChainProgressFromEntries(prev.entries ?? []),
            };
          }
          return persistedState as unknown;
        },
      }
    ),
    { name: "extraction-quiz-store" }
  )
);

export const useExtractionAttempts = () =>
  useExtractionQuizStore((s) =>
    s.entries.filter(
      (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
        e.kind === "attempt"
    )
  );

export const useAnsweredCount = () =>
  useExtractionQuizStore(
    (s) =>
      s.entries.filter(
        (e) => e.kind === "attempt" && e.attempt.selectedIndex !== null
      ).length
  );
