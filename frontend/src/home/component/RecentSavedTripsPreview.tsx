import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { tripApi } from "@/trip/api/trip";

/**
 * 홈페이지 "내가 저장한 여행" 미리보기.
 * "이달의 추천 여행지" 캐러셀이 위쪽 HeroBackground와 내용이 겹쳐서 빠진 자리를 채움.
 * 비로그인 사용자에게는 노출하지 않음(저장된 여행 API가 로그인 필요).
 */
export default function RecentSavedTripsPreview() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["trip", "saved", "preview"],
    queryFn: tripApi.getSavedTrips,
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated) return null;

  const trips = (data ?? []).slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-end mb-stack-md">
        <div>
          <span className="chip-tertiary">My Trips</span>
          <h2 className="text-[28px] md:text-display-lg mt-2 font-bold">
            내가 저장한 여행
          </h2>
        </div>
        <Link to="/trip/saved" className="btn-ghost text-sm py-2 px-4 whitespace-nowrap">
          전체 보기
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
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
            >
              <p className="text-headline-sm font-bold line-clamp-1">
                {trip.title || trip.region || "저장된 여행"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {trip.region && <span className="chip-tertiary">{trip.region}</span>}
                {trip.theme && <span className="chip-primary">{trip.theme}</span>}
              </div>
              <p className="text-label-sm text-on-surface-variant mt-auto">
                {dayjs(trip.createdDate).format("YYYY.MM.DD")} 저장
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
