import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { ExtractionEntry } from "./extraction-quiz-store";

export type ArchivedSession = {
  sessionId: string;
  title: string;
  chainId: string | null;
  entries: ExtractionEntry[];
  archivedAt: number;
  attemptCount: number;
};

export type ArchiveSnapshot = {
  sessionId: string;
  title: string;
  chainId: string | null;
  entries: ExtractionEntry[];
};

interface ArchivedSessionsState {
  sessions: ArchivedSession[];
}

interface ArchivedSessionsActions {
  archive: (snapshot: ArchiveSnapshot) => void;
  remove: (sessionId: string) => void;
  clear: () => void;
}

const ARCHIVE_LIMIT = 50;

const countAttempts = (entries: ExtractionEntry[]) =>
  entries.filter((e) => e.kind === "attempt").length;

export const useArchivedSessionsStore = create<
  ArchivedSessionsState & ArchivedSessionsActions
>()(
  devtools(
    persist(
      (set) => ({
        sessions: [],

        archive: (snapshot) =>
          set((state) => {
            const withoutSelf = state.sessions.filter(
              (s) => s.sessionId !== snapshot.sessionId
            );
            const archived: ArchivedSession = {
              sessionId: snapshot.sessionId,
              title: snapshot.title,
              chainId: snapshot.chainId,
              entries: snapshot.entries,
              archivedAt: Date.now(),
              attemptCount: countAttempts(snapshot.entries),
            };
            return {
              sessions: [archived, ...withoutSelf].slice(0, ARCHIVE_LIMIT),
            };
          }),

        remove: (sessionId) =>
          set((state) => ({
            sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
          })),

        clear: () => set({ sessions: [] }),
      }),
      {
        name: "extraction-quiz-archive",
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }
    ),
    { name: "extraction-quiz-archive-store" }
  )
);
