import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { monthlyDestinationApi } from "@/home/api/monthlyDestinationApi";

const PAGE_SIZE = 5;
export default function MonthlyDestinationHero() {
  const { data, isLoading } = useQuery({
    queryKey: ["main", "monthly-destination"],
    queryFn: monthlyDestinationApi.getCurrentMonth,
    retry: false,
  });

  const items = (data?.data?.data ?? []).slice(0, 10);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const currentMonth = new Date().getMonth() + 1;

  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-surface-container-low py-14 md:py-20">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary text-label-sm tracking-[0.3em] uppercase mb-2">
              Monthly Best
            </p>
            <h2 className="text-headline-lg font-black">
              {currentMonth}월, 지금 가장 인기 있는 여행지
            </h2>
          </div>
          {pages > 1 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="이전 순위"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page === pages - 1}
                aria-label="다음 순위"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-gutter">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">explore</span>
            <p className="text-body-md">이달의 추천 여행지가 곧 업데이트돼요</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-gutter">
              {pageItems.map((item, i) => {
                const rank = page * PAGE_SIZE + i + 1;
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden h-72 bg-surface-container-high"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.destinationName}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <span
                      className={
                        rank === 1
                          ? "absolute top-3 left-3 w-8 h-8 rounded-full bg-tertiary text-on-tertiary font-black text-sm flex items-center justify-center"
                          : "absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 text-on-surface font-black text-sm flex items-center justify-center"
                      }
                    >
                      {rank}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-start gap-2">
                      <div>
                        <p className="text-white font-bold text-body-md leading-tight">
                          {item.destinationName}
                        </p>
                        <p className="text-white/75 text-label-sm truncate">{item.title}</p>
                      </div>
                      <Link
                        to={`/trip/new?region=${encodeURIComponent(item.destinationName)}`}
                        className="inline-flex items-center gap-1 bg-white text-neutral-900 text-label-sm font-bold py-2 px-3.5 rounded-full hover:scale-105 transition-transform"
                      >
                        이 여행지로 계획 세우기
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {pages > 1 && (
              <div className="flex md:hidden items-center justify-center gap-2 mt-8">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-label={`${i * PAGE_SIZE + 1}~${Math.min((i + 1) * PAGE_SIZE, items.length)}위`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === page ? "w-6 bg-primary" : "w-1.5 bg-outline-variant"
                    }`}
                  />
                ))}
              </div>
            )}

            {pages > 1 && (
              <p className="text-center text-label-sm text-on-surface-variant mt-4 md:hidden">
                {page * PAGE_SIZE + 1}~{Math.min((page + 1) * PAGE_SIZE, items.length)}위
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}