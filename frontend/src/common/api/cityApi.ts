import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface CityItem {
  id: number;
  nameKo: string;
  nameEn: string;
  countryName: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
}

// 공개 API
export const cityApi = {
  getPopular: () => apiClient.get<ApiResponse<CityItem[]>>("/cities/popular"),
  search: (keyword: string) =>
    apiClient.get<ApiResponse<CityItem[]>>("/cities/search", { params: { keyword } }),
};
