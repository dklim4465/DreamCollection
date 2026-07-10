import { create } from "zustand";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "dream_collection_theme";

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function getInitialMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // 저장된 값이 없으면 사용자 OS/브라우저의 다크모드 설정을 따라감
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const initialMode = getInitialMode();
applyThemeClass(initialMode); // 모듈이 로드되자마자(첫 렌더 전) 바로 적용해서 깜빡임 최소화

// 상단 네비게이션의 "다크모드 토글"이 이 스토어를 통해 <html>에 dark 클래스를 붙였다 뗐다 함
// (styles/index.css의 :root / .dark 색상 변수가 그 클래스에 반응함)
export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  toggle: () => {
    const next: ThemeMode = get().mode === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyThemeClass(next);
    set({ mode: next });
  },
  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    applyThemeClass(mode);
    set({ mode });
  },
}));
