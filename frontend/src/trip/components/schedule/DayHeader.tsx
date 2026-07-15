import type { DayPlan } from "@/trip/api/trip";

interface Props {
  day: DayPlan;
}

export default function DayHeader({ day }: Props) {
  return (
    <div className="border-r border-outline-variant/50 bg-surface-container-lowest px-2 py-3 text-center">
      <p className="text-label-md font-extrabold text-primary">
        DAY {day.dayNumber}
      </p>
      <p className="mt-0.5 truncate text-label-sm font-bold text-on-surface-variant">
        {day.dayTitle}
      </p>
    </div>
  );
}
