import type {
  AccommodationSelection,
  SavedTrip,
  ScheduleItem,
} from "@/trip/api/trip";
import type { TimelineItem } from "./SavedTripTimelineItem";
import {
  PLACE_CATEGORY_BADGE_CLASS,
  PLACE_CATEGORY_LABELS,
  isPlaceCategory,
} from "@/trip/utils/placeCategoryLabels";

export interface TimelineDay {
  dayNumber: number;
  title: string;
  items: TimelineItem[];
}

const ITEM_META: Record<
  string,
  { category: string; className: string; icon: string }
> = {
  Activity: {
    category: "관광",
    className: "bg-blue-50 text-blue-600",
    icon: "location_on",
  },
  Meal: {
    category: "식사",
    className: "bg-orange-50 text-orange-600",
    icon: "restaurant",
  },
  Experience: {
    category: "체험",
    className: "bg-violet-50 text-violet-600",
    icon: "local_activity",
  },
  Transport: {
    category: "교통",
    className: "bg-slate-100 text-slate-600",
    icon: "directions_transit",
  },
  Flight: {
    category: "항공",
    className: "bg-sky-50 text-sky-700",
    icon: "flight",
  },
  Hotel: {
    category: "숙소",
    className: "bg-emerald-50 text-emerald-700",
    icon: "hotel",
  },
};

const PLACE_CATEGORY_ICON: Record<string, string> = {
  ATTRACTION: "location_on",
  RESTAURANT: "restaurant",
  CAFE: "local_cafe",
  SHOPPING: "shopping_bag",
  NATURE: "park",
  CULTURE: "museum",
  ACTIVITY: "local_activity",
  TRANSPORT: "directions_transit",
  HOTEL: "hotel",
};

const SLOT_LABEL: Record<string, string> = {
  Morning: "오전",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
  Night: "야간",
};

export function buildSavedTripTimeline(trip: SavedTrip): TimelineDay[] {
  const days = trip.recommendation.days.map((day) => ({
    dayNumber: day.dayNumber,
    title: day.dayTitle,
    items: day.items
      .filter((item) => item.itemType !== "LockedSlot")
      .map(toTimelineItem),
  }));

  const accommodation = trip.accommodationSelection;

  if (accommodation && !accommodation.skipped && days.length > 0) {
    days[0].items.splice(
      Math.min(1, days[0].items.length),
      0,
      createAccommodationItem("check-in", accommodation),
    );

    days[days.length - 1].items.unshift(
      createAccommodationItem("check-out", accommodation),
    );
  }

  return days;
}

function toTimelineItem(item: ScheduleItem): TimelineItem {
  const meta = ITEM_META[item.itemType] ?? ITEM_META.Activity;
  const placeCat = item.placeCategory;
  const category =
    placeCat && isPlaceCategory(placeCat)
      ? PLACE_CATEGORY_LABELS[placeCat]
      : meta.category;
  const categoryClassName =
    placeCat && isPlaceCategory(placeCat)
      ? PLACE_CATEGORY_BADGE_CLASS[placeCat]
      : meta.className;
  const icon =
    placeCat && PLACE_CATEGORY_ICON[placeCat]
      ? PLACE_CATEGORY_ICON[placeCat]
      : meta.icon;

  const details: NonNullable<TimelineItem["details"]> = [];

  if (item.durationMinutes) {
    details.push({ label: "소요 시간", value: `${item.durationMinutes}분` });
  }

  if (item.estimatedCost) {
    details.push({
      label: "예상 비용",
      value: `${item.estimatedCost.toLocaleString()}원`,
    });
  }

  return {
    id: item.itemKey,
    timeLabel: SLOT_LABEL[item.timeSlot] ?? item.timeSlot,
    title: item.title,
    category,
    categoryClassName,
    description: item.description,
    address: item.address,
    imageUrl: item.imageUrl,
    icon,
    details,
  };
}

function createAccommodationItem(
  type: "check-in" | "check-out",
  accommodation: AccommodationSelection,
): TimelineItem {
  const isCheckIn = type === "check-in";

  return {
    id: `accommodation-${type}`,
    timeLabel: isCheckIn ? "체크인" : "체크아웃",
    title: accommodation.accommodationName ?? "숙소",
    category: "숙소",
    categoryClassName: "bg-emerald-50 text-emerald-700",
    description: isCheckIn ? "숙소 체크인" : "숙소 체크아웃",
    address: accommodation.address,
    imageUrl: accommodation.imageUrl,
    icon: "hotel",
    details: [
      {
        label: "숙박 기간",
        value: `${accommodation.checkInDate ?? "미정"} - ${
          accommodation.checkOutDate ?? "미정"
        }`,
      },
      ...(accommodation.rating
        ? [{ label: "평점", value: String(accommodation.rating) }]
        : []),
    ],
  };
}
