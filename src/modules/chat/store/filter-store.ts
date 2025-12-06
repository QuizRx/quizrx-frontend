// src/store/filterStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Difficulty, FilterState, Topic } from "../types/ui/filter";

/**
 * Zustand store for managing filter state with persistence
 * This store keeps track of topic and difficulty filters, as well as the dialog open state
 */
const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      topic: "all",
      difficulty: "all",
      isFilterOpen: false,
      setTopic: (topic: Topic) => set({ topic }),
      setDifficulty: (difficulty: Difficulty) => set({ difficulty }),
      setIsFilterOpen: (isFilterOpen: boolean) => set({ isFilterOpen }),
      resetFilters: () => set({ topic: "all", difficulty: "all" }),
    }),
    {
      name: "question-bank-filters",
    }
  )
);

export default useFilterStore;
