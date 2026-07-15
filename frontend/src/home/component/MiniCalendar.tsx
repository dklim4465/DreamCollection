import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { tripApi } from "@/trip/api/trip";
import { useAuthStore } from "@/auth/store/authStore";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 시작페이지에 노출되는 미니 캘린더.
 * 로그인 상태에서는 "내가 저장한 여행" 중 가장 가까운 미래 startDate를 찾아
 * D-day 뱃지로 보여주고, 해당 날짜를 달력에 하이라이트한다.
 */
export default function MiniCalendar() {
  const [current, setCurrent] = useState<Dayjs>(dayjs());
  const { isAuthenticated } = useAuthStore();

  const { data: trips } = useQuery({
    queryKey: ["trip", "saved", "dday"],
    queryFn: tripApi.getSavedTrips,
    enabled: isAuthenticated,
    retry: false,
  });

  const today = dayjs().startOf("day");

  // 오늘 이후로 등록된 일정 중 가장 가까운 것 하나 (D-day 카운트다운 대상)
  const upcomingTrip = (trips ?? [])
    .filter((t) => t.startDate && !dayjs(t.startDate).isBefore(today, "day"))
    .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))[0];

  const dDay = upcomingTrip
    ? dayjs(upcomingTrip.startDate).startOf("day").diff(today, "day")
    : null;

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

      {upcomingTrip && dDay !== null && (
        <Link
          to="/trip/saved"
          className="flex items-center justify-between gap-2 rounded-xl bg-primary-container px-3.5 py-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="text-body-sm font-semibold text-on-primary-container line-clamp-1">
            {upcomingTrip.title || upcomingTrip.region || "다가오는 여행"}
          </span>
          <span className="shrink-0 text-label-md font-bold text-primary">
            {dDay === 0 ? "D-DAY" : `D-${dDay}`}
          </span>
        </Link>
      )}

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
          const isUpcomingTripDay =
            date && upcomingTrip?.startDate
              ? date.isSame(dayjs(upcomingTrip.startDate), "day")
              : false;
          return (
            <div key={i} className="py-1.5 flex items-center justify-center">
              {date && (
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                    isToday
                      ? "bg-primary text-on-primary"
                      : isUpcomingTripDay
                        ? "ring-2 ring-primary text-primary"
                        : ""
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
