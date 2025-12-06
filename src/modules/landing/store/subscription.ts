import { SubscriptionActions, SubscriptionState } from "@/modules/landing/types/state/subscription-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialState: SubscriptionState = {
  email: "",
  subscriptionId: "",
  paymentMethodId: "",
  clientSecret: "",
  status: "idle",
};

export const useSubscriptionStore = create<
  SubscriptionState & SubscriptionActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setEmail: (email) => set({ email }),
      setSubscriptionId: (subscriptionId) => set({ subscriptionId }),
      setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
      setClientSecret: (clientSecret) => set({ clientSecret }),
      setStatus: (status) => set({ status }),
      reset: () => set(initialState),
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
