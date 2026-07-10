import { create } from 'zustand';
import type { User } from '@/types';

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || 'travelers_hub_token';
const REFRESH_TOKEN_KEY = `${TOKEN_KEY}_refresh`;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  hydrateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  setUser: (user, accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, isAuthenticated: true });
  },
  updateUser: (user) => set({ user }),
  // 새로고침 직후처럼 토큰은 있는데 user 정보만 비어있을 때, 토큰은 그대로 두고 user만 채워넣기
  hydrateUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}