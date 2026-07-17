import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatHistoryItem extends ChatMessage {
  createdAt: string;
}

export const chatbotApi = {
  // 홈페이지 AI 챗봇 — 지금까지의 전체 대화(messages)를 보내면 챗봇의 다음 답변을 받아온다
  // ⚠ Gemini 응답 생성이 기본 axios 타임아웃(10초)보다 오래 걸릴 때가 있어서
  //   이 요청만 30초로 늘려둠 (짧으면 "메시지를 보내지 못했어요"가 자꾸 뜸)
  sendMessage: (messages: ChatMessage[]) =>
    apiClient.post<ApiResponse<{ reply: string }>>(
      "/chatbot/message",
      { messages },
      { timeout: 30000 }
    ),

  // 챗봇 패널을 열 때 이전 대화를 이어서 보여주기 위한 히스토리 조회 (계정별로 저장됨)
  getHistory: () => apiClient.get<ApiResponse<ChatHistoryItem[]>>("/chatbot/history"),

  // "대화 초기화" 버튼 등에서 사용
  clearHistory: () => apiClient.delete<ApiResponse<null>>("/chatbot/history"),
};
