import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface CurrencyInfo {
  country: string;
  currency: string;
  flag: string;
  /** 일부 통화(엔화, 동, 루피아 등)는 100/1000단위로 표기하는 게 관례라 배수를 둠 */
  unit: number;
}

// 여행지로 자주 찾는 국가 위주로 대폭 확장 (아시아/유럽/아메리카/오세아니아/중동 등)
const CURRENCIES: CurrencyInfo[] = [
  { country: "미국", currency: "USD", flag: "🇺🇸", unit: 1 },
  { country: "일본", currency: "JPY", flag: "🇯🇵", unit: 100 },
  { country: "유럽", currency: "EUR", flag: "🇪🇺", unit: 1 },
  { country: "영국", currency: "GBP", flag: "🇬🇧", unit: 1 },
  { country: "중국", currency: "CNY", flag: "🇨🇳", unit: 1 },
  { country: "홍콩", currency: "HKD", flag: "🇭🇰", unit: 1 },
  { country: "대만", currency: "TWD", flag: "🇹🇼", unit: 1 },
  { country: "태국", currency: "THB", flag: "🇹🇭", unit: 1 },
  { country: "베트남", currency: "VND", flag: "🇻🇳", unit: 1000 },
  { country: "필리핀", currency: "PHP", flag: "🇵🇭", unit: 1 },
  { country: "싱가포르", currency: "SGD", flag: "🇸🇬", unit: 1 },
  { country: "말레이시아", currency: "MYR", flag: "🇲🇾", unit: 1 },
  { country: "인도네시아", currency: "IDR", flag: "🇮🇩", unit: 1000 },
  { country: "인도", currency: "INR", flag: "🇮🇳", unit: 1 },
  { country: "캐나다", currency: "CAD", flag: "🇨🇦", unit: 1 },
  { country: "호주", currency: "AUD", flag: "🇦🇺", unit: 1 },
  { country: "뉴질랜드", currency: "NZD", flag: "🇳🇿", unit: 1 },
  { country: "스위스", currency: "CHF", flag: "🇨🇭", unit: 1 },
  { country: "튀르키예", currency: "TRY", flag: "🇹🇷", unit: 1 },
  { country: "아랍에미리트", currency: "AED", flag: "🇦🇪", unit: 1 },
  { country: "사우디아라비아", currency: "SAR", flag: "🇸🇦", unit: 1 },
  { country: "이스라엘", currency: "ILS", flag: "🇮🇱", unit: 1 },
  { country: "카타르", currency: "QAR", flag: "🇶🇦", unit: 1 },
  { country: "괌·미국령", currency: "USD", flag: "🇬🇺", unit: 1 },
  { country: "멕시코", currency: "MXN", flag: "🇲🇽", unit: 1 },
  { country: "브라질", currency: "BRL", flag: "🇧🇷", unit: 1 },
  { country: "아르헨티나", currency: "ARS", flag: "🇦🇷", unit: 1 },
  { country: "러시아", currency: "RUB", flag: "🇷🇺", unit: 1 },
  { country: "스웨덴", currency: "SEK", flag: "🇸🇪", unit: 1 },
  { country: "노르웨이", currency: "NOK", flag: "🇳🇴", unit: 1 },
  { country: "덴마크", currency: "DKK", flag: "🇩🇰", unit: 1 },
  { country: "폴란드", currency: "PLN", flag: "🇵🇱", unit: 1 },
  { country: "체코", currency: "CZK", flag: "🇨🇿", unit: 1 },
  { country: "헝가리", currency: "HUF", flag: "🇭🇺", unit: 100 },
  { country: "이집트", currency: "EGP", flag: "🇪🇬", unit: 1 },
  { country: "남아프리카공화국", currency: "ZAR", flag: "🇿🇦", unit: 1 },
  { country: "몽골", currency: "MNT", flag: "🇲🇳", unit: 1000 },
  { country: "네팔", currency: "NPR", flag: "🇳🇵", unit: 1 },
  { country: "스리랑카", currency: "LKR", flag: "🇱🇰", unit: 1 },
  { country: "캄보디아", currency: "KHR", flag: "🇰🇭", unit: 1000 },
  { country: "라오스", currency: "LAK", flag: "🇱🇦", unit: 1000 },
  { country: "피지", currency: "FJD", flag: "🇫🇯", unit: 1 },
  { country: "모로코", currency: "MAD", flag: "🇲🇦", unit: 1 },
  { country: "쿠웨이트", currency: "KWD", flag: "🇰🇼", unit: 1 },
  { country: "요르단", currency: "JOD", flag: "🇯🇴", unit: 1 },
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
 * 세계 각국 통화 환율 위젯 — 실시간(1시간 간격 자동 갱신) API 연동.
 * KRW 기준 환율을 가져와서 "외화 1(또는 100/1000)단위 = 몇 원"으로 환산해 보여준다.
 * 직전 조회값과 비교해 등락률을 표시한다 (세션 내에서만 비교 가능, 새로고침 시 리셋).
 * 국가 수가 많아져서(40개+) 검색으로 좁혀볼 수 있게 하고, 리스트는 스크롤 처리.
 */
export default function ExchangeRateWidget() {
  const previousRatesRef = useRef<Record<string, number> | null>(null);
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [keyword, setKeyword] = useState("");

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchRates,
    refetchInterval: 60 * 60 * 1000, // 1시간마다 자동으로 다시 조회
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

  const filtered = CURRENCIES.filter(
    ({ country, currency }) =>
      country.includes(keyword) || currency.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <section className="card-tint-primary p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">오늘의 환율</h2>
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
          {!isError && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          기준 KRW{lastUpdatedLabel ? ` · ${lastUpdatedLabel} 갱신 (1시간마다 자동)` : ""}
        </span>
      </div>

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="국가 또는 통화코드 검색 (예: 일본, JPY)"
        className="input-base text-body-sm"
      />

      {isError ? (
        <p className="text-body-sm text-on-surface-variant py-4 text-center">
          환율 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant py-6 text-center">
          "{keyword}"에 해당하는 국가/통화가 없어요
        </p>
      ) : (
        <ul className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
          {filtered.map(({ country, currency, flag, unit }, i) => {
            const rate = data?.rates[currency];
            if (rate === undefined) return null; // API가 해당 통화를 안 내려주는 경우 방어
            const perUnitKrw = unit / rate;
            const change = changes[currency];
            return (
              <li
                key={`${currency}-${i}`}
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