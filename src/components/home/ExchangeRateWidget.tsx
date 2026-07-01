// TODO: 실제 환율 API(예: 한국수출입은행, exchangerate.host) 연동으로 교체
const EXCHANGE_RATES = [
  { country: "미국", currency: "USD", flag: "🇺🇸", rate: 1389.5, change: +0.4 },
  { country: "일본", currency: "JPY", flag: "🇯🇵", rate: 905.2, change: -0.2 },
  { country: "유럽", currency: "EUR", flag: "🇪🇺", rate: 1502.8, change: +0.1 },
  { country: "태국", currency: "THB", flag: "🇹🇭", rate: 38.7, change: -0.5 },
];

/**
 * 자주 가는 여행지 통화 환율 위젯
 * TODO: 실시간 환율 API 연동, 100엔/100바트 등 단위 표기 보완
 */
export default function ExchangeRateWidget() {
  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">오늘의 환율</h2>
        <span className="text-label-sm text-on-surface-variant">기준 KRW</span>
      </div>

      <ul className="flex flex-col gap-1">
        {EXCHANGE_RATES.map((rate) => (
          <li
            key={rate.currency}
            className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{rate.flag}</span>
              <div>
                <p className="text-body-md font-semibold leading-tight">
                  {rate.country}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {rate.currency}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-body-md font-bold leading-tight">
                {rate.rate.toLocaleString("ko-KR", {
                  maximumFractionDigits: 1,
                })}
                원
              </p>
              <p
                className={`text-label-sm ${rate.change >= 0 ? "text-error" : "text-primary"}`}
              >
                {rate.change >= 0 ? "▲" : "▼"} {Math.abs(rate.change)}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
