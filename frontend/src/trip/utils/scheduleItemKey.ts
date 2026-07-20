import type { DayPlan, ScheduleItem } from "@/trip/api/trip";

/** day1-lunch-1 */
export function buildScheduleItemKey(
  dayNumber: number,
  timeSlot: string,
  sequence: number,
): string {
  return `day${dayNumber}-${timeSlot.toLowerCase()}-${sequence}`;
}

/** 해당 day+slot에서 다음 sequence */
export function getNextSequence(
  items: ScheduleItem[],
  timeSlot: string,
): number {
  let max = 0;
  for (const item of items) {
    if (item.timeSlot !== timeSlot) continue;
    const m = item.itemKey.match(/-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  // 키가 옛 형식이면 slot 내 개수+1로 fallback
  if (max === 0) {
    return items.filter((i) => i.timeSlot === timeSlot).length + 1;
  }
  return max + 1;
}

export function createItemKeyForSlot(day: DayPlan, timeSlot: string): string {
  const seq = getNextSequence(day.items, timeSlot);
  return buildScheduleItemKey(day.dayNumber, timeSlot, seq);
}
