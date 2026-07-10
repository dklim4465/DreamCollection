import { create } from "zustand";

interface ChatbotUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// 배너("AI와 함께 여행을 계획해 보세요")와 우측 하단 플로팅 버튼이
// 같은 챗봇 패널을 열고 닫을 수 있도록 공유하는 아주 작은 UI 상태.
export const useChatbotUiStore = create<ChatbotUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
