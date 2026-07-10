import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface StatsData {
  tripCount: number;
  userCount: number;
  travelLogCount: number;
  countryCount: number;
}

export const statsApi = {
  getStats: () => apiClient.get<ApiResponse<StatsData>>("/stats"),
};