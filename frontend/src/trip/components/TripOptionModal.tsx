import type { DayPlan, ScheduleItem } from "@/trip/api/trip";

interface Props {
  day: DayPlan;
  item: ScheduleItem;
  onClose: () => void;
}

const TIME_SLOT_LABEL: Record<string, string> = {
  Morning: "아침",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
  Night: "야간",
};

const ITEM_META: Record<string, { label: string; icon: string }> = {
  Activity: { label: "관광", icon: "location_on" },
  Meal: { label: "식사", icon: "restaurant" },
  Experience: { label: "체험", icon: "local_activity" },
  Flight: { label: "항공", icon: "flight" },
  Accommodation: { label: "숙소", icon: "hotel" },
  Hotel: { label: "숙소", icon: "hotel" },
};

const formatCost = (cost: number | undefined) => {
  if (cost === undefined || cost === null) return null;
  return `${cost.toLocaleString()}원`;
};

export default function TripOptionModal({ day, item, onClose }: Props) {
  const meta = ITEM_META[item.itemType] ?? {
    label: item.itemType,
    icon: "location_on",
  };
  const timeLabel = TIME_SLOT_LABEL[item.timeSlot] ?? item.timeSlot;
  const cost = formatCost(item.estimatedCost);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center">
      <section className="w-full max-w-3xl overflow-hidden rounded-2xl bg-surface-container-lowest traveler-glow">
        <div className="border-b border-outline-variant p-stack-lg">
          <div className="flex items-start justify-between gap-stack-md">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-stack-sm">
                <span className="chip-primary">
                  {day.dayTitle} · {timeLabel}
                </span>
                <span className="chip bg-surface-container text-on-surface-variant">
                  {meta.label}
                </span>
                {item.locked && (
                  <span className="chip bg-surface-container text-on-surface-variant">
                    고정 일정
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-headline-md font-bold text-on-surface">
                {item.title}
              </h2>
              <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
                {item.description ?? "상세 설명이 아직 없습니다."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-container"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-stack-lg">
          <div className="grid gap-stack-md md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl bg-primary-container text-on-primary-container">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full min-h-[180px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[180px] flex-col justify-between p-stack-md">
                  <span className="material-symbols-outlined text-[36px]">
                    {meta.icon}
                  </span>
                  <div>
                    <p className="text-label-md font-bold">현재 일정</p>
                    <p className="mt-1 text-label-sm opacity-80">
                      {timeLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-outline-variant/70 p-stack-md">
              <dl className="grid gap-stack-sm text-label-md">
                <DetailRow label="일자" value={day.dayTitle} />
                <DetailRow label="시간대" value={timeLabel} />
                <DetailRow label="구분" value={meta.label} />
                {item.address && <DetailRow label="주소" value={item.address} />}
                {item.durationMinutes !== undefined && (
                  <DetailRow
                    label="소요 시간"
                    value={`${item.durationMinutes}분`}
                  />
                )}
                {cost && <DetailRow label="예상 비용" value={cost} />}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-stack-md">
      <dt className="shrink-0 text-on-surface-variant">{label}</dt>
      <dd className="text-right font-bold text-on-surface">{value}</dd>
    </div>
  );
}
