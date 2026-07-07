import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/common/api/cityApi";
import { proxyImage } from "@/common/utils/proxyImage";

/**
 * 관리자가 등록한 "인기 도시" 마스터 데이터(city 테이블, is_popular=1)를 보여주는 섹션.
 * 일정 생성 화면 자동완성과 같은 데이터 소스라, 여기서 목적지를 클릭하면
 * 바로 그 여행지로 일정을 만들러 이동한다.
 *
 * 이미지: city.imageUrl(Unsplash) → (로딩 실패 시) 회색 플레이스홀더
 */
export default function PopularDestinations() {
  const { data, isLoading } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });

  const cities = data?.data?.data ?? [];

  // 도시별 이미지 로딩 실패 여부만 추적 (실패 시 회색 플레이스홀더로 대체)
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  const markFailed = (cityId: number) => {
    setFailedIds((prev) => (prev.has(cityId) ? prev : new Set(prev).add(cityId)));
  };

  if (!isLoading && cities.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-stack-md">
        <div>
          <p className="text-label-sm font-bold tracking-[0.2em] text-primary mb-1">
            DESTINATIONS
          </p>
          <h2 className="text-[28px] md:text-display-lg font-bold leading-tight">
            지금 인기 있는 여행지
          </h2>
        </div>
        <Link
          to="/trip/new"
          className="text-label-sm text-primary font-bold hover:underline whitespace-nowrap"
        >
          전체 목적지 검색
        </Link>
      </div>

      <div className="grid grid-flow-col auto-cols-[65%] sm:auto-cols-[40%] md:auto-cols-[26%] lg:auto-cols-[22%] overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-1 px-1">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-surface-container-low animate-pulse"
              />
            ))
          : cities.map((city) => {
              const src = failedIds.has(city.id) ? null : proxyImage(city.imageUrl);

              return (
                <Link
                  key={city.id}
                  to={`/trip/new?destination=${encodeURIComponent(city.nameKo)}`}
                  className="group relative h-80 rounded-2xl overflow-hidden traveler-glow"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={city.nameKo}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={() => markFailed(city.id)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-low" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-[11px] uppercase tracking-[0.15em] opacity-70 mb-1">
                      {city.countryName}
                    </p>
                    <p className="text-xl font-bold leading-snug">{city.nameKo}</p>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
