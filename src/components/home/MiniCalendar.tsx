import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 시작페이지에 노출되는 미니 캘린더
 * TODO: 실제 여행 일정(TravelPlan) 데이터와 연동하여 일정 있는 날짜에 표시(dot) 추가
 */
export default function MiniCalendar() {
  const [current, setCurrent] = useState<Dayjs>(dayjs());

  const startOfMonth = current.startOf("month");
  const endOfMonth = current.endOf("month");
  const startOffset = startOfMonth.day(); // 0 (일) ~ 6 (토)
  const daysInMonth = endOfMonth.date();

  const cells: (Dayjs | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      startOfMonth.add(i, "day"),
    ),
  ];

  const today = dayjs();

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">
          {current.format("YYYY년 M월")}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrent(current.subtract(1, "month"))}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => setCurrent(current.add(1, "month"))}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-label-sm text-on-surface-variant">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-body-sm">
        {cells.map((date, i) => (
          <div key={i} className="py-1.5 flex items-center justify-center">
            {date && (
              <span
                className={
                  date.isSame(today, "day")
                    ? "w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold"
                    : "w-7 h-7 flex items-center justify-center"
                }
              >
                {date.date()}
              </span>
            )}
          </div>
        ))}
      </div>

      <Link to="/plan" className="btn-ghost text-sm text-center mt-1">
        + 새 일정 추가
      </Link>
    </section>
  );
}
