import apiClient from "./client";
import type { ApiResponse, User } from "@/types";

export interface LoginReq {
  email: string;
  password: string;
}
export interface RegisterReq {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  phoneVerificationCode?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  travelStyle: string;
}
export interface AuthRes {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: (d: LoginReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/login", d),
  register: (d: RegisterReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/register", d),
  getMe: () => apiClient.get<ApiResponse<User>>("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),

  // TODO: 백엔드 SMS 인증 API 연동
  sendPhoneCode: (phone: string) =>
    apiClient.post("/auth/phone/send", { phone }),
  verifyPhoneCode: (phone: string, code: string) =>
    apiClient.post("/auth/phone/verify", { phone, code }),

  // TODO: 카카오 OAuth 연동 — REST API 키 발급 후 redirect URI 구성
  kakaoLogin: () => {
    window.location.href = "/api/auth/kakao";
  },
};
