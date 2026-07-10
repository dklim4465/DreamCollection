import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface PaymentCard {
  id: number;
  cardCompany: string | null;
  cardLast4: string | null;
  isDefault: boolean;
  createdAt: string;
}

// TODO: 백엔드 배포 주소가 확정되면 .env의 VITE_TOSS_CLIENT_KEY 값도 실제 키로 교체
export const TOSS_CLIENT_KEY =
  import.meta.env.VITE_TOSS_CLIENT_KEY || "test_ck_dummy_for_local_dev";

export const paymentCardApi = {
  // authKey 교환 → 카드 등록 완료 (백엔드가 토스 API 호출)
  registerCard: (authKey: string, customerKey: string) =>
    apiClient.post<ApiResponse<PaymentCard>>("/users/me/payment-cards", {
      authKey,
      customerKey,
    }),

  getMyCards: () =>
    apiClient.get<ApiResponse<PaymentCard[]>>("/users/me/payment-cards"),

  // 마이페이지 "결제수단 삭제"
  deleteCard: (cardId: number) =>
    apiClient.delete<ApiResponse<void>>(`/users/me/payment-cards/${cardId}`),

  // 마이페이지 "기본 결제수단으로 변경"
  setDefaultCard: (cardId: number) =>
    apiClient.patch<ApiResponse<void>>(`/users/me/payment-cards/${cardId}/default`),
};
