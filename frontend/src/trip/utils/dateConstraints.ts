/** 로컬 기준 YYYY-MM-DD (UTC midnight 함정 방지) */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 출발일 최소값 = 내일 (로컬) */
export function minStartDate(): string {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

/** 출발일로 허용되는지 (내일 이후만 true). 빈 문자열은 false */
export function isStartDateAllowed(date: string): boolean {
  const trimmed = date.trim();
  if (!trimmed) return false;
  return trimmed >= minStartDate();
}

/**
 * 유효하지 않은 출발일(오늘/과거)이면 ""로 비움.
 * 로딩 시 과거값이 있어도 사용자가 다시 고르도록 함.
 */
export function sanitizeStartDate(date?: string | null): string {
  if (!date?.trim()) return "";
  const trimmed = date.trim();
  return isStartDateAllowed(trimmed) ? trimmed : "";
}
