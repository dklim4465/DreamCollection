import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { PlanRequest, PlanResponse, TripRecommendation } from "@/api/trip";
import { useState } from "react";
import TripScheduleView from "@/components/trip/TripScheduleView";

interface LocationState {
  conditions: PlanRequest;
  planResult: PlanResponse;
  recommendation: TripRecommendation;
}

export default function TripResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 내부에서 선택 후 변경되므로 사용
  const state = location.state as LocationState | null;

  // 선택 된게 없으면 선택페이지로 (예외 처리도 고려중)
  if (!state?.recommendation) {
    return <Navigate to="/trip" replace />;
  }

  const { conditions } = state;

  // 여기서 선택된게 최종 결과라서 변경 가능하게 useState 사용
  const [recommendation, setRecommendation] = useState(state.recommendation);

  // 뒤로 가기 버튼
  const handleBack = () => {
    navigate("/trip");
  };

  return (
    <div>
      <h1 className="text-headline-md font-bold mb-stack-lg">추천 일정</h1>
      <TripScheduleView
        conditions={conditions}
        recommendation={recommendation}
        onChangeRecommendation={setRecommendation}
        onBack={handleBack}
        // onSave → 5단계 save API 연결할 때 추가
      />
    </div>
  );
}
