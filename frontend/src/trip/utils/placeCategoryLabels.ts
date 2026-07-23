import type { PlaceCategory } from "@/trip/api/place";

/** PlaceSuggestionList / ScheduleCard 공통 PlaceCategory 한글 라벨 */
export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  ATTRACTION: "관광",
  RESTAURANT: "맛집",
  CAFE: "카페",
  SHOPPING: "쇼핑",
  NATURE: "자연",
  CULTURE: "문화",
  ACTIVITY: "체험",
  TRANSPORT: "교통",
  HOTEL: "숙소",
};

/** 일정 카드·타임라인 배지 색 (PlaceCategory 기준) */
export const PLACE_CATEGORY_BADGE_CLASS: Record<PlaceCategory, string> = {
  ATTRACTION: "bg-blue-50 text-blue-600",
  RESTAURANT: "bg-orange-50 text-orange-600",
  CAFE: "bg-amber-50 text-amber-700",
  SHOPPING: "bg-pink-50 text-pink-600",
  NATURE: "bg-green-50 text-green-700",
  CULTURE: "bg-indigo-50 text-indigo-600",
  ACTIVITY: "bg-violet-50 text-violet-600",
  TRANSPORT: "bg-slate-100 text-slate-600",
  HOTEL: "bg-emerald-50 text-emerald-600",
};

export function isPlaceCategory(value: string): value is PlaceCategory {
  return value in PLACE_CATEGORY_LABELS;
}

export function placeCategoryBadge(
  placeCategory: string | undefined | null,
): { label: string; className: string } | null {
  if (!placeCategory || !isPlaceCategory(placeCategory)) return null;
  return {
    label: PLACE_CATEGORY_LABELS[placeCategory],
    className: PLACE_CATEGORY_BADGE_CLASS[placeCategory],
  };
}
