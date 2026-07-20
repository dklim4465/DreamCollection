import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import EmptyState from "@/common/components/EmptyState";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import Pagination from "@/board/components/Pagination";
import SavedTripList from "@/trip/components/result/SavedTripList";
import TripThumbnail from "@/trip/components/result/TripThumbnail";
import { tripApi, type SavedTrip } from "@/trip/api/trip";
import { placeApi, type PlaceOption } from "@/trip/api/place";
import { useAuthStore } from "@/auth/store/authStore";
import {
  buildTripDisplayTitle,
  buildTripTags,
  collectTripThumbnailCandidates,
  countSchedulePlaces,
  formatTripDateRange,
  getDday,
  getTripScheduleStatus,
} from "@/trip/utils/savedTripListUtils";
import "@/trip/styles/trip.css";

type ListTab = "all" | "upcoming" | "past";
type SortOrder = "desc" | "dday";

const PAGE_SIZE = 6;

function pickHeroTrip(trips: SavedTrip[]): SavedTrip | null {
  const ranked = trips
    .map((trip) => ({
      trip,
      status: getTripScheduleStatus(trip),
      dday: getDday(trip.conditions.startDate),
    }))
    .filter(
      (row) =>
        row.status === "upcoming" ||
        row.status === "ongoing" ||
        (row.dday !== null && row.dday >= 0),
    )
    .sort((a, b) => (a.dday ?? 9999) - (b.dday ?? 9999));

  return ranked[0]?.trip ?? trips[0] ?? null;
}

function UpcomingHeroCard({
  trip,
  places,
}: {
  trip: SavedTrip;
  places: PlaceOption[];
}) {
  const navigate = useNavigate();
  const dday = getDday(trip.conditions.startDate);
  const tags = buildTripTags(trip).slice(0, 4);
  const placeCount = countSchedulePlaces(trip);
  const candidates = collectTripThumbnailCandidates(trip, places);

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-stack-md">
      <div className="flex flex-col gap-stack-md sm:flex-row sm:items-center">
        <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container sm:h-32 sm:w-44">
          <TripThumbnail candidates={candidates} iconClassName="text-[36px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-0.5 text-label-sm font-bold text-tertiary">
              <span className="material-symbols-outlined text-[14px]">star</span>
              다가오는 일정
            </span>
            {dday !== null && dday >= 0 && (
              <span className="rounded-md bg-tertiary-container px-2 py-0.5 text-label-sm font-bold text-on-tertiary-container">
                {dday === 0 ? "오늘 출발" : `D-${dday}`}
              </span>
            )}
          </div>
          <h2 className="mt-1 truncate text-title-md font-bold">
            {buildTripDisplayTitle(trip)}
          </h2>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-label-sm text-on-surface-variant">
            <span>{formatTripDateRange(trip)}</span>
            {trip.conditions.who && (
              <>
                <span>·</span>
                <span>{trip.conditions.who} 여행</span>
              </>
            )}
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              {placeCount}곳
            </span>
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="chip-primary !px-2 !py-0 text-[11px]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary shrink-0 inline-flex items-center justify-center gap-1 self-stretch sm:self-center"
          onClick={() => navigate(`/trip/saved/${trip.savedTripId}`)}
        >
          일정 확인
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
}

export default function TripSavedListPage() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOrder>("desc");
  const [tab, setTab] = useState<ListTab>("all");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["savedTrips", userId, page, sort, keyword],
    queryFn: () =>
      tripApi.getSavedTripsPage({
        page,
        size: PAGE_SIZE,
        sort,
        keyword: keyword || undefined,
      }),
    enabled: !!userId,
  });

  /** 히어로·탭 카운트용 (최대 50개 스냅샷) */
  const { data: previewData } = useQuery({
    queryKey: ["savedTrips-preview", userId],
    queryFn: () =>
      tripApi.getSavedTripsPage({ page: 0, size: 50, sort: "desc" }),
    enabled: !!userId,
  });

  /** 목록·히어로에 쓰인 destination(도시)만 모아서 Place 썸네일 조회 */
  const thumbnailCities = useMemo(() => {
    const names = new Set<string>();
    for (const trip of [
      ...(pageData?.content ?? []),
      ...(previewData?.content ?? []),
    ]) {
      const city = trip.conditions.destination?.trim();
      if (city) names.add(city);
    }
    return [...names];
  }, [pageData, previewData]);

  const placeThumbnailQueries = useQueries({
    queries: thumbnailCities.map((city) => ({
      queryKey: ["place-thumbnail", city],
      queryFn: () => placeApi.getPlaces(city),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const placesByCity = useMemo(() => {
    const map: Record<string, PlaceOption[]> = {};
    thumbnailCities.forEach((city, index) => {
      map[city] = placeThumbnailQueries[index]?.data ?? [];
    });
    return map;
  }, [thumbnailCities, placeThumbnailQueries]);

  const heroTrip = useMemo(
    () => pickHeroTrip(previewData?.content ?? []),
    [previewData],
  );

  const tabCounts = useMemo(() => {
    const list = previewData?.content ?? [];
    return {
      all: previewData?.totalElements ?? list.length,
      upcoming: list.filter((t) => {
        const s = getTripScheduleStatus(t);
        return s === "upcoming" || s === "ongoing";
      }).length,
      past: list.filter((t) => getTripScheduleStatus(t) === "past").length,
    };
  }, [previewData]);

  const visibleTrips = useMemo(() => {
    const list = pageData?.content ?? [];
    if (tab === "all") return list;
    if (tab === "upcoming") {
      return list.filter((t) => {
        const s = getTripScheduleStatus(t);
        return s === "upcoming" || s === "ongoing";
      });
    }
    return list.filter((t) => getTripScheduleStatus(t) === "past");
  }, [pageData, tab]);

  if (!userId) {
    return (
      <Navigate to="/login" replace state={{ redirectTo: "/trip/saved" }} />
    );
  }

  if (isLoading && !pageData) {
    return <LoadingSpinner message="저장된 일정을 불러오는 중..." />;
  }

  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = Math.max(1, pageData?.totalPages ?? 1);
  const safePage = pageData?.page ?? page;

  const submitSearch = () => {
    setKeyword(keywordInput.trim());
    setPage(0);
  };

  return (
    <div className="trip-page">
      <div className="flex flex-col gap-stack-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-md font-bold">내 일정</h1>
          <p className="mt-1 text-label-md text-on-surface-variant">
            저장한 여행 일정을 관리하고 확인해보세요.
          </p>
        </div>
        <Link
          to="/trip/new"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          새 일정 만들기
        </Link>
      </div>

      {heroTrip && (
        <UpcomingHeroCard
          trip={heroTrip}
          places={
            placesByCity[heroTrip.conditions.destination?.trim() ?? ""] ?? []
          }
        />
      )}

      {isError && (
        <p className="text-error text-label-md">
          저장된 일정을 불러오지 못했습니다.
        </p>
      )}

      {!isError && totalElements === 0 && !keyword ? (
        <EmptyState
          title="저장된 일정이 없어요"
          description="AI에게 새 일정을 추천받아보세요."
          action={
            <Link to="/trip/new" className="btn-primary">
              일정 만들기
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-stack-md lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-stack-md">
              <p className="text-title-md font-bold">
                저장된 일정 {totalElements}개
              </p>
              <div className="flex gap-1 border-b border-outline-variant/40">
                {(
                  [
                    ["all", `전체 ${tabCounts.all}`],
                    ["upcoming", `예정된 여행 ${tabCounts.upcoming}`],
                    ["past", `지난 여행 ${tabCounts.past}`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTab(value)}
                    className={
                      tab === value
                        ? "border-b-2 border-primary px-3 py-2 text-label-md font-bold text-primary"
                        : "px-3 py-2 text-label-md text-on-surface-variant"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-stack-sm">
              <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="여행지, 일정 제목 검색"
                  className="w-full bg-transparent text-label-md outline-none"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOrder);
                  setPage(0);
                }}
                className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-label-md"
              >
                <option value="desc">최신순</option>
                <option value="dday">출발 임박순</option>
              </select>
            </div>
          </div>

          {visibleTrips.length === 0 ? (
            <EmptyState
              title={keyword ? "검색 결과가 없어요" : "표시할 일정이 없어요"}
              description={
                keyword
                  ? "다른 검색어로 다시 시도해보세요."
                  : "다른 탭을 선택하거나 새 일정을 만들어보세요."
              }
            />
          ) : (
            <SavedTripList
              savedTrips={visibleTrips}
              placesByCity={placesByCity}
            />
          )}

          {tab === "all" && totalElements > 0 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={setPage}
              alwaysShow
            />
          )}
        </>
      )}
    </div>
  );
}
