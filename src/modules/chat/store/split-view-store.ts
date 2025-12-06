import { create } from 'zustand';

interface SplitViewState {
  isReviewMode: boolean;
  leftWidth: number;
  toggleReviewMode: () => void;
  setReviewMode: (mode: boolean) => void;
  setLeftWidth: (width: number) => void;
}

export const useSplitView = create<SplitViewState>((set) => ({
  isReviewMode: false,
  leftWidth: 50,
  toggleReviewMode: () => set((state) => ({ isReviewMode: !state.isReviewMode })),
  setReviewMode: (mode: boolean) => set({ isReviewMode: mode }),
  setLeftWidth: (width: number) => set({ leftWidth: width }),
}));