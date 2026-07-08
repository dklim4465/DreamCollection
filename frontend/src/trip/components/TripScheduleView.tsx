import { useState } from "react";
import type { PlanRequest, TripRecommendation } from "@/trip/api/trip";
import TripOptionModal from "./TripOptionModal";

interface Props {
  conditions: PlanRequest;
  recommendation: TripRecommendation;
  onChangeRecommendation: (next: TripRecommendation) => void;
  onBack: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hideActions?: boolean;
}

interface EditingTarget {
  dayIndex: number;
  itemIndex: number;
}

const TIME_SLOT_LABEL: Record<string, string> = {
  Morning: "오전",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
};

export default function TripScheduleView({
  recommendation,
  onChangeRecommendation,
  onBack,
  onSave,
  isSaving = false,
  hideActions = false,
}: Props) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(
    null,
  );

  const currentDay = recommendation.days[currentDayIndex];
  const hasPrevDay = currentDayIndex > 0;
  const hasNextDay = currentDayIndex < recommendation.days.length - 1;

  const handleSelectOption = (
    dayIndex: number,
    itemIndex: number,
    optionIndex: number,
  ) => {
    const nextDays = recommendation.days.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      return {
        ...day,
        items: day.items.map((item, iIdx) =>
          iIdx === itemIndex
            ? { ...item, selectedOptionIndex: optionIndex }
            : item,
        ),
      };
    });

    onChangeRecommendation({ ...recommendation, days: nextDays });
    setEditingTarget(null);
  };

  const editingDay =
    editingTarget !== null ? recommendation.days[editingTarget.dayIndex] : null;

  const editingItem =
    editingDay && editingTarget !== null
      ? editingDay.items[editingTarget.itemIndex]
      : null;

  return (
    <div className="flex flex-col gap-stack-lg">
      <section className="card-base overflow-hidden">
        <div className="p-stack-lg">
          <div className="flex items-center justify-between gap-stack-md">
            {/* 이전일차로 돌아가는 버튼 */}
            <button
              type="button"
              onClick={() => setCurrentDayIndex((prev) => prev - 1)}
              disabled={!hasPrevDay}
              className="hidden md:flex w-12 h-12 rounded-full border border-outline-variant items-center justify-center disabled:opacity-30 hover:bg-surface-container transition-colors"
              aria-label="이전 일차"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {/* 여기서 부터는 일정을 보여주는 한칸 */}
            <section className="flex-1 max-w-4xl mx-auto border border-outline-variant rounded-2xl p-stack-lg min-h-[420px]">
              <h3 className="text-headline-sm font-bold text-center mb-stack-md">
                {currentDay.dayTitle}
              </h3>

              <div className="flex flex-col gap-stack-sm">
                {currentDay.items.map((item, itemIndex) => {
                  const selectedPlace = item.options[item.selectedOptionIndex];

                  return (
                    <article
                      key={item.itemKey}
                      className="border border-outline-variant rounded-xl p-stack-md flex items-center gap-stack-md"
                    >
                      <div className="w-24 h-24 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl">
                          {item.itemType === "Meal"
                            ? "restaurant"
                            : "location_on"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-label-md text-on-surface-variant">
                          {TIME_SLOT_LABEL[item.timeSlot] ?? item.timeSlot} 일정
                        </p>

                        <h4 className="text-headline-sm font-bold mt-1 truncate">
                          {selectedPlace?.placeName ?? item.title}
                        </h4>

                        <p className="text-body-md text-on-surface-variant mt-2 line-clamp-2">
                          {selectedPlace?.description ??
                            "추천 일정 설명이 없습니다."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingTarget({
                            dayIndex: currentDayIndex,
                            itemIndex,
                          })
                        }
                        className="btn-ghost shrink-0"
                      >
                        일정 변경
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
            {/* 여기까지가 일정 보여주는 한칸 */}

            {/* 다음일차 보여주는 버튼 */}
            <button
              type="button"
              onClick={() => setCurrentDayIndex((prev) => prev + 1)}
              disabled={!hasNextDay}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center disabled:opacity-30 hover:bg-surface-container transition-colors"
              aria-label="다음 일차"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* 맨 아래쪽 버튼 두개 */}
      {!hideActions && (
        <div className="flex flex-col sm:flex-row gap-stack-sm">
          <button type="button" onClick={onBack} className="btn-ghost flex-1">
            조건 다시 선택
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!onSave || isSaving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "이 일정 저장하기"}
          </button>
        </div>
      )}

      {editingDay && editingItem && editingTarget && (
        <TripOptionModal
          day={editingDay}
          item={editingItem}
          onClose={() => setEditingTarget(null)}
          onSelect={(optionIndex) =>
            handleSelectOption(
              editingTarget.dayIndex,
              editingTarget.itemIndex,
              optionIndex,
            )
          }
        />
      )}
    </div>
  );
}
