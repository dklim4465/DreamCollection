import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/common/api/cityApi";

/**
 * 관리자가 등록한 "인기 도시" 마스터 데이터(city 테이블, is_popular=1)를 보여주는 섹션.
 * 일정 생성 화면 자동완성과 같은 데이터 소스라, 여기서 목적지를 클릭하면
 * 바로 그 여행지로 일정을 만들러 이동한다.
 */
export default function PopularDestinations() {
  const { data, isLoading } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });

  const cities = data?.data?.data ?? [];

  if (!isLoading && cities.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-stack-md">
        <h2 className="text-headline-md font-bold">지금 인기 있는 여행지</h2>
        <Link to="/plan/new" className="text-label-sm text-primary font-bold hover:underline">
          전체 목적지 검색
        </Link>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-1 px-1">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-32 h-40 shrink-0 rounded-2xl bg-surface-container-low animate-pulse" />
            ))
          : cities.map((city) => (
              <Link
                key={city.id}
                to={`/plan/new?destination=${encodeURIComponent(city.nameKo)}`}
                className="group relative w-32 h-40 shrink-0 rounded-2xl overflow-hidden traveler-glow"
              >
                {city.imageUrl ? (
                  <img
                    src={city.imageUrl}
                    alt={city.nameKo}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-container-low" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-label-sm font-bold">{city.nameKo}</p>
                  <p className="text-[11px] opacity-75">{city.countryName}</p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
