import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { travelPlanApi } from "@/travelPlan/api/travelPlanApi";
import { useAuthStore } from "@/auth/store/authStore";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 시작페이지에 노출되는 미니 캘린더.
 * 로그인한 사용자의 여행 일정 기간에 해당하는 날짜에는 목적지 사진을 작은 원형 썸네일로 표시.
 * "+ 새 일정 추가" 버튼은 바로가기의 "일정" 카드와 동일하게 일정 도메인(/plan)으로 연결됨
 * (목록은 /plan, 새로 만들기는 /plan/new).
 */
export default function MiniCalendar() {
  const [current, setCurrent] = useState<Dayjs>(dayjs());
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["travelPlan", "myPlans"],
    queryFn: travelPlanApi.getMyPlans,
    enabled: isAuthenticated,
    retry: false,
  });

  const plans = data?.data?.data ?? [];

  // 날짜(YYYY-MM-DD) → 목적지 썸네일 이미지 맵 (해당 날짜가 포함된 일정 중 첫 번째 것 사용)
  const thumbnailByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const plan of plans) {
      const img = plan.city?.imageUrl;
      if (!img) continue;
      let d = dayjs(plan.startDate);
      const end = dayjs(plan.endDate);
      while (d.isBefore(end) || d.isSame(end, "day")) {
        const key = d.format("YYYY-MM-DD");
        if (!map.has(key)) map.set(key, img);
        d = d.add(1, "day");
      }
    }
    return map;
  }, [plans]);

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
          const thumbnail = date ? thumbnailByDate.get(date.format("YYYY-MM-DD")) : undefined;
          const isToday = date?.isSame(today, "day");
          return (
            <div key={i} className="py-1.5 flex items-center justify-center">
              {date && (
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold bg-cover bg-center ${
                    thumbnail
                      ? "text-white"
                      : isToday
                        ? "bg-primary text-on-primary"
                        : ""
                  } ${isToday && thumbnail ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
                >
                  <span className={thumbnail ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : ""}>
                    {date.date()}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/plan/new" className="btn-ghost text-sm text-center mt-1">
        + 일정 추가하기
      </Link>
    </section>
  );
}
