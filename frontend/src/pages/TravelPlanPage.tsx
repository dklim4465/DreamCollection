import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  tripApi,
  tripOptionTypes,
  tripOptionLabels,
  type PlanRequest,
  type PlanResponse,
  type TripRecommendation,
} from "@/api/trip";
import TripOptionSelector from "@/components/trip/TripOptionSelector";
import TripScheduleView from "@/components/trip/TripScheduleView";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type PageStep = "select" | "result";

export default function TravelPlanPage() {
  // pageStep: "선택 중" vs "결과 보기"
  const [pageStep, setPageStep] = useState<PageStep>("select");
  // optionStep: who(0) → when(1) → ... → level(4)
  const [optionStep, setOptionStep] = useState(0);
  const [conditions, setConditions] = useState<Partial<PlanRequest>>({});

  // recommend API 원본 응답 (조건 who/when 등 포함)
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);
  // 사용자가 후보 바꾼 뒤 저장할 추천 일정 (save API에 보낼 객체)
  const [recommendation, setRecommendation] =
    useState<TripRecommendation | null>(null);

  const currentType = tripOptionTypes[optionStep];
  const currentValue = conditions[currentType];
  const isLastOptionStep = optionStep === tripOptionTypes.length - 1;

  const recommendMutation = useMutation({
    mutationFn: tripApi.recommend,
    onSuccess: (data) => {
      setPlanResult(data);
      setRecommendation(data.recommendations[0] ?? null);
      setPageStep("result");
    },
  });

  const handleSelect = (selected: string) => {
    setConditions((prev) => ({ ...prev, [currentType]: selected }));
  };

  const handleNext = () => {
    if (!currentValue) return;

    if (isLastOptionStep) {
      recommendMutation.mutate(conditions as PlanRequest);
      return;
    }
    setOptionStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (optionStep > 0) setOptionStep((s) => s - 1);
  };

  const handleBackToSelect = () => {
    setPageStep("select");
    setOptionStep(0);
    setPlanResult(null);
    setRecommendation(null);
    recommendMutation.reset();
  };

  // ── 결과: 전체 일정 한 화면 ──
  if (pageStep === "result" && planResult && recommendation) {
    return (
      <div>
        <h1 className="text-headline-md font-bold mb-stack-lg">추천 일정</h1>

        <TripScheduleView
          conditions={planResult}
          recommendation={recommendation}
          onChangeRecommendation={setRecommendation}
          onBack={handleBackToSelect}
          // onSave / isSaving → 5단계 save API 연결할 때 추가
        />
      </div>
    );
  }

  // ── 선택: 5단계 위저드 ──
  return (
    <div>
      <h1 className="text-headline-md font-bold mb-2">여행 일정</h1>
      <p className="text-body-md text-on-surface-variant mb-stack-lg">
        {optionStep + 1} / {tripOptionTypes.length} —{" "}
        {tripOptionLabels[currentType]}
      </p>

      <div className="flex gap-2 mb-stack-lg">
        {tripOptionTypes.map((type, i) => (
          <div
            key={type}
            className={`h-2 flex-1 rounded-full ${
              i <= optionStep ? "bg-primary" : "bg-surface-container-high"
            }`}
          />
        ))}
      </div>

      <TripOptionSelector
        type={currentType}
        value={currentValue}
        onSelect={handleSelect}
      />

      {recommendMutation.isPending && (
        <LoadingSpinner message="AI가 일정을 구성하고 있어요..." />
      )}

      {recommendMutation.isError && (
        <p className="text-error text-label-md text-center mt-stack-md">
          일정 추천에 실패했습니다. 백엔드 연결을 확인해주세요.
        </p>
      )}

      <div className="flex gap-stack-sm mt-stack-lg">
        {optionStep > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="btn-ghost flex-1"
          >
            이전
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!currentValue || recommendMutation.isPending}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isLastOptionStep ? "일정 추천받기" : "다음"}
        </button>
      </div>
    </div>
  );
}
