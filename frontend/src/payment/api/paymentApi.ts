import type { ApiResponse, CartItem, Payment, PaymentMethod } from "@/types";
import { delay, readAll, writeAll, nextId, MOCK_KEYS } from "@/common/api/mockDb";
import { useAuthStore } from "@/auth/store/authStore";
import { cartApi } from "./cartApi";

function ok<T>(data: T): { data: ApiResponse<T> } {
  return { data: { success: true, message: "OK", data } };
}

function currentUserId(): number {
  return useAuthStore.getState().user?.id ?? 0;
}

function paymentKey() {
  return `${MOCK_KEYS.PAYMENTS}_${currentUserId()}`;
}

export const paymentApi = {
  getHistory: async (): Promise<{ data: ApiResponse<Payment[]> }> => {
    await delay(150);
    const all = readAll<Payment>(paymentKey());
    return ok(all.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)));
  },

  // 장바구니 항목들을 한 번에 결제 처리 (mock — 실제 PG 연동 아님)
  checkout: async (
    items: CartItem[],
    method: PaymentMethod,
  ): Promise<{ data: ApiResponse<Payment[]> }> => {
    await delay(600); // 결제창 대기 흉내

    const all = readAll<Payment>(paymentKey());
    const created: Payment[] = [];

    for (const item of items) {
      const payment: Payment = {
        id: nextId([...all, ...created]),
        scheduleId: item.scheduleId,
        scheduleTitle: item.scheduleTitle,
        amount: item.price,
        method,
        status: "PAID",
        paidAt: new Date().toISOString(),
      };
      created.push(payment);
    }

    writeAll(paymentKey(), [...all, ...created]);
    await cartApi.clear();

    return ok(created);
  },
};
