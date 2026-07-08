import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type {
  PlanRequest,
  PlanResponse,
  TripRecommendation,
} from "@/trip/api/trip";
import { tripApi } from "@/trip/api/trip";
import { useAuthStore } from "@/auth/store/authStore";
import TripScheduleView from "@/trip/components/TripScheduleView";

interface LocationState {
  conditions: PlanRequest;
  planResult: PlanResponse;
  recommendation: TripRecommendation;
  isSavedView?: boolean;
  shouldSave?: boolean;
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

  // 저장버튼 클릭 -> 로그인(안했다면) -> 리스트 페이지로 바로 이동(저장됨)
  const saveMutation = useMutation({
    mutationFn: tripApi.save,
    onSuccess: () => {
      navigate("/trip/saved");
      useEffect(() => {
        if (!state.shouldSave || !user?.id) return;

        saveMutation.mutate({
          userId: user.id,
          conditions,
          recommendation,
        });
      }, []);
    },
  });

  const handleBack = () => {
    navigate("/trip");
  };

  const handleSave = () => {
    if (!user?.id) {
      navigate("/login", {
        state: {
          redirectState: {
            conditions,
            planResult: state.planResult,
            recommendation,
            shouldSave: true,
          },
        },
      });
      return;
    }

    saveMutation.mutate({
      userId: user.id,
      conditions,
      recommendation,
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
        hideActions={state.isSavedView}
      />

      {!state.isSavedView && saveMutation.isError && (
        <p className="text-error text-label-md text-center mt-stack-md">
          저장에 실패했습니다.
        </p>
      )}
    </div>
  );
}
