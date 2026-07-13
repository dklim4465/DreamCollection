import apiClient from "@/common/api/client";
import type { ApiResponse, TravelStyle, User } from "@/types";

export interface UpdateProfileReq {
  nickname?: string;
  profileImageUrl?: string;
  travelStyle?: TravelStyle;
}

export interface ChangePasswordReq {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {

  updateMe: (data: UpdateProfileReq) =>
    apiClient.patch<ApiResponse<User>>("/users/me", data),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<User>>("/users/me/profile-image", formData, {
      headers: { "Content-Type": undefined },
    });
  },
  changePassword: (data: ChangePasswordReq) =>
    apiClient.patch<ApiResponse<void>>("/users/me/password", data),
};