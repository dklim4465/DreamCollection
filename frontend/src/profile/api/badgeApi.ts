import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface BadgeItem {
  id: number;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  conditionType: string;
  conditionValue: number | null;
  conditionCountryCode: string | null;
  earned: boolean;
  representative: boolean;
}

export const badgeApi = {
  // 내 뱃지 목록(획득/미획득 전부 + 대표 여부)
  getMyBadges: () => apiClient.get<ApiResponse<BadgeItem[]>>("/badges/me"),

  // 대표 뱃지 지정 — 닉네임 옆에 이 뱃지가 표시됨
  setRepresentative: (badgeId: number) =>
    apiClient.patch<ApiResponse<void>>(`/badges/me/representative/${badgeId}`),

  // 대표 뱃지 해제
  clearRepresentative: () =>
    apiClient.delete<ApiResponse<void>>("/badges/me/representative"),
};
