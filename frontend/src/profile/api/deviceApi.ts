import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface LoginHistoryItem {
  id: number;
  loginType: "EMAIL" | "GOOGLE" | "KAKAO" | "NAVER";
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

export interface DeviceSession {
  id: number;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

export const deviceApi = {
  // 마이페이지 "최근 로그인 기록" → GET /api/users/me/login-history
  getLoginHistory: () =>
    apiClient.get<ApiResponse<LoginHistoryItem[]>>("/users/me/login-history"),

  // 마이페이지 "로그인된 기기 목록" → GET /api/users/me/devices
  getMyDevices: () => apiClient.get<ApiResponse<DeviceSession[]>>("/users/me/devices"),

  // 특정 기기 로그아웃 → DELETE /api/users/me/devices/{id}
  revokeDevice: (deviceId: number) =>
    apiClient.delete<ApiResponse<void>>(`/users/me/devices/${deviceId}`),

  // 모든 기기에서 로그아웃 → DELETE /api/users/me/devices
  revokeAllDevices: () => apiClient.delete<ApiResponse<void>>("/users/me/devices"),
};
