import apiClient from "@/common/api/client";
import type { ApiResponse, PageResponse } from "@/types";

export interface Letter {
  id: number;
  type: string;
  sourceId: number | null;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export const letterApi = {
  // 마이페이지 "편지함" — 로그인 필요
  getMyLetters: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Letter>>>("/letters", {
      params: { page, size },
    }),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<number>>("/letters/unread-count"),

  // 열람과 동시에 읽음 처리됨
  getOne: (id: number) =>
    apiClient.get<ApiResponse<Letter>>(`/letters/${id}`),

  delete: (id: number) => apiClient.delete<ApiResponse<void>>(`/letters/${id}`),
};
