import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import TripAccommodationSelector from "@/trip/components/fliAndAcc/TripAccommodationSelector";
import TripConditionSummaryBar from "@/trip/components/result/planning/TripConditionSummaryBar";
import { createManualPlanResult } from "@/trip/utils/manualTripRecommendation";
import "@/trip/styles/trip.css";
import {
  tripApi,
  type AccommodationOption,
  type AccommodationSelection,
  type TripFlowState,
} from "@/trip/api/trip";

interface LocationState extends TripFlowState {}

export default function TripAccommodationSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const autoFinalized = useRef(false);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<AccommodationSelection | null>(
      state?.accommodationSelection ?? null,
    );

  const [startDate, setStartDate] = useState(state?.conditions.startDate ?? "");

  const hasStartDate = startDate.trim().length > 0;

  const flowStateWithDate = useMemo<TripFlowState | null>(() => {
    if (!state) return null;
    return {
      ...state,
      conditions: {
        ...state.conditions,
        startDate: hasStartDate ? startDate : undefined,
      },
    };
  }, [hasStartDate, startDate, state]);
  const skipAccommodation = state?.conditions.accommodationCondition?.skip;

  const accommodationQuery = useQuery({
    queryKey: ["accommodationSearch", flowStateWithDate?.conditions],
    queryFn: () => tripApi.searchAccommodations(flowStateWithDate!.conditions),
    enabled: !!flowStateWithDate && !skipAccommodation && hasStartDate,
  });

  const resultMutation = useMutation({
    mutationFn: async (flowState: TripFlowState) => {
      const planResult = await tripApi.recommend(flowState.conditions);
      return { flowState, planResult };
    },
    onSuccess: ({ flowState, planResult }) => {
      const recommendation = planResult.recommendations[0];

      if (!recommendation) {
        window.alert("추천 일정을 불러오지 못했습니다.");
        return;
      }

      navigate("/trip/result", {
        state: {
          conditions: flowState.conditions,
          planResult,
          recommendation,
          flightSelection: flowState.flightSelection,
          accommodationSelection: flowState.accommodationSelection,
        },
      });
    },
  });
  const navigateToManualResult = (flowState: TripFlowState) => {
    const planResult = createManualPlanResult(flowState.conditions);
    const recommendation = planResult.recommendations[0];

    navigate("/trip/result", {
      state: {
        conditions: flowState.conditions,
        planResult,
        recommendation,
        saveLabel: "개인 일정 저장",
        flightSelection: flowState.flightSelection,
        accommodationSelection: flowState.accommodationSelection,
      },
    });
  };

  const finishFlow = (flowState: TripFlowState) => {
    if (flowState.planningMode === "manual") {
      navigateToManualResult(flowState);
      return;
    }

    resultMutation.mutate(flowState);
  };

  useEffect(() => {
    if (
      !flowStateWithDate ||
      !skipAccommodation ||
      !hasStartDate ||
      autoFinalized.current
    ) {
      return;
    }

    const accommodationSelection: AccommodationSelection = {
      skipped: true,
    };

    autoFinalized.current = true;

    finishFlow({
      ...flowStateWithDate,
      accommodationSelection,
    });
  }, [flowStateWithDate, hasStartDate, resultMutation, skipAccommodation]);

  if (!state) {
    return <Navigate to="/trip/new" replace />;
  }

  const conditions = flowStateWithDate?.conditions ?? state.conditions;

  const accommodations = (accommodationQuery.data ?? []).slice(0, 5);

  const handleBack = () => {
    navigate("/trip/flight", {
      state: flowStateWithDate ?? state,
    });
  };

  const handleSelectAccommodation = (accommodation: AccommodationOption) => {
    setSelectedAccommodation({
      skipped: false,
      ...accommodation,
    });
  };

  const handleCreateResult = () => {
    if (!selectedAccommodation || !flowStateWithDate) return;

    finishFlow({
      ...flowStateWithDate,
      accommodationSelection: selectedAccommodation,
    });
  };

  if (skipAccommodation) {
    return (
      <div className="trip-page">
        <TripConditionSummaryBar
          conditions={conditions}
          startDate={startDate}
          expanded={false}
          onStartDateChange={setStartDate}
          onToggleConditions={() => navigate("/trip/new")}
        />

        <div className="trip-surface p-stack-lg">
          {hasStartDate ? (
            <LoadingSpinner message="결과 생성 중..." />
          ) : (
            <p className="text-center text-body-md text-on-surface-variant">
              출발일을 선택해 주세요.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="trip-page">
      <TripConditionSummaryBar
        conditions={conditions}
        startDate={startDate}
        expanded={false}
        onStartDateChange={(nextStartDate) => {
          setStartDate(nextStartDate);
          setSelectedAccommodation(null);
        }}
        onToggleConditions={() => navigate("/trip/new")}
      />
      <section className="trip-surface p-stack-lg">
        <div className="trip-section-header">
          <span className="trip-section-icon">
            <span className="material-symbols-outlined">hotel</span>
          </span>
          <div>
            <h1 className="text-headline-sm font-bold text-on-surface">
              숙소 선택
            </h1>
            <p className="mt-1 text-label-md text-on-surface-variant">
              여행지에 맞는 숙소를 선택한 뒤 일정을 구성합니다.
            </p>
          </div>
        </div>

        <TripAccommodationSelector
          isLoading={accommodationQuery.isLoading}
          isError={accommodationQuery.isError}
          accommodations={accommodations}
          selectedAccommodation={selectedAccommodation}
          onSelect={handleSelectAccommodation}
        />
      </section>

      <div className="trip-action-bar">
        <button type="button" onClick={handleBack} className="btn-ghost">
          이전
        </button>
        <button
          type="button"
          onClick={handleCreateResult}
          disabled={!selectedAccommodation || resultMutation.isPending}
          className="btn-primary min-w-[180px] disabled:opacity-50"
        >
          {resultMutation.isPending ? "결과 생성 중..." : "결과 보기"}
          <span className="material-symbols-outlined ml-2 align-[-5px] text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>

      {resultMutation.isError && (
        <p className="text-center text-label-md text-error">
          결과 생성에 실패했습니다.
        </p>
      )}
    </div>
  );
}
