import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TripAccommodationSelector from "@/trip/components/fliAndAcc/TripAccommodationSelector";
import TripConditionSummaryBar from "@/trip/components/planning/TripConditionSummaryBar";
import "@/trip/styles/trip.css";
import {
  tripApi,
  type AccommodationOption,
  type AccommodationSelection,
  type TripFlowState,
} from "@/trip/api/trip";
import {
  isStartDateAllowed,
  sanitizeStartDate,
} from "@/trip/utils/dateConstraints";

interface LocationState extends TripFlowState {}

export default function TripAccommodationSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<AccommodationSelection | null>(
      state?.accommodationSelection ?? null,
    );

  const [startDate, setStartDate] = useState(() =>
    sanitizeStartDate(state?.conditions.startDate),
  );

  const hasStartDate = isStartDateAllowed(startDate);

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

  // 데모: 항상 display_order 앞 5개만 보이지 않도록, 조회 결과마다 가볍게 섞은 뒤 최대 9개
  const accommodations = useMemo(() => {
    const list = accommodationQuery.data ?? [];
    if (list.length === 0) return list;
    return shuffleCopy(list).slice(0, 9);
  }, [accommodationQuery.data]);

  const finishFlow = (flowState: TripFlowState, replace = false) => {
    navigate("/trip/result", {
      replace,
      state: {
        ...flowState,
        pendingBuild: true,
      },
    });
  };

  if (!state) {
    return <Navigate to="/trip/new" replace />;
  }

  const conditions = flowStateWithDate?.conditions ?? state.conditions;

  const handleBack = () => {
    if (state.conditions.flightCondition?.skip) {
      navigate("/trip/new");
      return;
    }

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

  if (skipAccommodation && flowStateWithDate && hasStartDate) {
    const accommodationSelection: AccommodationSelection = {
      skipped: true,
    };

    return (
      <Navigate
        to="/trip/result"
        replace
        state={{
          ...flowStateWithDate,
          accommodationSelection,
          pendingBuild: true,
        }}
      />
    );
  }

  if (skipAccommodation) {
    return (
      <div className="trip-page">
        <TripConditionSummaryBar
          conditions={conditions}
          startDate={startDate}
          expanded={false}
          onStartDateChange={(nextStartDate) => {
            setStartDate(sanitizeStartDate(nextStartDate));
          }}
          onToggleConditions={() => navigate("/trip/new")}
        />

        <div className="trip-surface p-stack-lg">
          <p className="text-center text-body-md text-on-surface-variant">
            출발일을 선택해 주세요.
          </p>
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
          setStartDate(sanitizeStartDate(nextStartDate));
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
          disabled={!selectedAccommodation}
          className="btn-primary min-w-[180px] disabled:opacity-50"
        >
          결과 보기
          <span className="material-symbols-outlined ml-2 align-[-5px] text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>

    </div>
  );
}

function shuffleCopy<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
