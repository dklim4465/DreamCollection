import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { tripApi } from "@/trip/api/trip";

/**
 * 홈페이지 "내가 저장한 여행" 미리보기.
 * "이달의 추천 여행지" 캐러셀이 위쪽 HeroBackground와 내용이 겹쳐서 빠진 자리를 채움.
 * 비로그인 사용자에게는 실데이터 대신 샘플 카드를 블러 처리해서 보여주고,
 * 자물쇠 오버레이로 "로그인하면 이렇게 보여요"를 미리 안내한다.
 */
const LOCKED_SAMPLE_TRIPS = [
  { id: -1, title: "제주도 3박4일", region: "제주도", theme: "힐링" },
  { id: -2, title: "오사카 자유여행", region: "오사카", theme: "맛집" },
  { id: -3, title: "다낭 가족여행", region: "다낭", theme: "휴양" },
];

export default function RecentSavedTripsPreview() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["trip", "saved", "preview"],
    queryFn: tripApi.getSavedTrips,
    enabled: isAuthenticated,
    retry: false,
  });

  const trips = isAuthenticated ? (data ?? []).slice(0, 3) : LOCKED_SAMPLE_TRIPS;

  return (
    <section>
      <div className="flex justify-between items-end mb-stack-md">
        <div>
          <span className="chip-tertiary">My Trips</span>
          <h2 className="text-[28px] md:text-display-lg mt-2 font-bold">
            내가 저장한 여행
          </h2>
        </div>
        {isAuthenticated && (
          <Link to="/trip/saved" className="btn-ghost text-sm py-2 px-4 whitespace-nowrap">
            전체 보기
          </Link>
        )}
      </div>

      <div className="relative">
        {!isAuthenticated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center rounded-2xl bg-surface/70 backdrop-blur-sm">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              lock
            </span>
            <p className="text-body-md font-semibold px-4">
              로그인하고 내가 저장한 여행을 확인해보세요
            </p>
            <Link to="/login" className="btn-primary text-sm py-2 px-5">
              로그인하기
            </Link>
          </div>
        )}

        <div className={!isAuthenticated ? "pointer-events-none select-none blur-[3px] opacity-70" : undefined}>
          {isAuthenticated && isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-surface-container-low animate-pulse" />
              ))}
            </div>
          ) : isAuthenticated && trips.length === 0 ? (
            <div className="w-full rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-3 py-12 px-6">
              <span className="material-symbols-outlined text-4xl opacity-50">calendar_month</span>
              <p className="text-body-md text-on-surface-variant">
                아직 저장한 여행이 없어요. AI에게 여행을 추천받아보세요!
              </p>
              <Link to="/trip/new" className="btn-primary text-sm py-2 px-5">
                일정 만들기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  to="/trip/saved"
                  className="card-interactive p-stack-md flex flex-col gap-2"
                  tabIndex={!isAuthenticated ? -1 : undefined}
                >
                  <p className="text-headline-sm font-bold line-clamp-1">
                    {trip.title || trip.region || "저장된 여행"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {trip.region && <span className="chip-tertiary">{trip.region}</span>}
                    {trip.theme && <span className="chip-primary">{trip.theme}</span>}
                  </div>
                  {isAuthenticated && "createdDate" in trip && (
                    <p className="text-label-sm text-on-surface-variant mt-auto">
                      {dayjs((trip as { createdDate: string }).createdDate).format("YYYY.MM.DD")} 저장
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
