import { create } from 'zustand';
import type { User } from '@/types';

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || 'travelers_hub_token';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  setUser: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
