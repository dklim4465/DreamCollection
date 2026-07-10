import apiClient from "@/common/api/client";
import type { ApiResponse, TravelStyle, User } from "@/types";

export interface UpdateProfileReq {
  nickname?: string;
  profileImageUrl?: string;
  travelStyle?: TravelStyle;
}

export const profileApi = {
  // 마이페이지 "프로필 수정" — 값이 있는 필드만 보내면 그 필드만 갱신됨
  updateMe: (data: UpdateProfileReq) =>
    apiClient.patch<ApiResponse<User>>("/users/me", data),
};
