import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface MonthlyDestinationItem {
  id: number;
  displayMonth: string;
  destinationName: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  active: boolean;
}

// 공개 API — GET /api/main/monthly-destination (이번 달 활성화된 항목만 표시순서대로 내려옴)
export const monthlyDestinationApi = {
  getCurrentMonth: () =>
    apiClient.get<ApiResponse<MonthlyDestinationItem[]>>("/main/monthly-destination"),
};
