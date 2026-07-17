import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/home/api/statsApi";

/**
 * 함께 쌓아온 여행의 기록 — 이미지 없이 아이콘 + 실제 집계 숫자로 신뢰감을 주는 섹션.
 * 로그인 여부와 무관하게 항상 노출됨(백엔드 GET /api/stats는 SecurityConfig의
 * PUBLIC_URLS에 포함된 공개 API — isAuthenticated 체크를 아예 안 함).
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
      // "이 앱을 쓰는 모든 사람"의 활동을 보여주는 지표 — 지금까지 지급된 뱃지 총합
      icon: "military_tech",
      value: stats?.badgeEarnedCount,
      label: "지급된 여행 뱃지",
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
          OUR COMMUNITY
        </p>
        <h2 className="text-[28px] md:text-display-lg font-bold leading-tight">
          함께 쌓아온 여행의 기록
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((s, i) => {
          const tint = ["card-tint-primary", "card-tint-secondary", "card-tint-tertiary"][i % 3];
          const iconBg = ["bg-primary-container", "bg-secondary-container", "bg-tertiary-container"][i % 3];
          const iconColor = [
            "text-on-primary-container",
            "text-on-secondary-container",
            "text-on-tertiary-container",
          ][i % 3];
          return (
            <div key={s.label} className={`${tint} p-stack-lg flex flex-col items-start gap-3`}>
              <span className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{s.icon}</span>
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
          );
        })}
      </div>
    </section>
  );
}
