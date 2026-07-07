import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SavedTripList from "@/components/trip/SavedTripList";
import { tripApi } from "@/api/trip";
import { useAuthStore } from "@/store/authStore";

export default function TripSavedListPage() {
  const { user } = useAuthStore();

  const userId = user?.id;

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["savedTrips", userId],
    queryFn: () => tripApi.getSavedTripsByUser(userId as number),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <Navigate to="/login" replace state={{ redirectTo: "/trip/saved" }} />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="저장된 일정을 불러오는 중..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">내 일정</h1>

        <Link to="/trip/new" className="btn-primary text-sm">
          + 새 일정
        </Link>
      </div>

      {isError && (
        <p className="text-error text-label-md mb-stack-md">
          저장된 일정을 불러오지 못했습니다.
        </p>
      )}

      {data.length === 0 ? (
        <EmptyState
          icon="calendar_month"
          title="저장된 일정이 없어요"
          description="AI에게 새 일정을 추천받아보세요."
          action={
            <Link to="/trip/new" className="btn-primary">
              일정 만들기
            </Link>
          }
        />
      ) : (
        <SavedTripList savedTrips={data} />
      )}
    </div>
  );
}
