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

  // 인증 방식 (이메일 또는 휴대폰 중 하나만 필수)
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

// ────────────────────────────────────────────────────────────
// 카카오 로그인(인가 코드 방식) 설정
// developers.kakao.com에서 발급받은 REST API 키 / 콜백 주소를 .env에서 읽어온다.
// ────────────────────────────────────────────────────────────
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export const authApi = {
  // POST /api/auth/signup
  register: (d: RegisterReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/signup", d),

  // POST /api/auth/login
  login: (d: LoginReq) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/login", d),

  // POST /api/auth/refresh
  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/refresh", { refreshToken }),

  // POST /api/auth/logout
  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<void>>("/auth/logout", { refreshToken }),

  getMe: async (): Promise<{ data: ApiResponse<User | null> }> => {
    return { data: { success: true, message: "OK", data: null } };
  },

  // ── 휴대폰 인증 ──────────────────────────────────────────
  // POST /api/auth/phone/send-code, /api/auth/phone/verify-code
  sendPhoneCode: (phone: string) =>
    apiClient.post<ApiResponse<void>>("/auth/phone/send-code", { phone }),
  verifyPhoneCode: (phone: string, code: string) =>
    apiClient.post<ApiResponse<void>>("/auth/phone/verify-code", { phone, code }),

  // ── 이메일 인증 ──────────────────────────────────────────
  // POST /api/auth/email/send-code, /api/auth/email/verify-code
  sendEmailCode: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/email/send-code", {
      email,
      purpose: "SIGNUP",
    }),
  verifyEmailCode: (email: string, code: string) =>
    apiClient.post<ApiResponse<void>>("/auth/email/verify-code", { email, code }),

  // ── 카카오 로그인 ────────────────────────────────────────
  // 로그인/가입 버튼 클릭 시 호출: 카카오 인가 페이지로 이동시킨다.
  redirectToKakaoLogin: () => {
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: "code",
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  },

  // 카카오가 콜백으로 넘겨준 인가 코드를 백엔드로 전달해 로그인 처리 → POST /api/auth/oauth/kakao
  loginWithKakaoCode: (code: string) =>
    apiClient.post<ApiResponse<AuthRes>>("/auth/oauth/kakao", { code }),
};
