import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface CurrencyInfo {
  country: string;
  currency: string;
  flag: string;
  /** 일부 통화(엔화 등)는 100단위로 표기하는 게 관례라 배수를 둠 */
  unit: number;
}

const CURRENCIES: CurrencyInfo[] = [
  { country: "미국", currency: "USD", flag: "🇺🇸", unit: 1 },
  { country: "일본", currency: "JPY", flag: "🇯🇵", unit: 100 },
  { country: "유럽", currency: "EUR", flag: "🇪🇺", unit: 1 },
  { country: "태국", currency: "THB", flag: "🇹🇭", unit: 1 },
];

interface ExchangeRateApiResponse {
  result: string;
  rates: Record<string, number>; // KRW 1원 기준 각 통화 환산값 (예: rates.USD = 0.00072)
  time_last_update_utc: string;
}

// 무료 공개 API (키 불필요, CORS 허용) — https://www.exchangerate-api.com/docs/free
async function fetchRates(): Promise<ExchangeRateApiResponse> {
  const res = await fetch("https://open.er-api.com/v6/latest/KRW");
  if (!res.ok) throw new Error("환율 정보를 불러오지 못했습니다");
  const json = await res.json();
  if (json.result !== "success") throw new Error("환율 정보를 불러오지 못했습니다");
  return json;
}

/**
 * 자주 가는 여행지 통화 환율 위젯 — 실시간(1분 간격 자동 갱신) API 연동.
 * KRW 기준 환율을 가져와서 "외화 1(또는 100)단위 = 몇 원"으로 환산해 보여준다.
 * 직전 조회값과 비교해 등락률을 표시한다 (세션 내에서만 비교 가능, 새로고침 시 리셋).
 */
export default function ExchangeRateWidget() {
  const previousRatesRef = useRef<Record<string, number> | null>(null);
  const [changes, setChanges] = useState<Record<string, number>>({});

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchRates,
    refetchInterval: 60_000, // 1분마다 자동으로 다시 조회
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (!data?.rates) return;
    const prev = previousRatesRef.current;
    if (prev) {
      const nextChanges: Record<string, number> = {};
      CURRENCIES.forEach(({ currency }) => {
        const prevKrw = 1 / prev[currency];
        const currKrw = 1 / data.rates[currency];
        nextChanges[currency] = prevKrw ? ((currKrw - prevKrw) / prevKrw) * 100 : 0;
      });
      setChanges(nextChanges);
    }
    previousRatesRef.current = data.rates;
  }, [data]);

  const lastUpdatedLabel = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">오늘의 환율</h2>
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
          {!isError && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          기준 KRW{lastUpdatedLabel ? ` · ${lastUpdatedLabel} 갱신` : ""}
        </span>
      </div>

      {isError ? (
        <p className="text-body-sm text-on-surface-variant py-4 text-center">
          환율 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {CURRENCIES.map(({ country, currency, flag, unit }) => {
            const perUnitKrw = data ? unit / data.rates[currency] : 0;
            const change = changes[currency];
            return (
              <li
                key={currency}
                className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-none"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{flag}</span>
                  <div>
                    <p className="text-body-md font-semibold leading-tight">
                      {country}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {unit > 1 ? `${currency} (${unit})` : currency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body-md font-bold leading-tight">
                    {perUnitKrw.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}원
                  </p>
                  <p
                    className={`text-label-sm ${
                      change === undefined
                        ? "text-on-surface-variant"
                        : change >= 0
                          ? "text-error"
                          : "text-primary"
                    }`}
                  >
                    {change === undefined
                      ? "-"
                      : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
