import apiClient from "@/common/api/client";
import type { ApiResponse, User } from "@/types";

export interface LoginReq {
  email: string;
  password: string;
}

export type VerificationMethod = "EMAIL" | "PHONE";

export interface RegisterReq {
  email: string;
  password: string;
  name: string;
  nickname: string;
  travelStyle: string;

  verificationMethod: VerificationMethod;
  emailVerificationCode?: string;
  phone?: string;
  phoneVerificationCode?: string;
}

export interface AuthRes {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export const authApi = {
  register: (d: RegisterReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/signup", d),

  login: (d: LoginReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/login", d),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<void>>("/auth/logout", { refreshToken }),

  // 원래는 항상 data: null만 돌려주는 가짜(스텁) 함수였음.
  // 실제 백엔드의 "내 정보 조회" 엔드포인트를 호출하도록 수정.
  getMe: () => apiClient.get<ApiResponse<User>>("/users/me"),

  sendPhoneCode: (phone: string) =>
    apiClient.post<ApiResponse<void>>("/auth/phone/send-code", { phone }),
  verifyPhoneCode: (phone: string, code: string) =>
    apiClient.post<ApiResponse<void>>("/auth/phone/verify-code", {
      phone,
      code,
    }),

  sendEmailCode: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/email/send-code", {
      email,
      purpose: "SIGNUP",
    }),
  verifyEmailCode: (email: string, code: string) =>
    apiClient.post<ApiResponse<void>>("/auth/email/verify-code", {
      email,
      code,
    }),

  redirectToKakaoLogin: () => {
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: "code",
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  },

  loginWithKakaoCode: (code: string) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/oauth/kakao", { code }),
};
