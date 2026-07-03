import type { ApiResponse, CartItem, TravelPlan } from "@/types";
import { delay, readAll, writeAll, nextId, MOCK_KEYS } from "@/common/api/mockDb";
import { useAuthStore } from "@/auth/store/authStore";

function ok<T>(data: T): { data: ApiResponse<T> } {
  return { data: { success: true, message: "OK", data } };
}

// TODO: 실제로는 AI_RECOMMENDATION 가격을 기반으로 결정됨.
// 지금은 mock 단계라 일정당 임시 고정가를 매깁니다.
const MOCK_PRICE_PER_PLAN = 350000;

function currentUserId(): number {
  return useAuthStore.getState().user?.id ?? 0;
}

function cartKey() {
  return `${MOCK_KEYS.CART}_${currentUserId()}`;
}

export const cartApi = {
  getItems: async (): Promise<{ data: ApiResponse<CartItem[]> }> => {
    await delay(150);
    return ok(readAll<CartItem>(cartKey()));
  },

  addItem: async (plan: TravelPlan): Promise<{ data: ApiResponse<CartItem> }> => {
    await delay(200);
    const items = readAll<CartItem>(cartKey());
    const already = items.find((i) => i.scheduleId === plan.id);
    if (already) return ok(already);

    const newItem: CartItem = {
      id: nextId(items),
      scheduleId: plan.id,
      scheduleTitle: plan.title,
      destination: plan.destination,
      price: MOCK_PRICE_PER_PLAN,
      addedAt: new Date().toISOString(),
    };
    items.push(newItem);
    writeAll(cartKey(), items);
    return ok(newItem);
  },

  removeItem: async (itemId: number): Promise<void> => {
    await delay(150);
    const items = readAll<CartItem>(cartKey());
    writeAll(cartKey(), items.filter((i) => i.id !== itemId));
  },

  clear: async (): Promise<void> => {
    writeAll(cartKey(), []);
  },
};
