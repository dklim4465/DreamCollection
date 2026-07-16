import type { DayPlan } from "@/trip/api/trip";
import type { RecommendationCard } from "./types";
import { TIME_GROUPS, isLockedSlotItem } from "./scheduleUtils";
import ScheduleCard, { type ScheduleDragItem } from "./ScheduleCard";
import EmptySlot, { type EmptySlotTarget } from "./EmptySlot";

export interface EditingTarget {
  dayIndex: number;
  itemIndex: number;
}
export default function TimeSlotRow({
  slot,
  days,
  dragOverTarget,
  onDragOverTarget,
  onEdit,
  onRemove,
  onReplace,
  onSwap,
  onAddRecommendationToSlot,
  onMoveScheduleToSlot,
}: {
  slot: (typeof TIME_GROUPS)[number];
  days: DayPlan[];
  dragOverTarget: EditingTarget | null;
  onDragOverTarget: (target: EditingTarget | null) => void;
  onEdit: (dayIndex: number, itemIndex: number) => void;
  onRemove: (dayIndex: number, itemIndex: number) => void;
  onSwap: (source: ScheduleDragItem, target: EditingTarget) => void;
  onAddRecommendationToSlot: (
    target: EmptySlotTarget,
    card: RecommendationCard,
  ) => void;
  onMoveScheduleToSlot: (
    source: ScheduleDragItem,
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
      <div className="flex min-h-[112px] flex-col items-center justify-center border-r border-t border-outline-variant/50 bg-surface-container-low px-1 text-center">
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
          .filter(({ item }) => item.timeSlot === slot.key)
          .sort(
            (a, b) =>
              (a.item.slotOrder ?? a.itemIndex + 1) -
              (b.item.slotOrder ?? b.itemIndex + 1),
          );
        const isBlockedSlot = items.some(({ item }) => isLockedSlotItem(item));

        return (
          <div
            key={`${slot.key}-${day.dayNumber}`}
            className="min-h-[112px] border-r border-t border-outline-variant/50 bg-surface-container-low/60 p-2"
          >
            <div className="space-y-2">
              {items.map(({ item, itemIndex }) => (
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
                />
              ))}
              {!isBlockedSlot && (
                <EmptySlot
                  dayIndex={dayIndex}
                  timeSlot={slot.key}
                  compact={items.length > 0}
                  onAddRecommendation={onAddRecommendationToSlot}
                  onMoveSchedule={onMoveScheduleToSlot}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
