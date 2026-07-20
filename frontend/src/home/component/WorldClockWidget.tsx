import { useEffect, useState } from "react";

interface CityClock {
  city: string;
  flag: string;
  timezone: string;
}

// 환율 위젯과 짝을 맞춰, 여행지로 자주 찾는 도시 위주의 현지 시각을 보여준다.
const CLOCKS: CityClock[] = [
  { city: "서울", flag: "🇰🇷", timezone: "Asia/Seoul" },
  { city: "도쿄", flag: "🇯🇵", timezone: "Asia/Tokyo" },
  { city: "방콕", flag: "🇹🇭", timezone: "Asia/Bangkok" },
  { city: "뉴욕", flag: "🇺🇸", timezone: "America/New_York" },
  { city: "로스앤젤레스", flag: "🇺🇸", timezone: "America/Los_Angeles" },
  { city: "런던", flag: "🇬🇧", timezone: "Europe/London" },
  { city: "파리", flag: "🇫🇷", timezone: "Europe/Paris" },
  { city: "시드니", flag: "🇦🇺", timezone: "Australia/Sydney" },
];

function formatTime(now: Date, timezone: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  } catch {
    return "-";
  }
}

function isDaytime(now: Date, timezone: string) {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(now)
    );
    return hour >= 6 && hour < 18;
  } catch {
    return true;
  }
}

/**
 * 세계 시각 위젯 — 홈 화면에서 환율 위젯과 나란히 배치.
 * 1분마다 자동으로 갱신되고, 낮/밤에 따라 아이콘이 바뀐다.
 */
export default function WorldClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="card-tint-secondary p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">지금, 그곳의 시각</h2>
        <span className="text-label-sm text-on-surface-variant">1분마다 자동 갱신</span>
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {CLOCKS.map(({ city, flag, timezone }) => (
          <li
            key={timezone}
            className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg bg-surface-container-lowest/60"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{flag}</span>
              <p className="text-body-sm font-semibold truncate">{city}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-base text-on-surface-variant">
                {isDaytime(now, timezone) ? "light_mode" : "bedtime"}
              </span>
              <p className="text-body-sm font-bold">{formatTime(now, timezone)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
