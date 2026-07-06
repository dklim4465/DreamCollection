import type { PlanRequest, TripRecommendation } from "@/api/trip";
import ScheduleItemRow from "./ScheduleItemRow";

interface Props {
  conditions: PlanRequest;
  recommendation: TripRecommendation;
  onChangeRecommendation: (next: TripRecommendation) => void;
  onBack: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

/**
 * recommend API 결과를 "한 화면"으로 보여주는 컴포넌트
 *
 * [상단] title, summary, 선택했던 조건 칩
 * [본문] card-base 하나 안에
 *        - 1일차 라벨
 *        - 그날 items → ScheduleItemRow
 *        - 2일차 라벨
 *        - ...
 * [하단] 다시 선택 / 저장
 */
export default function TripScheduleView({
  conditions,
  recommendation,
  onChangeRecommendation,
  onBack,
  onSave,
  isSaving = false,
}: Props) {
  /** dayIndex, itemIndex, optionIndex 로 selectedOptionIndex 갱신 */
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
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      {/* ── 요약 ── */}
      <section className="card-base p-stack-lg">
        <p className="text-label-md text-primary font-semibold mb-1">
          AI 추천 일정
        </p>
        <h2 className="text-headline-md font-bold">{recommendation.title}</h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          {recommendation.summary}
        </p>

        <div className="flex flex-wrap gap-stack-sm mt-stack-md">
          {Object.values(conditions).map((value) => (
            <span
              key={value}
              className="chip bg-surface-container-low text-on-surface"
            >
              {value}
            </span>
          ))}
        </div>
      </section>

      {/* ── 전체 일정 (한 카드, 스크롤 가능) ── */}
      <section className="card-base p-stack-lg">
        <div className="flex items-center gap-stack-sm mb-stack-md">
          <span className="material-symbols-outlined text-primary">
            event_note
          </span>
          <h3 className="text-headline-sm font-bold">전체 일정</h3>
        </div>

        <div className="flex flex-col gap-stack-lg">
          {recommendation.days.map((day, dayIndex) => (
            <div key={day.dayNumber}>
              {/* 일차 구분 — 큰 카드 아님, 라벨만 */}
              <div className="flex items-center gap-stack-sm mb-stack-sm">
                <span className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-label-md font-bold shrink-0">
                  {day.dayNumber}
                </span>
                <p className="text-label-md font-semibold text-on-surface-variant">
                  {day.dayTitle}
                </p>
              </div>

              <ul className="pl-2">
                {day.items.map((item, itemIndex) => (
                  <ScheduleItemRow
                    key={item.itemKey}
                    item={item}
                    onSelectOption={(optionIndex) =>
                      handleSelectOption(dayIndex, itemIndex, optionIndex)
                    }
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── 하단 버튼 ── */}
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
          {isSaving
            ? "저장 중..."
            : onSave
              ? "이 일정 저장하기"
              : "저장 (다음 단계)"}
        </button>
      </div>
    </div>
  );
}
