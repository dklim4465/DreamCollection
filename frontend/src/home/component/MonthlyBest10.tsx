import { useQuery } from "@tanstack/react-query";
import { monthlyDestinationApi } from "@/home/api/monthlyDestinationApi";

/**
 * "이달의 여행지 BEST10" — 캘린더/프로필과 나란히 놓이는 좁은 컬럼용 랭킹 리스트.
 * 관리자가 등록한 이달의 여행지(GET /api/main/monthly-destination)를 표시순서대로 최대 10개 보여줌.
 * 백엔드가 "이번 달" 데이터만 내려주기 때문에 별도 로직 없이도 매달 자동으로 갱신됨.
 */
export default function MonthlyBest10() {
  const { data, isLoading } = useQuery({
    queryKey: ["main", "monthly-destination"],
    queryFn: monthlyDestinationApi.getCurrentMonth,
    retry: false,
  });

  // 💡 [수정] 백엔드 데이터에서 'destinationName' 기준으로 중복을 제거한 후 상위 10개만 자릅니다.
  const rawItems = data?.data?.data ?? [];
  const uniqueItems = rawItems.filter(
    (item, index, self) =>
      self.findIndex((t) => t.destinationName === item.destinationName) === index
  );
  const items = uniqueItems.slice(0, 10);

  // 💡 [추가] 렌더링 에러 방지를 위해 변수를 다시 정상적으로 정의합니다.
  const currentMonth = new Date().getMonth() + 1;

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">{currentMonth}월 여행지 BEST 10</h2>
        <span className="material-symbols-outlined text-tertiary text-xl">trending_up</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">explore</span>
          <p className="text-label-sm">이달의 추천 여행지가 곧 업데이트돼요</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 overflow-y-auto max-h-80">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={item.linkUrl ?? undefined}
                target={item.linkUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                <span
                  className={`w-6 text-center text-label-md font-bold shrink-0 ${
                    i < 3 ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-low">
                  <img
                    src={item.imageUrl}
                    alt={item.destinationName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold truncate">{item.destinationName}</p>
                  <p className="text-label-sm text-on-surface-variant truncate">{item.title}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}