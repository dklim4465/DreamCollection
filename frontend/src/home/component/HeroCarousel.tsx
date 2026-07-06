import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { monthlyDestinationApi } from "@/home/api/monthlyDestinationApi";

/**
 * "이달의 추천 여행지" 캐러셀 — "여기는 어떠세요?" 톤으로 큼직하게 한 곳씩 제안하는 섹션.
 * 옆의 MonthlyBest10(랭킹 리스트)과 데이터 출처는 같지만(관리자가 등록한 이달의 여행지),
 * 여기서는 큰 이미지 + 설명으로 좀 더 "추천"의 느낌을 살림.
 */
export default function HeroCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["main", "monthly-destination"],
    queryFn: monthlyDestinationApi.getCurrentMonth,
    retry: false,
  });

  const items = data?.data?.data ?? [];

  const scroll = (dir: "prev" | "next") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.offsetWidth * 0.8;
    carouselRef.current.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex justify-between items-end mb-stack-md">
        <div>
          <span className="chip-tertiary">Editor's Pick</span>
          <h2 className="text-display-lg md:text-display-lg text-[32px] lg:text-display-lg mt-2 font-bold">
            이달의 추천 여행지, 여기는 어떠세요?
          </h2>
        </div>
        {items.length > 1 && (
          <div className="flex gap-2">
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">
                  {dir === "prev" ? "chevron_left" : "chevron_right"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="w-full aspect-video rounded-2xl bg-surface-container-low animate-pulse" />
      ) : items.length === 0 ? (
        <div className="w-full aspect-[21/9] rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-50">travel_explore</span>
          <p className="text-body-md">
            아직 등록된 이달의 추천 여행지가 없어요. 관리자 페이지에서 곧 채워질 예정이에요!
          </p>
        </div>
      ) : (
        <div
          ref={carouselRef}
          className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-gutter pb-4"
        >
          {items.map((dest) => (
            <div
              key={dest.id}
              className="snap-start shrink-0 w-full md:w-[600px] group cursor-pointer relative overflow-hidden rounded-2xl aspect-video traveler-glow transition-transform duration-500 hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                src={dest.imageUrl}
                alt={dest.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 p-stack-lg z-20 text-white">
                <p className="text-label-md mb-1 opacity-80">{dest.destinationName}</p>
                <h3 className="text-headline-md font-bold mb-4">{dest.title}</h3>
                {dest.linkUrl && (
                  <a
                    href={dest.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-primary px-6 py-2 rounded-full font-bold text-label-md hover:bg-primary-container transition-colors"
                  >
                    자세히 보기
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
