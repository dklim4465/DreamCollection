import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 시작페이지에 노출되는 미니 캘린더.
 * (여행 일정/여행계획 연동 기능은 이번 병합에서 제외됨 — 담당자가 별도로 연결 예정)
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
    <section className="card-base p-stack-lg flex flex-col gap-stack-md h-full">
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
        {cells.map((date, i) => {
          const isToday = date?.isSame(today, "day");
          return (
            <div key={i} className="py-1.5 flex items-center justify-center">
              {date && (
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                    isToday ? "bg-primary text-on-primary" : ""
                  }`}
                >
                  {date.date()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/trip" className="btn-ghost text-sm text-center mt-1">
        + 여행 계획하러 가기
      </Link>
    </section>
  );
}
