import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { PlanResponse } from "@/trip/api/trip";
import { tripApi } from "@/trip/api/trip";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import SavedTripHeader from "@/trip/components/result/SavedTripHeader";
import SavedTripTimeline from "@/trip/components/result/SavedTripTimeline";
import "@/trip/styles/trip.css";

export default function TripSavedDetailPage() {
  const { savedTripId: savedTripIdParam } = useParams();
  const navigate = useNavigate();

  const savedTripId = Number(savedTripIdParam);
  const isValidId = Number.isInteger(savedTripId) && savedTripId > 0;

  const {
    data: trip,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["savedTrip", savedTripId],
    queryFn: () => tripApi.getSavedTrip(savedTripId),
    enabled: isValidId,
  });

  if (!isValidId) {
    return <Navigate to="/trip/saved" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner message="저장된 일정을 불러오는 중..." />;
  }

  if (isError || !trip) {
    return (
      <div className="trip-page text-center">
        <p className="text-body-md text-error">
          저장된 일정을 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate("/trip/saved")}
          className="btn-ghost mt-stack-md"
        >
          내 일정으로 돌아가기
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    const planResult: PlanResponse = {
      ...trip.conditions,
      prompt: "",
      aiResult: "",
      recommendations: [trip.recommendation],
      sideBlocks: [],
    };

    navigate("/trip/edit", {
      state: {
        conditions: trip.conditions,
        planResult,
        recommendation: trip.recommendation,
        savedTripId: trip.savedTripId,
        isSavedView: true,
        saveLabel: "일정 수정",
        flightSelection: trip.flightSelection,
        accommodationSelection: trip.accommodationSelection,
      },
    });
  };

  return (
    <div className="trip-page-wide space-y-stack-lg">
      <SavedTripHeader trip={trip} onEdit={handleEdit} />

      <SavedTripTimeline trip={trip} />
    </div>
  );
}
