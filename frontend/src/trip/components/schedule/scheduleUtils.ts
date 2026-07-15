import type { ScheduleItem } from "@/trip/api/trip";

export const TIME_GROUPS = [
  {
    key: "Morning",
    label: "아침",
    icon: "wb_sunny",
    tone: "text-orange-500",
  },
  {
    key: "Lunch",
    label: "점심",
    icon: "wb_sunny",
    tone: "text-orange-500",
  },
  {
    key: "Afternoon",
    label: "오후",
    icon: "brightness_5",
    tone: "text-blue-500",
  },
  {
    key: "Dinner",
    label: "저녁",
    icon: "dark_mode",
    tone: "text-blue-500",
  },
  {
    key: "Night",
    label: "야간",
    icon: "nightlight",
    tone: "text-slate-500",
  },
] as const;

export const ITEM_BADGE: Record<string, { label: string; className: string }> =
  {
    Activity: {
      label: "관광",
      className: "bg-blue-50 text-blue-600",
    },
    Meal: {
      label: "식사",
      className: "bg-orange-50 text-orange-600",
    },
    Experience: {
      label: "체험",
      className: "bg-violet-50 text-violet-600",
    },
    Transport: {
      label: "교통",
      className: "bg-slate-100 text-slate-600",
    },
    Flight: {
      label: "이동",
      className: "bg-slate-100 text-slate-500",
    },
    Accommodation: {
      label: "숙소",
      className: "bg-emerald-50 text-emerald-600",
    },
    Hotel: {
      label: "숙소",
      className: "bg-emerald-50 text-emerald-600",
    },
  };

export const isAccommodationItem = (item: ScheduleItem) => {
  const type = item.itemType.toLowerCase();
  const title = item.title.toLowerCase();

  return (
    type.includes("accommodation") ||
    type.includes("hotel") ||
    type.includes("lodging") ||
    type.includes("stay") ||
    item.itemType.includes("숙소") ||
    item.title.includes("숙소") ||
    title.includes("hotel")
  );
};

export const isFlightItem = (item: ScheduleItem) => {
  const type = item.itemType.toLowerCase();
  const title = item.title.toLowerCase();

  return (
    type.includes("flight") ||
    type.includes("air") ||
    item.itemType.includes("항공") ||
    item.title.includes("항공") ||
    title.includes("flight")
  );
};

export const isLockedSlotItem = (item: ScheduleItem) =>
  item.itemType === "LockedSlot";

export const isFixedTransportOrStayItem = (item: ScheduleItem) =>
  isFlightItem(item) || isAccommodationItem(item) || isLockedSlotItem(item);

export const canMoveScheduleItem = (item: ScheduleItem) =>
  item.replaceable && !isFixedTransportOrStayItem(item);
