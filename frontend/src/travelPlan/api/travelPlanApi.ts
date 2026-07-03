import type { ApiResponse, TravelPlan } from "@/types";
import { delay, readAll, writeAll, nextId, MOCK_KEYS } from "@/common/api/mockDb";
import { useAuthStore } from "@/auth/store/authStore";

export interface CreatePlanReq {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  memo?: string;
}

function ok<T>(data: T): { data: ApiResponse<T> } {
  return { data: { success: true, message: "OK", data } };
}

function currentUserId(): number {
  return useAuthStore.getState().user?.id ?? 0;
}

export const travelPlanApi = {
  // 내 일정 전체 목록 (최신순)
  getMyPlans: async (): Promise<{ data: ApiResponse<TravelPlan[]> }> => {
    await delay();
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    const mine = all
      .filter((p) => p.authorId === currentUserId())
      .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
    return ok(mine);
  },

  // 메인페이지 배경/캘린더용 — 가장 임박한 다가오는 일정
  getUpcoming: async (): Promise<{ data: ApiResponse<TravelPlan | null> }> => {
    await delay(150);
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = all
      .filter(
        (p) =>
          p.authorId === currentUserId() &&
          p.status !== "CANCELLED" &&
          p.startDate >= today,
      )
      .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))[0];
    return ok(upcoming ?? null);
  },

  getById: async (id: number): Promise<{ data: ApiResponse<TravelPlan | null> }> => {
    await delay(150);
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    return ok(all.find((p) => p.id === id) ?? null);
  },

  create: async (req: CreatePlanReq): Promise<{ data: ApiResponse<TravelPlan> }> => {
    await delay();
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    const newPlan: TravelPlan = {
      id: nextId(all),
      title: req.title,
      destination: req.destination,
      startDate: req.startDate,
      endDate: req.endDate,
      peopleCount: req.peopleCount,
      memo: req.memo,
      phase: "pre",
      status: "DRAFT",
      authorId: currentUserId(),
      createdAt: new Date().toISOString(),
    };
    all.push(newPlan);
    writeAll(MOCK_KEYS.SCHEDULES, all);
    return ok(newPlan);
  },

  // 공유 링크 생성 (없으면 새로 만들고, 있으면 기존 것 반환)
  generateShareLink: async (id: number): Promise<{ data: ApiResponse<TravelPlan> }> => {
    await delay(200);
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("일정을 찾을 수 없습니다.");
    if (!all[idx].shareLink) {
      const token = Math.random().toString(36).slice(2, 10);
      all[idx] = { ...all[idx], shareLink: `${window.location.origin}/shared/plan/${token}` };
      writeAll(MOCK_KEYS.SCHEDULES, all);
    }
    return ok(all[idx]);
  },

  // 결제 완료 후 상태 갱신 (paymentApi.checkout 내부에서 사용)
  markAsPaid: async (id: number): Promise<void> => {
    const all = readAll<TravelPlan>(MOCK_KEYS.SCHEDULES);
    const idx = all.findIndex((p) => p.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], status: "PAID" };
      writeAll(MOCK_KEYS.SCHEDULES, all);
    }
  },
};
