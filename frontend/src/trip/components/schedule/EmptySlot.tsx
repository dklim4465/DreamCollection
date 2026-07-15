import { useState } from "react";
import type { RecommendationCard } from "./types";
import type { ScheduleDragItem } from "./ScheduleCard";

export interface EmptySlotTarget {
  dayIndex: number;
  timeSlot: string;
}
export default function EmptySlot({
  dayIndex,
  timeSlot,
  onAddRecommendation,
  onMoveSchedule,
}: {
  dayIndex: number;
  timeSlot: string;
  onAddRecommendation: (
    target: EmptySlotTarget,
    card: RecommendationCard,
  ) => void;
  onMoveSchedule: (source: ScheduleDragItem, target: EmptySlotTarget) => void;
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
          | ScheduleDragItem;

        if (payload.type === "recommendation") {
          onAddRecommendation(target, payload.card);
          return;
        }

        if (payload.type === "schedule") {
          onMoveSchedule(payload, target);
        }
      }}
      className={`flex min-h-[92px] items-center justify-center rounded-xl border border-dashed text-label-sm font-semibold transition ${
        isDragOver
          ? "border-primary bg-primary/5 text-primary"
          : "border-outline-variant/80 bg-surface-container-low text-on-surface-variant"
      }`}
    >
      비어 있음
    </div>
  );
}
