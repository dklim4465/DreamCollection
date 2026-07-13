import { useState } from "react";
import type {
  DayPlan,
  PlanRequest,
  ScheduleItem,
  TripRecommendation,
} from "@/trip/api/trip";
import TripOptionModal from "./TripOptionModal";

interface Props {
  conditions: PlanRequest;
  recommendation: TripRecommendation;
  onChangeRecommendation: (next: TripRecommendation) => void;
  onBack: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  saveLabel?: string;
  hideActions?: boolean;
}

interface EditingTarget {
  dayIndex: number;
  itemIndex: number;
}

interface RecommendationCard {
  id: string;
  itemType: "Activity" | "Meal" | "Experience";
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
}
interface ScheduleDragItem {
  type: "schedule";
  dayIndex: number;
  itemIndex: number;
}
interface RemovedScheduleDragItem {
  type: "removed";
  removedId: string;
}
interface RemovedScheduleItem {
  id: string;
  item: ScheduleItem;
}
interface EmptySlotTarget {
  dayIndex: number;
  timeSlot: string;
}

const TIME_GROUPS = [
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
];

const ITEM_BADGE: Record<string, { label: string; className: string }> = {
  Activity: { label: "관광", className: "bg-blue-50 text-blue-600" },
  Meal: { label: "식사", className: "bg-orange-50 text-orange-600" },
  Flight: { label: "이동", className: "bg-slate-100 text-slate-500" },
  Accommodation: { label: "숙소", className: "bg-emerald-50 text-emerald-600" },
  Hotel: { label: "숙소", className: "bg-emerald-50 text-emerald-600" },
};

const isAccommodationItem = (item: ScheduleItem) => {
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

const isFlightItem = (item: ScheduleItem) => {
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

const isFixedTransportOrStayItem = (item: ScheduleItem) =>
  isFlightItem(item) || isAccommodationItem(item);

const canMoveScheduleItem = (item: ScheduleItem) =>
  item.replaceable && !isFixedTransportOrStayItem(item);

const RECOMMENDATION_CARDS: RecommendationCard[] = [
  {
    id: "tokyo-skytree",
    itemType: "Activity",
    badge: "인기 관광",
    title: "도쿄 스카이트리 전망대",
    description: "도쿄 시내를 한눈에 볼 수 있는 랜드마크 전망대예요.",
    imageUrl:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: "ichiran-ramen",
    itemType: "Meal",
    badge: "현지 맛집",
    title: "이치란 라멘 본점",
    description: "진한 돈코츠 라멘으로 유명한 현지 인기 맛집이에요.",
    imageUrl:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: "teamlab-planets",
    itemType: "Experience",
    badge: "핫플 체험",
    title: "teamLab Planets",
    description: "환상적인 디지털 예술 전시를 체험할 수 있어요.",
    imageUrl:
      "https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=320&q=80",
  },
];

const normalizeScheduleKey = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? "";

const getScheduleItemName = (item: ScheduleItem) => item.title;

const getScheduleItemKey = (item: ScheduleItem) =>
  normalizeScheduleKey(getScheduleItemName(item));

const getScheduleItemIdentity = (item: ScheduleItem) =>
  normalizeScheduleKey(item.itemKey) || getScheduleItemKey(item);

const recommendationCardKeys = new Set(
  RECOMMENDATION_CARDS.map((card) => normalizeScheduleKey(card.title)),
);

const isRecommendationCardItem = (item: ScheduleItem) =>
  recommendationCardKeys.has(getScheduleItemKey(item));

const getActiveScheduleKeys = (recommendation: TripRecommendation) =>
  new Set(
    recommendation.days.flatMap((day) =>
      day.items.map((item) => getScheduleItemIdentity(item)),
    ),
  );

const addRemovedScheduleItem = (
  items: RemovedScheduleItem[],
  item: ScheduleItem,
) => {
  const itemKey = getScheduleItemKey(item);
  const itemIdentity = getScheduleItemIdentity(item);

  if (!itemKey || isRecommendationCardItem(item)) {
    return items;
  }

  return [
    {
      id: `${item.itemKey}-${Date.now()}`,
      item,
    },
    ...items.filter(
      (removed) => getScheduleItemIdentity(removed.item) !== itemIdentity,
    ),
  ];
};

const getVisibleRemovedItems = (
  items: RemovedScheduleItem[],
  recommendation: TripRecommendation,
) => {
  const activeScheduleKeys = getActiveScheduleKeys(recommendation);
  const visibleKeys = new Set<string>();

  return items.filter((removed) => {
    const itemKey = getScheduleItemKey(removed.item);
    const itemIdentity = getScheduleItemIdentity(removed.item);

    if (!itemKey) return false;
    if (isRecommendationCardItem(removed.item)) return false;
    if (activeScheduleKeys.has(itemIdentity)) return false;
    if (visibleKeys.has(itemIdentity)) return false;

    visibleKeys.add(itemIdentity);
    return true;
  });
};

export default function TripScheduleView({
  recommendation,
  onChangeRecommendation,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  saveLabel = "일정 저장",
  hideActions = false,
}: Props) {
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(
    null,
  );
  const [dragOverTarget, setDragOverTarget] = useState<EditingTarget | null>(
    null,
  );
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [removedItems, setRemovedItems] = useState<RemovedScheduleItem[]>([]);

  const handleReplaceItem = (
    dayIndex: number,
    itemIndex: number,
    card: RecommendationCard,
  ) => {
    const targetItem = recommendation.days[dayIndex].items[itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

    setRemovedItems((prev) => addRemovedScheduleItem(prev, targetItem));

    const nextDays = recommendation.days.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      return {
        ...day,
        items: day.items.map((item, iIdx) => {
          if (iIdx !== itemIndex) return item;

          return {
            ...item,
            itemKey: `recommendation-${card.id}-${dayIndex}-${item.timeSlot}-${Date.now()}`,
            itemType: card.itemType,
            title: card.title,
            description: card.description,
            imageUrl: card.imageUrl,
          };
        }),
      };
    });

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleSwapItems = (source: ScheduleDragItem, target: EditingTarget) => {
    if (
      source.dayIndex === target.dayIndex &&
      source.itemIndex === target.itemIndex
    ) {
      return;
    }

    const sourceItem =
      recommendation.days[source.dayIndex].items[source.itemIndex];
    const targetItem =
      recommendation.days[target.dayIndex].items[target.itemIndex];

    if (!canMoveScheduleItem(sourceItem) || !canMoveScheduleItem(targetItem)) {
      return;
    }

    const nextDays = recommendation.days.map((day, dayIndex) => ({
      ...day,
      items: day.items.map((item, itemIndex) => {
        if (dayIndex === source.dayIndex && itemIndex === source.itemIndex) {
          return {
            ...targetItem,
            timeSlot: sourceItem.timeSlot,
          };
        }

        if (dayIndex === target.dayIndex && itemIndex === target.itemIndex) {
          return {
            ...sourceItem,
            timeSlot: targetItem.timeSlot,
          };
        }

        return item;
      }),
    }));

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleRestoreRemovedItem = (
    removedId: string,
    target: EditingTarget,
  ) => {
    const removed = removedItems.find((item) => item.id === removedId);
    if (!removed) return;

    const targetItem =
      recommendation.days[target.dayIndex].items[target.itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

    setRemovedItems((prev) => {
      const restoredItemIdentity = getScheduleItemIdentity(removed.item);
      const nextItems = prev.filter(
        (item) =>
          item.id !== removedId &&
          getScheduleItemIdentity(item.item) !== restoredItemIdentity,
      );

      return addRemovedScheduleItem(nextItems, targetItem);
    });

    const nextDays = recommendation.days.map((day, dayIndex) => ({
      ...day,
      items: day.items.map((item, itemIndex) => {
        if (dayIndex !== target.dayIndex || itemIndex !== target.itemIndex) {
          return item;
        }

        return {
          ...removed.item,
          timeSlot: targetItem.timeSlot,
        };
      }),
    }));

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleRemoveItem = (dayIndex: number, itemIndex: number) => {
    const targetItem = recommendation.days[dayIndex].items[itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

    setRemovedItems((prev) => addRemovedScheduleItem(prev, targetItem));

    const nextDays = recommendation.days.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      return {
        ...day,
        items: day.items.filter((_, iIdx) => iIdx !== itemIndex),
      };
    });

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleAddRecommendationToSlot = (
    target: EmptySlotTarget,
    card: RecommendationCard,
  ) => {
    const nextDays = recommendation.days.map((day, dayIndex) => {
      if (dayIndex !== target.dayIndex) return day;

      const newItem: ScheduleItem = {
        itemKey: `${card.id}-${target.timeSlot}-${Date.now()}`,
        itemType: card.itemType,
        timeSlot: target.timeSlot,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl,
        replaceable: true,
      };

      return {
        ...day,
        items: [...day.items, newItem],
      };
    });

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleMoveScheduleToSlot = (
    source: ScheduleDragItem,
    target: EmptySlotTarget,
  ) => {
    const sourceItem =
      recommendation.days[source.dayIndex].items[source.itemIndex];

    if (!canMoveScheduleItem(sourceItem)) return;

    const nextDays = recommendation.days.map((day, dayIndex) => {
      if (dayIndex === source.dayIndex) {
        return {
          ...day,
          items: day.items.filter((_, itemIndex) => itemIndex !== source.itemIndex),
        };
      }

      return day;
    });

    nextDays[target.dayIndex] = {
      ...nextDays[target.dayIndex],
      items: [
        ...nextDays[target.dayIndex].items,
        {
          ...sourceItem,
          timeSlot: target.timeSlot,
        },
      ],
    };

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleRestoreRemovedToSlot = (
    removedId: string,
    target: EmptySlotTarget,
  ) => {
    const removed = removedItems.find((item) => item.id === removedId);
    if (!removed) return;

    setRemovedItems((prev) => prev.filter((item) => item.id !== removedId));

    const nextDays = recommendation.days.map((day, dayIndex) => {
      if (dayIndex !== target.dayIndex) return day;

      return {
        ...day,
        items: [
          ...day.items,
          {
            ...removed.item,
            timeSlot: target.timeSlot,
          },
        ],
      };
    });

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleClearSchedule = () => {
    const confirmed = window.confirm(
      "내부 내용이 전부 삭제됩니다! 항공과 숙소 일정은 유지됩니다.",
    );

    if (!confirmed) return;

    const nextDays = recommendation.days.map((day) => ({
      ...day,
      items: day.items.filter((item) => isFixedTransportOrStayItem(item)),
    }));

    setRemovedItems([]);
    setEditingTarget(null);
    setDragOverTarget(null);
    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const editingDay =
    editingTarget !== null ? recommendation.days[editingTarget.dayIndex] : null;

  const editingItem =
    editingDay && editingTarget !== null
      ? editingDay.items[editingTarget.itemIndex]
      : null;

  const visibleRemovedItems = getVisibleRemovedItems(
    removedItems,
    recommendation,
  );

  return (
    <div className="space-y-stack-md">
      <div className="grid items-stretch gap-stack-md xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="h-full overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest traveler-glow">
          <div className="border-b border-outline-variant/60 px-stack-md py-stack-sm">
            <div className="flex flex-wrap items-center gap-stack-sm">
              <p className="text-label-md font-semibold text-on-surface-variant">
                드래그를 해서 일정을 조정할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid min-w-[820px]"
              style={{
                gridTemplateColumns: `72px repeat(${recommendation.days.length}, minmax(195px, 1fr))`,
              }}
            >
              <div className="border-r border-outline-variant/60 bg-surface-container-low" />
              {recommendation.days.map((day) => (
                <DayHeader key={day.dayNumber} day={day} />
              ))}

              {TIME_GROUPS.map((slot) => (
                <TimeSlotRow
                  key={slot.key}
                  slot={slot}
                  days={recommendation.days}
                  dragOverTarget={dragOverTarget}
                  onDragOverTarget={setDragOverTarget}
                  onEdit={(dayIndex, itemIndex) =>
                    setEditingTarget({ dayIndex, itemIndex })
                  }
                  onRemove={handleRemoveItem}
                  onReplace={handleReplaceItem}
                  onSwap={handleSwapItems}
                  onRestoreRemoved={handleRestoreRemovedItem}
                  onAddRecommendationToSlot={handleAddRecommendationToSlot}
                  onMoveScheduleToSlot={handleMoveScheduleToSlot}
                  onRestoreRemovedToSlot={handleRestoreRemovedToSlot}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="card-base h-full border border-outline-variant/60 p-stack-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-body-md font-bold text-on-surface">
              맞춤 추천 제안
            </h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-label-md text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
              닫기
            </button>
          </div>

          <div className="mt-stack-sm grid grid-cols-3 overflow-hidden rounded-lg bg-surface-container-low p-1 text-center text-label-sm font-bold text-on-surface-variant">
            <button
              type="button"
              className="rounded-lg bg-surface-container-lowest py-2 text-primary shadow-sm"
            >
              추천 일정
            </button>
            <button type="button" className="py-2">
              맛집
            </button>
            <button type="button" className="py-2">
              체험
            </button>
          </div>

          <div className="mt-stack-sm space-y-stack-sm">
            {RECOMMENDATION_CARDS.map((card) => (
              <article
                key={card.id}
                draggable
                onDragStart={(event) => {
                  setDraggingCardId(card.id);
                  event.dataTransfer.effectAllowed = "copy";
                  event.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "recommendation",
                      card,
                    }),
                  );

                  event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
                }}
                onDragEnd={() => {
                  setDraggingCardId(null);
                  setDragOverTarget(null);
                }}
                className={`cursor-grab rounded-lg border bg-surface-container-lowest p-stack-sm shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition active:cursor-grabbing ${
                  draggingCardId === card.id
                    ? "border-primary ring-2 ring-primary/15"
                    : "border-outline-variant/70"
                }`}
              >
                <div className="flex gap-stack-sm">
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-md bg-orange-50 px-2 py-1 text-label-sm font-bold text-orange-600">
                      {card.badge}
                    </span>
                    <h4 className="mt-1 truncate text-label-md font-bold text-on-surface">
                      {card.title}
                    </h4>
                    <p className="mt-1 line-clamp-1 text-label-sm text-on-surface-variant">
                      {card.description}
                    </p>

                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-stack-md border-t border-outline-variant/60 pt-stack-md">
              <div className="flex items-center justify-between">
                <h4 className="text-label-md font-bold text-on-surface">
                  제외한 일정
                </h4>
                <span className="text-label-sm text-on-surface-variant">
                  {visibleRemovedItems.length}개
                </span>
              </div>

              <div className="mt-stack-sm space-y-stack-sm">
                {visibleRemovedItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-outline-variant/80 bg-surface-container-low px-3 py-3 text-label-sm font-semibold text-on-surface-variant">
                    제외한 일정이 없습니다.
                  </div>
                ) : (
                  visibleRemovedItems.map((removed) => (
                    <article
                      key={removed.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "copyMove";
                        event.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({
                            type: "removed",
                            removedId: removed.id,
                          }),
                        );

                        event.dataTransfer.setDragImage(
                          event.currentTarget,
                          24,
                          24,
                        );
                      }}
                      className="cursor-grab rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-stack-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-stack-sm">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                          <span className="material-symbols-outlined text-[24px]">
                            history
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-md font-bold text-on-surface">
                            {removed.item.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-label-sm text-on-surface-variant">
                            {removed.item.description ?? "제외한 일정입니다."}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          <button
            type="button"
            className="mt-stack-md w-full rounded-xl border border-primary/40 px-4 py-3 text-label-md font-bold text-primary"
          >
            추천 일정 더 보기
            <span className="material-symbols-outlined ml-1 align-[-4px] text-[18px]">
              arrow_forward
            </span>
          </button>
        </aside>
      </div>

      {!hideActions && (
        <div className="flex justify-end">
          <div className="flex flex-wrap gap-stack-sm">
            <button
              type="button"
              onClick={handleClearSchedule}
              className="btn-ghost inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">
                restart_alt
              </span>
              일정 전부 비우기
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!onSave || isSaving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                event_available
              </span>
              {isSaving ? "저장 중..." : saveLabel}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border border-error/40 px-5 py-3 text-label-md font-bold text-error transition hover:bg-error/10 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  delete
                </span>
                {isDeleting ? "삭제 중..." : "일정 삭제"}
              </button>
            )}
          </div>
        </div>
      )}

      {editingDay && editingItem && editingTarget && (
        <TripOptionModal
          day={editingDay}
          item={editingItem}
          onClose={() => setEditingTarget(null)}
        />
      )}
    </div>
  );
}

function DayHeader({ day }: { day: DayPlan }) {
  return (
    <div className="border-r border-outline-variant/60 bg-surface-container-lowest px-2 py-2 text-center">
      <p className="text-label-md font-extrabold text-primary">
        DAY {day.dayNumber}
      </p>
      <p className="mt-0.5 truncate text-label-sm font-bold text-on-surface-variant">
        {day.dayTitle}
      </p>
    </div>
  );
}

function TimeSlotRow({
  slot,
  days,
  dragOverTarget,
  onDragOverTarget,
  onEdit,
  onRemove,
  onReplace,
  onSwap,
  onRestoreRemoved,
  onAddRecommendationToSlot,
  onMoveScheduleToSlot,
  onRestoreRemovedToSlot,
}: {
  slot: (typeof TIME_GROUPS)[number];
  days: DayPlan[];
  dragOverTarget: EditingTarget | null;
  onDragOverTarget: (target: EditingTarget | null) => void;
  onEdit: (dayIndex: number, itemIndex: number) => void;
  onRemove: (dayIndex: number, itemIndex: number) => void;
  onSwap: (source: ScheduleDragItem, target: EditingTarget) => void;
  onRestoreRemoved: (removedId: string, target: EditingTarget) => void;
  onAddRecommendationToSlot: (
    target: EmptySlotTarget,
    card: RecommendationCard,
  ) => void;
  onMoveScheduleToSlot: (
    source: ScheduleDragItem,
    target: EmptySlotTarget,
  ) => void;
  onRestoreRemovedToSlot: (
    removedId: string,
    target: EmptySlotTarget,
  ) => void;
  onReplace: (
    dayIndex: number,
    itemIndex: number,
    card: RecommendationCard,
  ) => void;
}) {
  return (
    <>
      <div className="flex min-h-[112px] flex-col items-center justify-center border-r border-t border-outline-variant/60 bg-surface-container-low px-1 text-center">
        <span className={`material-symbols-outlined text-[20px] ${slot.tone}`}>
          {slot.icon}
        </span>
        <p className="mt-0.5 text-label-sm font-bold text-on-surface">
          {slot.label}
        </p>
      </div>

      {days.map((day, dayIndex) => {
        const items = day.items
          .map((item, itemIndex) => ({ item, itemIndex }))
          .filter(({ item }) => item.timeSlot === slot.key);

        return (
          <div
            key={`${slot.key}-${day.dayNumber}`}
            className="min-h-[112px] border-r border-t border-outline-variant/60 bg-surface-container-lowest p-3"
          >
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map(({ item, itemIndex }) => (
                  <ScheduleCard
                    key={item.itemKey}
                    item={item}
                    isDragOver={
                      dragOverTarget?.dayIndex === dayIndex &&
                      dragOverTarget.itemIndex === itemIndex
                    }
                    onDragOverChange={(isOver) =>
                      onDragOverTarget(isOver ? { dayIndex, itemIndex } : null)
                    }
                    onEdit={() => onEdit(dayIndex, itemIndex)}
                    onRemove={() => onRemove(dayIndex, itemIndex)}
                    onReplace={(card) => onReplace(dayIndex, itemIndex, card)}
                    dayIndex={dayIndex}
                    itemIndex={itemIndex}
                    onSwap={(source) => onSwap(source, { dayIndex, itemIndex })}
                    onRestoreRemoved={(removedId) =>
                      onRestoreRemoved(removedId, { dayIndex, itemIndex })
                    }
                  />
                ))
              ) : (
                <EmptySlot
                  dayIndex={dayIndex}
                  timeSlot={slot.key}
                  onAddRecommendation={onAddRecommendationToSlot}
                  onMoveSchedule={onMoveScheduleToSlot}
                  onRestoreRemoved={onRestoreRemovedToSlot}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function EmptySlot({
  dayIndex,
  timeSlot,
  onAddRecommendation,
  onMoveSchedule,
  onRestoreRemoved,
}: {
  dayIndex: number;
  timeSlot: string;
  onAddRecommendation: (
    target: EmptySlotTarget,
    card: RecommendationCard,
  ) => void;
  onMoveSchedule: (source: ScheduleDragItem, target: EmptySlotTarget) => void;
  onRestoreRemoved: (removedId: string, target: EmptySlotTarget) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragEnter={() => setIsDragOver(true)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);

        const raw = event.dataTransfer.getData("application/json");
        if (!raw) return;

        const target = { dayIndex, timeSlot };
        const payload = JSON.parse(raw) as
          | { type: "recommendation"; card: RecommendationCard }
          | ScheduleDragItem
          | RemovedScheduleDragItem;

        if (payload.type === "recommendation") {
          onAddRecommendation(target, payload.card);
          return;
        }

        if (payload.type === "schedule") {
          onMoveSchedule(payload, target);
          return;
        }

        if (payload.type === "removed") {
          onRestoreRemoved(payload.removedId, target);
        }
      }}
      className={`flex min-h-[88px] items-center justify-center rounded-lg border border-dashed text-label-sm font-semibold transition ${
        isDragOver
          ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/15"
          : "border-outline-variant/80 bg-surface-container-low text-on-surface-variant"
      }`}
    >
      비어 있음
    </div>
  );
}

function ScheduleCard({
  item,
  isDragOver,
  onDragOverChange,
  onEdit,
  onRemove,
  onReplace,
  dayIndex,
  itemIndex,
  onSwap,
  onRestoreRemoved,
}: {
  item: ScheduleItem;
  isDragOver: boolean;
  onDragOverChange: (isOver: boolean) => void;
  onEdit: () => void;
  onRemove: () => void;
  onReplace: (card: RecommendationCard) => void;
  dayIndex: number;
  itemIndex: number;
  onSwap: (source: ScheduleDragItem) => void;
  onRestoreRemoved: (removedId: string) => void;
}) {
  const badge = ITEM_BADGE[item.itemType] ?? ITEM_BADGE.Activity;
  const isMeal = item.itemType === "Meal";
  const isAccommodation = isAccommodationItem(item);
  const isFlight = isFlightItem(item);
  const canMove = canMoveScheduleItem(item);
  const description = item.description ?? "추천 일정 설명이 없습니다.";

  return (
    <article
      onDragEnter={() => {
        if (!canMove) return;
        onDragOverChange(true);
      }}
      onDragOver={(event) => {
        if (!canMove) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDragOverChange(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDragOverChange(false);

        if (!canMove) return;

        const raw = event.dataTransfer.getData("application/json");
        if (!raw) return;

        const payload = JSON.parse(raw) as
          | { type: "recommendation"; card: RecommendationCard }
          | ScheduleDragItem
          | RemovedScheduleDragItem;

        if (payload.type === "recommendation") {
          onReplace(payload.card);
          return;
        }

        if (payload.type === "schedule") {
          onSwap(payload);
        }

        if (payload.type === "removed") {
          onRestoreRemoved(payload.removedId);
        }
      }}
      draggable={canMove}
      onDragStart={(event) => {
        if (!canMove) return;

        event.dataTransfer.effectAllowed = "copyMove";
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            type: "schedule",
            dayIndex,
            itemIndex,
          }),
        );

        event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
      }}
      className={`group flex min-h-[88px] items-center gap-3 rounded-lg border bg-surface-container-lowest p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:border-primary/50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${
        isDragOver
          ? "border-dashed border-primary bg-primary/5 ring-2 ring-primary/15"
          : canMove
            ? "border-outline-variant/70"
            : "border-outline-variant/50 bg-surface-container-low opacity-70"
      }`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined text-[26px]">
            {isFlight
              ? "flight_takeoff"
              : isAccommodation
                ? "hotel"
                : isMeal
                  ? "restaurant"
                  : "location_on"}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-label-md font-bold text-on-surface">
            {item.title}
          </h4>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-label-sm font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-label-sm font-bold text-on-surface-variant">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center">
        {canMove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant opacity-70 transition hover:bg-error/10 hover:text-error hover:opacity-100"
            aria-label="일정 삭제"
          >
            <span className="material-symbols-outlined text-[19px]">
              delete
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container"
          aria-label="일정 변경"
        >
          <span className="material-symbols-outlined text-[20px]">
            more_vert
          </span>
        </button>
      </div>
    </article>
  );
}
