import { create } from "zustand";
import { GenericStore } from "@/core/types/common/store";

export const createGenericStore = <T>(initialData: T, modelName: string) => {
  return create<GenericStore<T>>((set) => ({
    modelName,
    data: initialData,
    setData: (data) => {
      set({ data });
    },
    updateField: (key, value) =>
      set((state) => ({
        data: { ...state.data, [key]: value },
      })),
    reset: () => set({ data: initialData }),
  }));
};
