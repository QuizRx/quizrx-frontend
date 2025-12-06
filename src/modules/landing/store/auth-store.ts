// src/core/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setToken: (token: string) => void;
  clearToken: () => void;
  initialize: () => void;
};

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Set token and update state
      setToken: (token: string) => {
        setCookie('token', token, { path: '/' });
        set({ token, isAuthenticated: true });
      },
      
      // Clear token and reset state
      clearToken: () => {
        deleteCookie('token', { path: '/' });
        set({ token: null, isAuthenticated: false });
      },
      
      // Initialize auth state from cookies
      initialize: () => {
        const token = getCookie('token') as string | null;
        set({ 
          token,
          isAuthenticated: !!token
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const cookie = getCookie(name);
          return cookie ? JSON.stringify({ state: { token: cookie } }) : null;
        },
        setItem: (name, value) => {
          const { state } = JSON.parse(value);
          if (state.token) {
            setCookie(name, state.token, { path: '/' });
          }
        },
        removeItem: (name) => {
          deleteCookie(name, { path: '/' });
        },
      })),
    }
  )
);

// Helper hook to check auth status
export const useAuth = () => {
  const { token, isAuthenticated } = useAuthStore();
  return { token, isAuthenticated };
};