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
      <div className="flex items-end justify-between mb-stack-md">
        <div>
          <p className="text-label-sm font-bold text-primary mb-1">
            DESTINATIONS
          </p>
          <h2 className="text-headline-lg font-bold">
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
                className="h-72 rounded-3xl bg-surface-container-low animate-pulse"
              />
            ))
          : cities.map((city) => (
              <Link
                key={city.id}
                to={`/trip/new?destination=${encodeURIComponent(city.nameKo)}`}
                className="group relative h-72 rounded-3xl overflow-hidden traveler-glow"
              >
                {city.imageUrl ? (
                  <img
                    src={city.imageUrl}
                    alt={city.nameKo}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-container-low" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-headline-sm font-bold">{city.nameKo}</p>
                  <p className="text-[12px] opacity-80">{city.countryName}</p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
