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

  // 공지사항 상세의 [쿠폰받기] 버튼 클릭 시 지급 — 로그인 필요
  // (어떤 쿠폰을 줄지는 공지의 couponCode를 그대로 넘겨받아 사용한다)
  claimCoupon: (code: string) =>
    apiClient.post<ApiResponse<null>>(`/coupons/claim/${code}`),
};
