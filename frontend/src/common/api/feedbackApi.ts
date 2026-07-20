import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export type FeedbackCategory = "BUG" | "SUGGESTION" | "ETC";

export interface FeedbackRequest {
  name: string;
  email: string;
  category: FeedbackCategory;
  message: string;
}

export const feedbackApi = {
  // 하단 "문의하기" 폼 제출 — 로그인 여부와 무관하게 누구나 보낼 수 있음
  submit: (request: FeedbackRequest) =>
    apiClient.post<ApiResponse<null>>("/feedback", request),
};
