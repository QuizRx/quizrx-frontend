// src/types/filter.ts

export type Topic = "all" | "endocrinology" | "neurology" | "cardiology" | "pulmonology";
export type Difficulty = "all" | "easy" | "medium" | "hard";

export interface FilterState {
  topic: Topic;
  difficulty: Difficulty;
  isFilterOpen: boolean;
  setTopic: (topic: Topic) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
  resetFilters: () => void;
}