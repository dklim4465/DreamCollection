import type { ApiResponse, Payment } from "@/types";
import { readAll, MOCK_KEYS } from "@/common/api/mockDb";
import { useAuthStore } from "@/auth/store/authStore";

function ok<T>(data: T): { data: ApiResponse<T> } {
  return { data: { success: true, message: "OK", data } };
}

function currentUserId(): number {
  return useAuthStore.getState().user?.id ?? 0;
}

function paymentKey() {
  return `${MOCK_KEYS.PAYMENTS}_${currentUserId()}`;
}

// ⚠ 장바구니(cartApi/CartPage) 관련 기능은 제거했습니다 — mock(가짜 로컬 저장) 기반의
//   구버전 프로토타입이었고, 실제로는 payment_orders/payment_order_items/payment_travelers
//   테이블 기반의 새 결제 플로우로 대체될 예정입니다. 마이페이지 "결제내역"에서 쓰는
//   getHistory()만 남겨뒀습니다.
export const paymentApi = {
  getHistory: async (): Promise<{ data: ApiResponse<Payment[]> }> => {
    const all = readAll<Payment>(paymentKey());
    return ok(all.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)));
  },
};
