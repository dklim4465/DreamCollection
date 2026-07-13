import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatbotApi = {
  // 홈페이지 AI 챗봇 — 지금까지의 전체 대화(messages)를 보내면 챗봇의 다음 답변을 받아온다
  sendMessage: (messages: ChatMessage[]) =>
    apiClient.post<ApiResponse<{ reply: string }>>("/chatbot/message", { messages }),
};
