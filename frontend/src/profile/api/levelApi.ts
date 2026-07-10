import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface LevelInfo {
  level: number;
  tripCount: number;
  // 아래 둘 다 null이면 이미 최고 레벨
  nextLevelTripCount: number | null;
  tripsToNextLevel: number | null;
}

export const levelApi = {
  // 마이페이지 "레벨 시스템" — 여행 횟수 기준 현재 레벨 조회
  getMyLevel: () => apiClient.get<ApiResponse<LevelInfo>>("/users/me/level"),
};
