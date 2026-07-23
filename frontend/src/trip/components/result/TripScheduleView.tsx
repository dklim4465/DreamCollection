import { useState } from "react";
import type {
  PlanRequest,
  ScheduleItem,
  TripRecommendation,
} from "@/trip/api/trip";
import TripOptionModal from "./TripOptionModal";
import TripSuggestionPanel from "@/trip/components/schedule/TripSuggestionPanel";
import type { RecommendationCard } from "@/trip/components/schedule/types";
import {
  isFixedTransportOrStayItem,
  canMoveScheduleItem,
} from "@/trip/components/schedule/scheduleUtils";
import type { ScheduleDragItem } from "@/trip/components/schedule/ScheduleCard";
import type { EmptySlotTarget } from "@/trip/components/schedule/EmptySlot";
import ScheduleGrid, {
  type EditingTarget,
} from "@/trip/components/schedule/ScheduleGrid";
import {
  buildScheduleItemKey,
  createItemKeyForSlot,
} from "@/trip/utils/scheduleItemKey";

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

function normalizeSlotOrders(items: ScheduleItem[]) {
  const slotCounts = new Map<string, number>();

  return items.map((item) => {
    const nextOrder = (slotCounts.get(item.timeSlot) ?? 0) + 1;
    slotCounts.set(item.timeSlot, nextOrder);

    return {
      ...item,
      slotOrder: nextOrder,
    };
  });
}

function getNextSlotOrder(items: ScheduleItem[], timeSlot: string) {
  return (
    items.reduce((maxOrder, item, index) => {
      if (item.timeSlot !== timeSlot) return maxOrder;

      return Math.max(maxOrder, item.slotOrder ?? index + 1);
    }, 0) + 1
  );
}

export default function TripScheduleView({
  conditions,
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

  const handleReplaceItem = (
    dayIndex: number,
    itemIndex: number,
    card: RecommendationCard,
  ) => {
    const targetItem = recommendation.days[dayIndex].items[itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

    const nextDays = recommendation.days.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      return {
        ...day,
        items: normalizeSlotOrders(
          day.items.map((item, iIdx) => {
            if (iIdx !== itemIndex) return item;

            return {
              ...item,
              itemType: card.itemType,
              placeCategory: card.placeCategory,
              title: card.title,
              description: card.description,
              imageUrl: card.imageUrl,
              address: card.sourceUrl,
            };
          }),
        ),
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
      items: normalizeSlotOrders(
        day.items.map((item, itemIndex) => {
          if (dayIndex === source.dayIndex && itemIndex === source.itemIndex) {
            return {
              ...targetItem,
              timeSlot: sourceItem.timeSlot,
              slotOrder: sourceItem.slotOrder,
              itemKey: buildScheduleItemKey(
                day.dayNumber,
                sourceItem.timeSlot,
                sourceItem.slotOrder ?? 1,
              ),
            };
          }

          if (dayIndex === target.dayIndex && itemIndex === target.itemIndex) {
            return {
              ...sourceItem,
              timeSlot: targetItem.timeSlot,
              slotOrder: targetItem.slotOrder,
              itemKey: buildScheduleItemKey(
                day.dayNumber,
                targetItem.timeSlot,
                targetItem.slotOrder ?? 1,
              ),
            };
          }

          return item;
        }),
      ),
    }));

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleRemoveItem = (dayIndex: number, itemIndex: number) => {
    const targetItem = recommendation.days[dayIndex].items[itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

    const nextDays = recommendation.days.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      return {
        ...day,
        items: normalizeSlotOrders(
          day.items.filter((_, iIdx) => iIdx !== itemIndex),
        ),
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
        itemKey: createItemKeyForSlot(day, target.timeSlot),
        itemType: card.itemType,
        placeCategory: card.placeCategory,
        timeSlot: target.timeSlot,
        slotOrder: getNextSlotOrder(day.items, target.timeSlot),
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl,
        address: card.sourceUrl,
        replaceable: true,
      };

      return {
        ...day,
        items: normalizeSlotOrders([...day.items, newItem]),
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
          items: normalizeSlotOrders(
            day.items.filter((_, itemIndex) => itemIndex !== source.itemIndex),
          ),
        };
      }

      return day;
    });

    nextDays[target.dayIndex] = {
      ...nextDays[target.dayIndex],
      items: normalizeSlotOrders([
        ...nextDays[target.dayIndex].items,
        {
          ...sourceItem,
          timeSlot: target.timeSlot,
          itemKey: createItemKeyForSlot(
            nextDays[target.dayIndex],
            target.timeSlot,
          ),
          slotOrder: getNextSlotOrder(
            nextDays[target.dayIndex].items,
            target.timeSlot,
          ),
        },
      ]),
    };

    onChangeRecommendation({ ...recommendation, days: nextDays });
  };

  const handleClearSchedule = () => {
    const confirmed = window.confirm(
      "내부 내용이 전부 삭제됩니다! 항공과 숙소 일정은 유지됩니다.",
    );

    if (!confirmed) return;

    const nextDays = recommendation.days.map((day) => ({
      ...day,
      items: normalizeSlotOrders(
        day.items.filter((item) => isFixedTransportOrStayItem(item)),
      ),
    }));

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

  return (
    <div className="space-y-stack-md">
      <div className="grid items-stretch gap-stack-md xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <ScheduleGrid
          days={recommendation.days}
          dragOverTarget={dragOverTarget}
          onDragOverTarget={setDragOverTarget}
          onEdit={(dayIndex, itemIndex) =>
            setEditingTarget({ dayIndex, itemIndex })
          }
          onRemove={handleRemoveItem}
          onReplace={handleReplaceItem}
          onSwap={handleSwapItems}
          onAddRecommendationToSlot={handleAddRecommendationToSlot}
          onMoveScheduleToSlot={handleMoveScheduleToSlot}
        />

        <TripSuggestionPanel
          city={conditions.destination ?? ""}
          onDragEnd={() => setDragOverTarget(null)}
        />
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
                className="inline-flex items-center gap-2 rounded-xl border border-error/40 px-5 py-3 text-label-md font-bold text-error transition hover:bg-error/10 disabled:opacity-50"
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
