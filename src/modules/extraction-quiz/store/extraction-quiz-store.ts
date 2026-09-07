import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import type { ExtractionQuestionData, LearningExperience } from "../types";
import {
  isQuestionMode,
  type QuestionExperience,
} from "../data/learning-modes";

// Server grade for a Practice Studio short answer (Final Handoff §9). Set after
// the answer is submitted and graded; drives the review panel on the card.
export type ExtractionReview = {
  evaluation: "correct" | "partial" | "incorrect";
  feedback?: string;
  idealAnswer?: string;
};

export type ExtractionAttempt = {
  id: string;
  chainId: string;
  question: ExtractionQuestionData;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  feedbackSubmitted: boolean;
  freeText: string;
  // Present only for graded Practice Studio short answers.
  review?: ExtractionReview | null;
  createdAt: number;
  // The question experience this attempt belongs to. Switching to Tutor must
  // not lose this, and submit/grade must use this — not the currently viewed
  // mode — so a chat-box focus cannot re-route an in-progress answer.
  experience?: QuestionExperience;
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
    }
  | {
      id: string;
      kind: "assistant";
      content: string;
      createdAt: number;
    };

export type ModeEntries = Record<LearningExperience, ExtractionEntry[]>;

export type LoadSessionPayload = {
  sessionId: string;
  chainId: string | null;
  entries: ExtractionEntry[];
  modeEntries?: ModeEntries;
  experience?: LearningExperience | null;
  lastQuestionExperience?: QuestionExperience | null;
};

interface ExtractionQuizState {
  selectedChainId: string | null;
  // Explicitly-selected learning mode (Final Handoff §6). `null` until the
  // learner chooses — the app never silently guesses the experience.
  experience: LearningExperience | null;
  // Last question experience the learner used, so Tutor can offer "Return to
  // Practice Studio / QuizRx Reasoning" without guessing.
  lastQuestionExperience: QuestionExperience | null;
  // Per-experience threads. Switching modes never erases another experience's
  // questions or conversation — Question 7 stays Question 7.
  modeEntries: ModeEntries;
  // View of the active experience's thread (kept in sync for existing callers).
  entries: ExtractionEntry[];
  contextFloor: number;
  sessionId: string;
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
  setExperience: (experience: LearningExperience | null) => void;
  appendUserPrompt: (content: string) => void;
  appendSystem: (content: string) => void;
  appendAssistant: (content: string) => void;
  appendAttempt: (
    chainId: string,
    question: ExtractionQuestionData
  ) => ExtractionAttempt;
  recordAnswer: (attemptId: string, selectedIndex: number) => void;
  recordFreeText: (attemptId: string, freeText: string) => void;
  recordReview: (attemptId: string, review: ExtractionReview) => void;
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

export const emptyModeEntries = (): ModeEntries => ({
  reasoning: [],
  practice_studio: [],
  tutor: [],
});

export const flattenModeEntries = (modeEntries: ModeEntries): ExtractionEntry[] => [
  ...modeEntries.reasoning,
  ...modeEntries.practice_studio,
  ...modeEntries.tutor,
];

export const splitEntriesByMode = (entries: ExtractionEntry[]): ModeEntries => {
  const next = emptyModeEntries();
  for (const entry of entries) {
    if (entry.kind === "attempt") {
      const mode: QuestionExperience =
        entry.attempt.experience ??
        (entry.attempt.question.question.format === "short_answer"
          ? "practice_studio"
          : "reasoning");
      next[mode].push(entry);
    } else {
      next.tutor.push(entry);
    }
  }
  return next;
};

const bucketForAppend = (
  state: ExtractionQuizState,
  kind: ExtractionEntry["kind"]
): LearningExperience => {
  if (kind === "attempt") {
    return isQuestionMode(state.experience) ? state.experience : "reasoning";
  }
  // Chat turns always belong to Tutor. A system error during Start/Next stays
  // on the current question experience so it remains visible there.
  if (kind === "system" && isQuestionMode(state.experience)) {
    return state.experience;
  }
  return "tutor";
};

const syncEntries = (
  modeEntries: ModeEntries,
  experience: LearningExperience | null
): ExtractionEntry[] => (experience ? modeEntries[experience] : []);

const patchAttempt = (
  state: ExtractionQuizState,
  attemptId: string,
  updater: (attempt: ExtractionAttempt) => ExtractionAttempt
): Pick<ExtractionQuizState, "modeEntries" | "entries"> => {
  const updateList = (list: ExtractionEntry[]) =>
    list.map((entry) =>
      entry.kind === "attempt" && entry.attempt.id === attemptId
        ? { ...entry, attempt: updater(entry.attempt) }
        : entry
    );
  const modeEntries: ModeEntries = {
    reasoning: updateList(state.modeEntries.reasoning),
    practice_studio: updateList(state.modeEntries.practice_studio),
    tutor: updateList(state.modeEntries.tutor),
  };
  return {
    modeEntries,
    entries: syncEntries(modeEntries, state.experience),
  };
};

export const useExtractionQuizStore = create<
  ExtractionQuizState & ExtractionQuizActions
>()(
  devtools(
    persist(
      (set, get) => ({
        selectedChainId: null,
        experience: null,
        lastQuestionExperience: null,
        modeEntries: emptyModeEntries(),
        contextFloor: 0,
        sessionId: generateId(),
        entries: [],
        isFetching: false,
        error: null,
        chainProgress: {},

        setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),

        // Switching mode only changes the visible thread. Other experiences
        // keep their questions, answers, and Tutor conversation intact.
        setExperience: (experience) =>
          set((state) => {
            if (experience === state.experience) return { experience };
            const lastQuestionExperience = isQuestionMode(experience)
              ? experience
              : isQuestionMode(state.experience)
                ? state.experience
                : state.lastQuestionExperience;
            return {
              experience,
              lastQuestionExperience,
              entries: syncEntries(state.modeEntries, experience),
              contextFloor: 0,
            };
          }),

        appendUserPrompt: (content) =>
          set((state) => {
            const entry: ExtractionEntry = {
              id: generateId(),
              kind: "user-prompt",
              content,
              createdAt: Date.now(),
            };
            const bucket = bucketForAppend(state, "user-prompt");
            const modeEntries = {
              ...state.modeEntries,
              [bucket]: [...state.modeEntries[bucket], entry],
            };
            return {
              modeEntries,
              entries: syncEntries(modeEntries, state.experience),
            };
          }),

        appendSystem: (content) =>
          set((state) => {
            const entry: ExtractionEntry = {
              id: generateId(),
              kind: "system",
              content,
              createdAt: Date.now(),
            };
            const bucket = bucketForAppend(state, "system");
            const modeEntries = {
              ...state.modeEntries,
              [bucket]: [...state.modeEntries[bucket], entry],
            };
            return {
              modeEntries,
              entries: syncEntries(modeEntries, state.experience),
            };
          }),

        appendAssistant: (content) =>
          set((state) => {
            const entry: ExtractionEntry = {
              id: generateId(),
              kind: "assistant",
              content,
              createdAt: Date.now(),
            };
            const bucket = bucketForAppend(state, "assistant");
            const modeEntries = {
              ...state.modeEntries,
              [bucket]: [...state.modeEntries[bucket], entry],
            };
            return {
              modeEntries,
              entries: syncEntries(modeEntries, state.experience),
            };
          }),

        appendAttempt: (chainId, question) => {
          const current = get().experience;
          const experience: QuestionExperience = isQuestionMode(current)
            ? current
            : question.question.format === "short_answer"
              ? "practice_studio"
              : "reasoning";
          const attempt: ExtractionAttempt = {
            id: generateId(),
            chainId,
            question,
            selectedIndex: null,
            isCorrect: null,
            feedbackSubmitted: false,
            freeText: "",
            createdAt: Date.now(),
            experience,
          };

          set((state) => {
            const entry: ExtractionEntry = {
              id: attempt.id,
              kind: "attempt",
              attempt,
            };
            const modeEntries = {
              ...state.modeEntries,
              [experience]: [...state.modeEntries[experience], entry],
            };
            return {
              modeEntries,
              lastQuestionExperience: experience,
              entries: syncEntries(modeEntries, state.experience),
            };
          });

          return attempt;
        },

        recordAnswer: (attemptId, selectedIndex) =>
          set((state) => patchAttempt(state, attemptId, (attempt) => {
            const choices = attempt.question.question.choices;
            const correctText = attempt.question.question.answer;
            return {
              ...attempt,
              selectedIndex,
              isCorrect: choices[selectedIndex] === correctText,
            };
          })),

        recordFreeText: (attemptId, freeText) =>
          set((state) =>
            patchAttempt(state, attemptId, (attempt) => ({
              ...attempt,
              freeText,
            }))
          ),

        recordReview: (attemptId, review) =>
          set((state) =>
            patchAttempt(state, attemptId, (attempt) => ({
              ...attempt,
              review,
            }))
          ),

        markFeedbackSubmitted: (attemptId) =>
          set((state) =>
            patchAttempt(state, attemptId, (attempt) => ({
              ...attempt,
              feedbackSubmitted: true,
            }))
          ),

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
            modeEntries: emptyModeEntries(),
            lastQuestionExperience: null,
            selectedChainId: null,
            contextFloor: 0,
            sessionId: generateId(),
            isFetching: false,
            error: null,
            chainProgress: {},
          }),

        // Replace the current session in-place with an archived session.
        // Used when the user clicks a past session in the sidebar.
        // chainProgress is reconstructed from the archived entries so the
        // deterministic walk continues where the user left off.
        loadSession: (payload) => {
          const modeEntries =
            payload.modeEntries ?? splitEntriesByMode(payload.entries);
          const experience = payload.experience ?? null;
          set({
            sessionId: payload.sessionId,
            selectedChainId: payload.chainId,
            modeEntries,
            experience,
            lastQuestionExperience: payload.lastQuestionExperience ?? null,
            entries: syncEntries(modeEntries, experience),
            contextFloor: 0,
            isFetching: false,
            error: null,
            chainProgress: deriveChainProgressFromEntries(
              flattenModeEntries(modeEntries)
            ),
          });
        },

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
        version: 3,
        // Don't persist transient UI state.
        partialize: (state) => ({
          selectedChainId: state.selectedChainId,
          experience: state.experience,
          lastQuestionExperience: state.lastQuestionExperience,
          modeEntries: state.modeEntries,
          contextFloor: state.contextFloor,
          sessionId: state.sessionId,
          entries: state.entries,
          chainProgress: state.chainProgress,
        }),
        // v1 → v2: reconstruct chainProgress.
        // v2 → v3: split the single thread into per-experience threads.
        migrate: (persistedState, fromVersion) => {
          const prev = (persistedState ?? {}) as {
            entries?: ExtractionEntry[];
            chainProgress?: Record<string, number>;
            experience?: LearningExperience | null;
            modeEntries?: ModeEntries;
            lastQuestionExperience?: QuestionExperience | null;
          };
          let next = { ...prev };
          if (fromVersion < 2) {
            next = {
              ...next,
              chainProgress:
                prev.chainProgress ??
                deriveChainProgressFromEntries(prev.entries ?? []),
            };
          }
          if (fromVersion < 3) {
            const modeEntries =
              prev.modeEntries ?? splitEntriesByMode(prev.entries ?? []);
            next = {
              ...next,
              modeEntries,
              lastQuestionExperience: prev.lastQuestionExperience ?? null,
              entries: syncEntries(modeEntries, prev.experience ?? null),
            };
          }
          return next as unknown;
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
