// ────────────────────────────────────────────────────────────
// 프론트엔드 전용 mock 저장소 (백엔드 미사용)
// localStorage를 가짜 DB로 사용합니다.
// 실제 백엔드가 준비되면 이 파일을 참조하는 api/*.ts 들만
// axios(apiClient) 기반 구현으로 교체하면 됩니다.
// (참고: authApi.ts 도 동일한 패턴을 사용 중)
// ────────────────────────────────────────────────────────────

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export function readAll<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function writeAll<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function nextId<T extends { id: number }>(items: T[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export const MOCK_KEYS = {
  SCHEDULES: "dream_collection_schedules",
  CART: "dream_collection_cart",
  PAYMENTS: "dream_collection_payments",
  RECORDS: "dream_collection_records",
} as const;
