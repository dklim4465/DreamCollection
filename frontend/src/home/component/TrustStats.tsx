import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/home/api/statsApi";

/**
 * 숫자로 보는 Dream Collection — 이미지 없이 아이콘 + 실제 집계 숫자로 신뢰감을 주는 섹션.
 * "지금 인기 있는 여행지"(이미지 카드) 자리를 대체함.
 * 백엔드 GET /api/stats(StatsController)에서 실제 값을 가져온다.
 */
export default function TrustStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.getStats,
    retry: false,
  });

  const stats = data?.data?.data;

  const items = [
    {
      icon: "calendar_month",
      value: stats?.tripCount,
      label: "등록된 여행 일정",
    },
    {
      icon: "groups",
      value: stats?.userCount,
      label: "함께한 여행자",
    },
    {
      icon: "auto_stories",
      value: stats?.travelLogCount,
      label: "작성된 여행일지",
    },
    {
      icon: "public",
      value: stats?.countryCount,
      label: "여행 가능한 국가",
    },
  ];

  return (
    <section>
      <div className="mb-stack-md">
        <p className="text-label-sm font-bold tracking-[0.2em] text-primary mb-1">
          BY THE NUMBERS
        </p>
        <h2 className="text-[28px] md:text-display-lg font-bold leading-tight">
          숫자가 증명하는 신뢰
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((s) => (
          <div
            key={s.label}
            className="card-base p-stack-lg flex flex-col items-start gap-3"
          >
            <span className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-on-primary-container">
                {s.icon}
              </span>
            </span>
            {isLoading ? (
              <div className="h-8 w-20 rounded bg-surface-container-low animate-pulse" />
            ) : (
              <p className="text-[28px] md:text-headline-lg font-black leading-none">
                {(s.value ?? 0).toLocaleString("ko-KR")}
                {s.icon === "public" ? "개국" : "+"}
              </p>
            )}
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
