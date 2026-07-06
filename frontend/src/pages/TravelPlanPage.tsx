<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  tripApi,
  tripOptionTypes,
  tripOptionLabels,
  type PlanRequest,
} from "@/api/trip";
import TripOptionSelector from "@/components/trip/TripOptionSelector";
import LoadingSpinner from "@/components/common/LoadingSpinner";
export default function TravelPlanPage() {
  const navigate = useNavigate();
  const [optionStep, setOptionStep] = useState(0);
  const [conditions, setConditions] = useState<Partial<PlanRequest>>({});
  const currentType = tripOptionTypes[optionStep];
  const currentValue = conditions[currentType];
  const isLastOptionStep = optionStep === tripOptionTypes.length - 1;

  const recommendMutation = useMutation({
    mutationFn: tripApi.recommend,
    onSuccess: (data) => {
      navigate("/trip/result", {
        state: {
          conditions,
          planResult: data,
          recommendation: data.recommendations[0],
        },
      });
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
  // 선택할때 필요한 곳
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
          // 이전 버튼이 너무 커서 수정해야함
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
=======
import EmptyState from "@/components/common/EmptyState";
import { Link } from "react-router-dom";

/**
 * 여행 계획 페이지 (Pre-travel)
 * 담당: C
 * TODO: 날짜별 일정 카드 + 항공/숙소 등록 폼
 */
export default function TravelPlanPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">내 여행 계획</h1>
        <Link to="/plan/new" className="btn-primary">
          + 새 계획
        </Link>
      </div>
      {/* TODO: PlanCard 그리드 */}
      <EmptyState
        icon="🗺️"
        title="여행 계획을 세워보세요"
        description="일정, 항공, 숙소를 한 곳에서 관리하세요"
        action={
          <Link to="/plan/new" className="btn-primary">
            계획 시작하기
          </Link>
        }
      />
>>>>>>> yj
    </div>
  );
}
