import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface CityItem {
  id: number;
  nameKo: string;
  nameEn: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  imageUrl: string | null;
}

export interface CityDetail {
  city: CityItem;
  sameCountryCities: CityItem[];
}

// 공개 API
export const cityApi = {
  getPopular: () => apiClient.get<ApiResponse<CityItem[]>>("/cities/popular"),
  search: (keyword: string) =>
    apiClient.get<ApiResponse<CityItem[]>>("/cities/search", { params: { keyword } }),
  // 여행지 상세 페이지 (/destinations/:cityId)
  getDetail: (cityId: number | string) =>
    apiClient.get<ApiResponse<CityDetail>>(`/cities/${cityId}`),
};
