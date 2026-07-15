import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface MyCoupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: "PERCENT";
  discountValue: number;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  issuedAt: string;
  expiresAt: string;
}

export const couponApi = {
  // 마이페이지 "보관함" — 로그인 필요
  getMyCoupons: () => apiClient.get<ApiResponse<MyCoupon[]>>("/coupons/me"),

  // 7월 이벤트 배너를 클릭한 기존 회원에게 5% 쿠폰 지급 — 로그인 필요
  claimEventCoupon: () => apiClient.post<ApiResponse<null>>("/coupons/claim-event"),
};
