import type { PlanRequest } from "@/trip/api/trip";

interface Props {
  conditions: PlanRequest;
  startDate: string;
  expanded: boolean;
  disabled?: boolean;
  onStartDateChange: (startDate: string) => void;
  onToggleConditions: () => void;
}

export default function TripConditionSummaryBar({
  conditions,
  startDate,
  expanded,
  disabled = false,
  onStartDateChange,
  onToggleConditions,
}: Props) {
  return (
    <section className="trip-surface p-stack-md">
      <div className="grid gap-stack-md lg:grid-cols-[240px_1fr_auto] lg:items-center">
        <label className="block">
          <span className="mb-2 block text-label-md font-bold text-on-surface">
            출발일 선택
          </span>

          <span className="relative block">
            <input
              type="date"
              value={startDate}
              disabled={disabled}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/70 bg-surface-container-low px-4 py-3 text-label-md font-bold text-on-surface outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </span>
        </label>

        <div className="grid gap-stack-sm rounded-xl bg-surface-container-low px-stack-md py-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryItem label="누구와" value={conditions.who} />

          <SummaryItem label="여행 기간" value={conditions.when} />

          <SummaryItem
            label="지역"
            value={`${conditions.region} · ${
              conditions.destination ?? conditions.region
            }`}
          />

          <SummaryItem label="테마" value={conditions.theme} />

          <SummaryItem label="여행 스타일" value={conditions.level} />
        </div>

        <button
          type="button"
          onClick={onToggleConditions}
          disabled={disabled}
          className="btn-ghost whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
          aria-expanded={expanded}
        >
          <span className="material-symbols-outlined mr-2 align-[-5px] text-[18px]">
            {expanded ? "expand_less" : "refresh"}
          </span>
          {expanded ? "조건 접기" : "다시 선택하기"}
        </button>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant"></span>

      <span className="min-w-0">
        <span className="block text-label-sm font-bold text-on-surface-variant">
          {label}
        </span>

        <span className="block truncate text-label-md font-bold text-on-surface">
          {value || "미선택"}
        </span>
      </span>
    </div>
  );
}
