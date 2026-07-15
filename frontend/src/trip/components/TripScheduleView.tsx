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
        items: day.items.map((item, iIdx) => {
          if (iIdx !== itemIndex) return item;

          return {
            ...item,
            itemKey: `recommendation-${card.id}-${dayIndex}-${item.timeSlot}-${Date.now()}`,
            itemType: card.itemType,
            title: card.title,
            description: card.description,
            imageUrl: card.imageUrl,
            address: card.sourceUrl,
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

  const handleRemoveItem = (dayIndex: number, itemIndex: number) => {
    const targetItem = recommendation.days[dayIndex].items[itemIndex];

    if (!canMoveScheduleItem(targetItem)) return;

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
        address: card.sourceUrl,
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
          items: day.items.filter(
            (_, itemIndex) => itemIndex !== source.itemIndex,
          ),
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

  const handleClearSchedule = () => {
    const confirmed = window.confirm(
      "내부 내용이 전부 삭제됩니다! 항공과 숙소 일정은 유지됩니다.",
    );

    if (!confirmed) return;

    const nextDays = recommendation.days.map((day) => ({
      ...day,
      items: day.items.filter((item) => isFixedTransportOrStayItem(item)),
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
