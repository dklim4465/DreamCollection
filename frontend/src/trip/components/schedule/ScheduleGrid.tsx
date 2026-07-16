import type { ComponentProps } from "react";
import type { DayPlan } from "@/trip/api/trip";
import { TIME_GROUPS } from "./scheduleUtils";
import DayHeader from "./DayHeader";
import TimeSlotRow from "./TimeSlotRow";

export type { EditingTarget } from "./TimeSlotRow";

type Props = {
  days: DayPlan[];
} & Omit<ComponentProps<typeof TimeSlotRow>, "slot" | "days">;

export default function ScheduleGrid({ days, ...rowProps }: Props) {
  return (
    <section className="trip-surface h-full">
      <div className="border-b border-outline-variant/50 bg-surface-container-lowest px-stack-md py-stack-sm">
        <p className="text-label-md font-semibold text-on-surface-variant">
          드래그를 해서 일정을 조정할 수 있습니다.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[820px]"
          style={{
            gridTemplateColumns: `72px repeat(${days.length}, minmax(195px, 1fr))`,
          }}
        >
          <div className="border-r border-outline-variant/50 bg-surface-container-low" />

          {days.map((day) => (
            <DayHeader key={day.dayNumber} day={day} />
          ))}

          {TIME_GROUPS.map((slot) => (
            <TimeSlotRow key={slot.key} slot={slot} days={days} {...rowProps} />
          ))}
        </div>
      </div>
    </section>
  );
}
