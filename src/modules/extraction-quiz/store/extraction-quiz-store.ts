import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import type { ExtractionQuestionData, LearningExperience } from "../types";
import type { QuestionExperience } from "../data/learning-modes";

// Server grade for a Practice Studio short answer (Final Handoff §9). Set after
// the answer is submitted and graded; drives the review panel on the card.
export type ExtractionReview = {
  evaluation: "correct" | "partial" | "incorrect";
  feedback?: string;
  idealAnswer?: string;
};

export type ExtractionAttempt = {
  id: string;
  // Practice Studio: the topic the question was generated for.
  // QuizRx Reasoning: the curated item's source topic (analytics only).
  chainId: string;
  question: ExtractionQuestionData;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  feedbackSubmitted: boolean;
  freeText: string;
  // Present only for graded Practice Studio short answers.
  review?: ExtractionReview | null;
  createdAt: number;
  // The question experience this attempt belongs to. Submit/grade use this,
  // never the mode currently on screen.
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
export type ModePending = Record<LearningExperience, boolean>;

export type LoadSessionPayload = {
  sessionId: string;
  chainId: string | null;
  entries: ExtractionEntry[];
  modeEntries?: ModeEntries;
  experience?: LearningExperience | null;
  lastQuestionExperience?: QuestionExperience | null;
};

interface ExtractionQuizState {
  // The Practice Studio topic. Tutor and QuizRx Reasoning never use a topic.
  selectedChainId: string | null;
  // Mode on screen. Every visit starts in Tutor (QuizRx beta review).
  experience: LearningExperience;
  lastQuestionExperience: QuestionExperience | null;
  // Per-experience threads. Switching modes never erases another experience's
  // conversation, topic session, or Reasoning position.
  modeEntries: ModeEntries;
  // View of the active experience's thread (kept in sync for existing callers).
  entries: ExtractionEntry[];
  // Requests in flight per experience, so one mode never blocks another.
  pending: ModePending;
  contextFloor: number;
  sessionId: string;
  isFetching: boolean;
  error: string | null;
  // Per-chain pointer into the legacy deterministic DP walk.
  chainProgress: Record<string, number>;
}

interface ExtractionQuizActions {
  setSelectedChainId: (chainId: string | null) => void;
  setExperience: (experience: LearningExperience) => void;
  setPending: (experience: LearningExperience, value: boolean) => void;
  // Tutor conversation turns.
  appendUserPrompt: (content: string) => void;
  appendAssistant: (content: string) => void;
  appendSystem: (content: string, experience?: LearningExperience) => void;
  appendAttempt: (
    chainId: string,
    question: ExtractionQuestionData,
    experience: QuestionExperience
  ) => ExtractionAttempt;
  recordAnswer: (attemptId: string, selectedIndex: number) => void;
  recordFreeText: (attemptId: string, freeText: string) => void;
  recordReview: (attemptId: string, review: ExtractionReview) => void;
  markFeedbackSubmitted: (attemptId: string) => void;
  setIsFetching: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  // Clear QuizRx Reasoning progress so the learner can start again at Q1.
  resetReasoning: () => void;
  loadSession: (payload: LoadSessionPayload) => void;
  getNextDpIndex: (chainId: string) => number;
  advanceChainProgress: (chainId: string) => void;
  resetChainProgress: (chainId: string) => void;
}

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// Pull the trailing DP index from a dp_id like "CAL-BONE-01-DP-08" → 8.
const parseDpIndex = (dpId: string | undefined | null): number | null => {
  if (!dpId) return null;
  const match = dpId.match(/-DP-(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
};

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

export const buildDpId = (chainId: string, index: number): string =>
  `${chainId}-DP-${String(index).padStart(2, "0")}`;

export const emptyModeEntries = (): ModeEntries => ({
  reasoning: [],
  practice_studio: [],
  tutor: [],
});

const idlePending = (): ModePending => ({
  reasoning: false,
  practice_studio: false,
  tutor: false,
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

// Reasoning attempts from before the fixed 1–30 sequence have no position and
// cannot be resumed; only sequenced attempts count as progress.
const sequencedReasoning = (entries: ExtractionEntry[] = []): ExtractionEntry[] =>
  entries.filter(
    (e) => e.kind === "attempt" && Boolean(e.attempt.question.question.sequence)
  );

const syncEntries = (
  modeEntries: ModeEntries,
  experience: LearningExperience
): ExtractionEntry[] => modeEntries[experience];

const appendTo = (
  state: ExtractionQuizState,
  experience: LearningExperience,
  entry: ExtractionEntry
): Pick<ExtractionQuizState, "modeEntries" | "entries"> => {
  const modeEntries = {
    ...state.modeEntries,
    [experience]: [...state.modeEntries[experience], entry],
  };
  return { modeEntries, entries: syncEntries(modeEntries, state.experience) };
};

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
        experience: "tutor",
        lastQuestionExperience: null,
        modeEntries: emptyModeEntries(),
        entries: [],
        pending: idlePending(),
        contextFloor: 0,
        sessionId: generateId(),
        isFetching: false,
        error: null,
        chainProgress: {},

        setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),

        // Switching mode only changes the visible thread.
        setExperience: (experience) =>
          set((state) => {
            if (experience === state.experience) return {};
            const lastQuestionExperience =
              experience === "tutor"
                ? state.experience === "tutor"
                  ? state.lastQuestionExperience
                  : state.experience
                : experience;
            return {
              experience,
              lastQuestionExperience,
              entries: syncEntries(state.modeEntries, experience),
              contextFloor: 0,
            };
          }),

        setPending: (experience, value) =>
          set((state) => ({
            pending: { ...state.pending, [experience]: value },
          })),

        appendUserPrompt: (content) =>
          set((state) =>
            appendTo(state, "tutor", {
              id: generateId(),
              kind: "user-prompt",
              content,
              createdAt: Date.now(),
            })
          ),

        appendAssistant: (content) =>
          set((state) =>
            appendTo(state, "tutor", {
              id: generateId(),
              kind: "assistant",
              content,
              createdAt: Date.now(),
            })
          ),

        appendSystem: (content, experience = "tutor") =>
          set((state) =>
            appendTo(state, experience, {
              id: generateId(),
              kind: "system",
              content,
              createdAt: Date.now(),
            })
          ),

        appendAttempt: (chainId, question, experience) => {
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
          set((state) => ({
            ...appendTo(state, experience, {
              id: attempt.id,
              kind: "attempt",
              attempt,
            }),
            lastQuestionExperience: experience,
          }));
          return attempt;
        },

        recordAnswer: (attemptId, selectedIndex) =>
          set((state) =>
            patchAttempt(state, attemptId, (attempt) => {
              const choices = attempt.question.question.choices;
              const correctText = attempt.question.question.answer;
              return {
                ...attempt,
                selectedIndex,
                isCorrect: choices[selectedIndex] === correctText,
              };
            })
          ),

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

        // Starts a fresh Tutor conversation and Practice Studio session with a
        // new sessionId. QuizRx Reasoning progress belongs to the learner, not
        // the session, so it is kept. Archiving is the caller's job.
        resetSession: () =>
          set((state) => {
            const modeEntries: ModeEntries = {
              ...emptyModeEntries(),
              reasoning: state.modeEntries.reasoning,
            };
            return {
              modeEntries,
              entries: syncEntries(modeEntries, "tutor"),
              experience: "tutor",
              lastQuestionExperience: null,
              selectedChainId: null,
              pending: idlePending(),
              contextFloor: 0,
              sessionId: generateId(),
              isFetching: false,
              error: null,
              chainProgress: {},
            };
          }),

        resetReasoning: () =>
          set((state) => {
            const modeEntries = { ...state.modeEntries, reasoning: [] };
            return {
              modeEntries,
              entries: syncEntries(modeEntries, state.experience),
            };
          }),

        // Replace the current session with an archived one. Reasoning progress
        // is the learner's, so the current position is kept.
        loadSession: (payload) => {
          const archived =
            payload.modeEntries ?? splitEntriesByMode(payload.entries);
          const modeEntries: ModeEntries = {
            tutor: archived.tutor,
            practice_studio: archived.practice_studio,
            reasoning: get().modeEntries.reasoning,
          };
          const experience: LearningExperience =
            modeEntries.tutor.length === 0 &&
            modeEntries.practice_studio.length > 0
              ? "practice_studio"
              : "tutor";
          set({
            sessionId: payload.sessionId,
            selectedChainId: payload.chainId,
            modeEntries,
            experience,
            lastQuestionExperience: payload.lastQuestionExperience ?? null,
            entries: syncEntries(modeEntries, experience),
            pending: idlePending(),
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
        version: 4,
        // The mode on screen and in-flight flags are not persisted: every
        // visit opens in Tutor with nothing pending.
        partialize: (state) => ({
          selectedChainId: state.selectedChainId,
          lastQuestionExperience: state.lastQuestionExperience,
          modeEntries: state.modeEntries,
          contextFloor: state.contextFloor,
          sessionId: state.sessionId,
          chainProgress: state.chainProgress,
        }),
        merge: (persisted, current) => {
          const merged = {
            ...current,
            ...(persisted as Partial<ExtractionQuizState>),
          };
          const modeEntries: ModeEntries = {
            ...emptyModeEntries(),
            ...(merged.modeEntries ?? {}),
          };
          return {
            ...merged,
            modeEntries,
            experience: "tutor",
            entries: syncEntries(modeEntries, "tutor"),
            pending: idlePending(),
          };
        },
        // v1 → v2: reconstruct chainProgress.
        // v2 → v3: split the single thread into per-experience threads.
        // v3 → v4: Reasoning becomes one fixed 1–30 sequence; topic-based
        //          Reasoning attempts are dropped.
        migrate: (persistedState, fromVersion) => {
          const prev = (persistedState ?? {}) as {
            entries?: ExtractionEntry[];
            chainProgress?: Record<string, number>;
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
            next = {
              ...next,
              modeEntries:
                prev.modeEntries ?? splitEntriesByMode(prev.entries ?? []),
              lastQuestionExperience: prev.lastQuestionExperience ?? null,
            };
          }
          if (fromVersion < 4) {
            const modeEntries = next.modeEntries ?? emptyModeEntries();
            next = {
              ...next,
              modeEntries: {
                ...modeEntries,
                reasoning: sequencedReasoning(modeEntries.reasoning),
              },
            };
          }
          return next as unknown;
        },
      }
    ),
    { name: "extraction-quiz-store" }
  )
);

const isAnsweredAttempt = (entry: ExtractionEntry): boolean =>
  entry.kind === "attempt" &&
  (entry.attempt.selectedIndex !== null ||
    entry.attempt.freeText.trim().length > 0);

export const useExtractionAttempts = () =>
  useExtractionQuizStore((s) =>
    s.entries.filter(
      (e): e is Extract<ExtractionEntry, { kind: "attempt" }> =>
        e.kind === "attempt"
    )
  );

// Answered questions across every experience (the default view is Tutor).
export const useAnsweredCount = () =>
  useExtractionQuizStore(
    (s) => flattenModeEntries(s.modeEntries).filter(isAnsweredAttempt).length
  );
