import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ExtractionQuestionData } from "../types";

// ---------------------------------------------------------------------------
// Per-chain "pool" of authored questions, cached in memory only.
//
// We hydrate this lazily: when the user picks a chain, the hook fires a
// background warm-up that walks DP-01, DP-02, … fetching each question and
// stopping at the first server error (assumed "chain exhausted"). The cached
// questions are then used to do keyword matching on the user's free-text
// prompt, so picks feel content-driven instead of just sequential.
//
// IMPORTANT: this store is NOT persisted. It lives for the page lifecycle.
// Persisting authored content into localStorage would be wasteful and would
// also make it harder to pick up backend content updates between sessions.
// ---------------------------------------------------------------------------

interface ChainPoolState {
  // chainId → ordered list of fetched authored questions
  pools: Record<string, ExtractionQuestionData[]>;
  // chainId → is a warm-up currently in flight?
  loading: Record<string, boolean>;
  // chainId → has this chain ever finished warming up at least once?
  warmedAt: Record<string, number>;
  // chainId → last warm-up error (if any). Lets callers retry intelligently.
  errors: Record<string, string | null>;
}

interface ChainPoolActions {
  startLoading: (chainId: string) => void;
  finishLoading: (chainId: string, pool: ExtractionQuestionData[]) => void;
  failLoading: (chainId: string, error: string) => void;
  // For unit-tests / dev tools.
  clear: () => void;
}

export const useChainPoolStore = create<ChainPoolState & ChainPoolActions>()(
  devtools(
    (set) => ({
      pools: {},
      loading: {},
      warmedAt: {},
      errors: {},

      startLoading: (chainId) =>
        set((state) => ({
          loading: { ...state.loading, [chainId]: true },
          errors: { ...state.errors, [chainId]: null },
        })),

      finishLoading: (chainId, pool) =>
        set((state) => ({
          pools: { ...state.pools, [chainId]: pool },
          loading: { ...state.loading, [chainId]: false },
          warmedAt: { ...state.warmedAt, [chainId]: Date.now() },
          errors: { ...state.errors, [chainId]: null },
        })),

      failLoading: (chainId, error) =>
        set((state) => ({
          loading: { ...state.loading, [chainId]: false },
          errors: { ...state.errors, [chainId]: error },
        })),

      clear: () =>
        set({ pools: {}, loading: {}, warmedAt: {}, errors: {} }),
    }),
    { name: "extraction-chain-pool-store" }
  )
);

// Convenience selectors --------------------------------------------------

export const useChainPool = (chainId: string | null) =>
  useChainPoolStore((s) => (chainId ? s.pools[chainId] ?? [] : []));

export const useChainPoolLoading = (chainId: string | null) =>
  useChainPoolStore((s) => (chainId ? Boolean(s.loading[chainId]) : false));

export const useChainPoolWarmedAt = (chainId: string | null) =>
  useChainPoolStore((s) => (chainId ? s.warmedAt[chainId] ?? null : null));
