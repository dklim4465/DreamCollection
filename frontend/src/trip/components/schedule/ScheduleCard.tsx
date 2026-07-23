import type { ScheduleItem } from "@/trip/api/trip";
import type { RecommendationCard } from "./types";
import {
  resolveScheduleBadge,
  isAccommodationItem,
  isFlightItem,
  isLockedSlotItem,
  canMoveScheduleItem,
} from "./scheduleUtils";

export interface ScheduleDragItem {
  type: "schedule";
  dayIndex: number;
  itemIndex: number;
}
export default function ScheduleCard({
  item,
  isDragOver,
  onDragOverChange,
  onEdit,
  onRemove,
  onReplace,
  dayIndex,
  itemIndex,
  onSwap,
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
}) {
  const isLockedSlot = isLockedSlotItem(item);
  const badge = isLockedSlot
    ? {
        label: "잠금",
        className: "bg-surface-container-highest text-on-surface-variant",
      }
    : resolveScheduleBadge(item);
  const isMeal =
    item.itemType === "Meal" ||
    item.placeCategory === "RESTAURANT" ||
    item.placeCategory === "CAFE";
  const isAccommodation = isAccommodationItem(item);
  const isFlight = isFlightItem(item);
  const canMove = canMoveScheduleItem(item);

  if (isLockedSlot) {
    return (
      <article
        className="min-h-[92px] rounded-xl border border-transparent bg-surface-container-lowest/20"
        aria-label="항공 일정으로 비워둔 시간대"
      />
    );
  }

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
          | ScheduleDragItem;

        if (payload.type === "recommendation") {
          onReplace(payload.card);
          return;
        }

        if (payload.type === "schedule") {
          onSwap(payload);
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
      className={`group flex min-h-[92px] items-center gap-3 rounded-xl border p-3 transition ${
        isDragOver
          ? "border-dashed border-primary bg-primary/5"
          : isLockedSlot
            ? "border-outline-variant/30 bg-surface-container-high opacity-60 shadow-none"
            : isFlight
              ? "border-primary/30 bg-surface-container-lowest shadow-glow"
              : canMove
                ? "border-outline-variant/70 bg-surface-container-lowest shadow-glow hover:border-primary/50"
                : "border-outline-variant/50 bg-surface-container-low shadow-none"
      }`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div
          className={
            isLockedSlot
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-on-surface-variant"
              : isFlight
                ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                : "flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-container text-on-surface-variant"
          }
        >
          <span className="material-symbols-outlined text-[26px]">
            {isLockedSlot
              ? "block"
              : isFlight
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
            className={`shrink-0 rounded-sm px-1.5 py-0.5 text-label-sm font-bold ${badge.className}`}
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
        {!isLockedSlot && (
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
        )}
      </div>
    </article>
  );
}
