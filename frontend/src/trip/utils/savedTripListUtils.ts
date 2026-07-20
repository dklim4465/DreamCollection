import type { SavedTrip } from "@/trip/api/trip";
import type { PlaceOption } from "@/trip/api/place";

/** "2박 3일" → 총 일수(3). 없으면 1 */
export function parseTripDayCount(when?: string): number {
  if (!when?.trim()) return 1;
  const dayMatch = when.match(/(\d+)\s*일/);
  if (dayMatch) return Math.max(1, Number(dayMatch[1]));
  const nightMatch = when.match(/(\d+)\s*박/);
  if (nightMatch) return Math.max(1, Number(nightMatch[1]) + 1);
  return 1;
}

/** 시작일 + when → 종료일 (로컬 Date, 시각 00:00) */
export function getTripEndDate(startDate?: string, when?: string): Date | null {
  if (!startDate) return null;
  const start = parseDateOnly(startDate);
  if (!start) return null;
  const days = parseTripDayCount(when);
  const end = new Date(start);
  end.setDate(end.getDate() + (days - 1));
  return end;
}

export function parseDateOnly(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 오늘 0시 기준 D-day. 출발 전이면 양수, 당일 0, 지났으면 음수 */
export function getDday(startDate?: string): number | null {
  const start = startDate ? parseDateOnly(startDate) : null;
  if (!start) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = start.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export type TripScheduleStatus = "upcoming" | "ongoing" | "past" | "unknown";

export function getTripScheduleStatus(trip: SavedTrip): TripScheduleStatus {
  const start = trip.conditions.startDate
    ? parseDateOnly(trip.conditions.startDate)
    : null;
  if (!start) return "unknown";

  const end =
    getTripEndDate(trip.conditions.startDate, trip.conditions.when) ?? start;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today.getTime() > end.getTime()) return "past";
  if (today.getTime() < start.getTime()) return "upcoming";
  return "ongoing";
}

/** 일정 카드에 쓸 장소(스케줄 아이템) 개수 */
export function countSchedulePlaces(trip: SavedTrip): number {
  return (
    trip.recommendation?.days?.reduce(
      (sum, day) => sum + (day.items?.length ?? 0),
      0,
    ) ?? 0
  );
}

/** 2026-07-18 → 2026.07.18 */
export function formatDotDate(value?: string | null): string {
  if (!value) return "";
  const date = parseDateOnly(value.includes("T") ? value.slice(0, 10) : value);
  if (!date) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/** 시작~종료 표시: 2026.07.18 - 07.20 */
export function formatTripDateRange(trip: SavedTrip): string {
  const start = trip.conditions.startDate;
  if (!start) return formatDotDate(trip.createdDate) || "날짜 미정";

  const startLabel = formatDotDate(start);
  const end = getTripEndDate(start, trip.conditions.when);
  if (!end) return startLabel;

  const em = String(end.getMonth() + 1).padStart(2, "0");
  const ed = String(end.getDate()).padStart(2, "0");
  return `${startLabel} - ${em}.${ed}`;
}

/** 히어로/카드 제목: 도쿄 2박 3일 */
export function buildTripDisplayTitle(trip: SavedTrip): string {
  const city = trip.conditions.destination || trip.conditions.region || "여행";
  const when = trip.conditions.when?.trim();
  if (when) return `${city} ${when}`;
  return trip.recommendation?.title || city;
}

export function buildTripTags(trip: SavedTrip): string[] {
  const tags = [
    trip.conditions.region,
    trip.conditions.theme,
    trip.conditions.level,
    trip.conditions.who,
  ].filter((v): v is string => Boolean(v && v.trim()));
  return [...new Set(tags)];
}

/** imageUrl 있는 Place만 (관광지 먼저, 그다음 전체) */
export function placesWithImages(places: PlaceOption[]): PlaceOption[] {
  const withImage = places.filter((p) => Boolean(p.imageUrl?.trim()));
  const attractions = withImage.filter((p) => p.category === "ATTRACTION");
  return attractions.length > 0 ? attractions : withImage;
}

/**
 * 일정마다 다른 썸네일 URL 후보 목록 (앞에서부터 시도)
 * 1) 스케줄 item.imageUrl
 * 2) 스케줄 제목 ↔ Place 이름 매칭
 * 3) savedTripId로 Place 목록을 돌려 가며 배정 (같은 도시여도 카드마다 다름)
 */
export function collectTripThumbnailCandidates(
  trip: SavedTrip,
  places: PlaceOption[],
): string[] {
  const urls: string[] = [];
  const push = (url?: string | null) => {
    const trimmed = url?.trim();
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed);
  };

  for (const day of trip.recommendation?.days ?? []) {
    for (const item of day.items ?? []) {
      push(item.imageUrl);
    }
  }

  const titles = (trip.recommendation?.days ?? [])
    .flatMap((d) => d.items ?? [])
    .map((i) => i.title?.trim())
    .filter((t): t is string => Boolean(t));

  for (const title of titles) {
    const matched = places.find((p) => {
      if (!p.imageUrl?.trim() || !p.name?.trim()) return false;
      return p.name.includes(title) || title.includes(p.name);
    });
    push(matched?.imageUrl);
  }

  const pool = placesWithImages(places);
  if (pool.length > 0) {
    const start = Number(trip.savedTripId) % pool.length;
    for (let i = 0; i < pool.length; i++) {
      push(pool[(start + i) % pool.length]?.imageUrl);
    }
  }

  return urls;
}

/** 첫 후보 (하위 호환). 깨질 수 있으니 UI에서는 candidates + onError 권장 */
export function pickTripThumbnailUrl(
  trip: SavedTrip,
  places: PlaceOption[],
): string | undefined {
  return collectTripThumbnailCandidates(trip, places)[0];
}
