import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type { PlanRequest, PlanResponse, TripRecommendation } from "@/api/trip";
import { tripApi } from "@/api/trip";
import { useAuthStore } from "@/store/authStore";
import TripScheduleView from "@/components/trip/TripScheduleView";

interface LocationState {
  conditions: PlanRequest;
  planResult: PlanResponse;
  recommendation: TripRecommendation;
}

export default function TripResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const state = location.state as LocationState | null;

  if (!state?.recommendation) {
    return <Navigate to="/trip" replace />;
  }

  const { conditions } = state;

  const [recommendation, setRecommendation] = useState(state.recommendation);

  const saveMutation = useMutation({
    mutationFn: tripApi.save,
    onSuccess: () => {
      navigate("/records");
    },
  });

  const handleBack = () => {
    navigate("/trip");
  };

  const handleSave = () => {
    if (!user?.id) return;

    saveMutation.mutate({
      userId: user.id,
      conditions,
      recommendation, // 후보 바꾼 최종 값
    });
  };

  return (
    <div>
      <h1 className="text-headline-md font-bold mb-stack-lg">추천 일정</h1>

      <TripScheduleView
        conditions={conditions}
        recommendation={recommendation}
        onChangeRecommendation={setRecommendation}
        onBack={handleBack}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />

      {saveMutation.isError && (
        <p className="text-error text-label-md text-center mt-stack-md">
          저장에 실패했습니다.
        </p>
      )}
    </div>
  );
}
