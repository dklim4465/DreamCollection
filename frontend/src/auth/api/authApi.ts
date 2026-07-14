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

export interface AvailabilityRes {
  available: boolean;
}

export interface PasswordResetTokenRes {
  resetToken: string;
}

// ────────────────────────────────────────────────────────────
// 카카오 로그인(인가 코드 방식) 설정
// developers.kakao.com에서 발급받은 REST API 키 / 콜백 주소를 .env에서 읽어온다.
// ────────────────────────────────────────────────────────────
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

  // GET /api/auth/me — 새로고침 후 유저 정보 복구용 (비로그인/토큰만료 시 data: null)
  getMe: () => apiClient.get<ApiResponse<User | null>>("/auth/me"),

  // ── 회원가입창 중복확인 버튼 ────────────────────────────────
  // GET /api/auth/check-email?email=...
  checkEmail: (email: string) =>
    apiClient.get<ApiResponse<AvailabilityRes>>("/auth/check-email", { params: { email } }),
  // GET /api/auth/check-phone?phone=...
  checkPhone: (phone: string) =>
    apiClient.get<ApiResponse<AvailabilityRes>>("/auth/check-phone", { params: { phone } }),

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

  // ── 비밀번호 찾기(재설정) 3단계 ──────────────────────────
  // 1) 가입된 이메일로 인증코드 발송
  requestPasswordReset: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/password/request", { email }),
  // 2) 인증코드 검증 → 성공 시 1회용 resetToken 발급
  verifyPasswordResetCode: (email: string, code: string) =>
    apiClient.post<ApiResponse<PasswordResetTokenRes>>("/auth/password/verify", {
      email,
      code,
    }),
  // 3) resetToken + 새 비밀번호로 최종 변경
  confirmPasswordReset: (resetToken: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>("/auth/password/confirm", {
      resetToken,
      newPassword,
    }),
};