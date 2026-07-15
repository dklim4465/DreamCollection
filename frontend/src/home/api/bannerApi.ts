import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface Banner {
  id: number;
  title: string;
  mediaType: "IMAGE" | "VIDEO";
  bannerType: "POPUP" | "CORNER_AD";
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  active: boolean;
}

// 공개 API — 비로그인 상태에서도 호출 가능 (GET /api/banners)
export const bannerApi = {
  getBanners: () => apiClient.get<ApiResponse<Banner[]>>("/banners"),
};
