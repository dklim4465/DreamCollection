import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import TripConditionSummaryBar from "@/trip/components/planning/TripConditionSummaryBar";
import { createManualPlanResult } from "@/trip/utils/manualTripRecommendation";
import type {
  PlanRequest,
  PlanResponse,
  SaveTripResponse,
  SaveTripRequest,
  FlightSelection,
  FlightSegment,
  AccommodationSelection,
  ScheduleItem,
  TripRecommendation,
} from "@/trip/api/trip";
import { tripApi } from "@/trip/api/trip";
import { useAuthStore } from "@/auth/store/authStore";
import TripScheduleView from "@/trip/components/result/TripScheduleView";
import {
  isStartDateAllowed,
  sanitizeStartDate,
} from "@/trip/utils/dateConstraints";
import "@/trip/styles/trip.css";

interface LocationState {
  conditions: PlanRequest;
  planResult?: PlanResponse;
  recommendation?: TripRecommendation;
  savedTripId?: number;
  isSavedView?: boolean;
  saveLabel?: string;
  shouldSave?: boolean;
  flightSelection?: FlightSelection | null;
  accommodationSelection?: AccommodationSelection | null;
  planningMode?: "ai" | "manual";
  pendingBuild?: boolean;
}

function sanitizeConditions(conditions: PlanRequest): PlanRequest {
  const startDate = sanitizeStartDate(conditions.startDate);
  return {
    ...conditions,
    startDate: startDate || undefined,
  };
}

export default function TripResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const state = location.state as LocationState | null;
  const [conditions, setConditions] = useState<PlanRequest>(() => {
    const base = state?.conditions ?? ({} as PlanRequest);
    // 저장된 일정 조회는 과거 출발일도 유지 (표시용)
    if (state?.isSavedView) return base;
    return sanitizeConditions(base);
  });

  const [planResult, setPlanResult] = useState<PlanResponse | null>(
    () => state?.planResult ?? null,
  );

  const [recommendation, setRecommendation] =
    useState<TripRecommendation | null>(() =>
      state?.recommendation
        ? applyFlightSelectionToRecommendation(
            state.recommendation,
            state.flightSelection,
          )
        : null,
    );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const autoSaveTriggered = useRef(false);
  const autoBuildTriggered = useRef(false);

  const saveMutation = useMutation<
    SaveTripResponse | void,
    Error,
    SaveTripRequest
  >({
    mutationFn: (request: SaveTripRequest) => {
      if (state?.isSavedView && state.savedTripId) {
        return tripApi.updateSavedTrip(state.savedTripId, request);
      }

      return tripApi.save(request);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["savedTrips"] });

      if (state?.isSavedView && state.savedTripId) {
        await queryClient.invalidateQueries({
          queryKey: ["savedTrip", state.savedTripId],
        });

        navigate(`/trip/saved/${state.savedTripId}`);
        return;
      }

      if (result && "savedTripId" in result) {
        navigate(`/trip/saved/${result.savedTripId}`);
        return;
      }

      navigate("/trip/saved");
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: tripApi.deleteSavedTrip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["savedTrips"] });
      navigate("/trip/saved");
    },
  });

  const buildMutation = useMutation({
    mutationFn: async (request: PlanRequest) => {
      const nextPlanResult = await tripApi.recommend(request);

      if (!nextPlanResult.recommendations[0]) {
        throw new Error("추천 일정을 불러오지 못했습니다.");
      }

      return nextPlanResult;
    },
    onSuccess: (nextPlanResult: PlanResponse) => {
      const nextRecommendation = nextPlanResult.recommendations[0];

      setPlanResult(nextPlanResult);
      setRecommendation(
        applyFlightSelectionToRecommendation(
          nextRecommendation,
          state?.flightSelection,
        ),
      );
    },
  });

  useEffect(() => {
    if (
      !state?.pendingBuild ||
      !conditions.startDate ||
      !isStartDateAllowed(conditions.startDate) ||
      recommendation ||
      autoBuildTriggered.current
    ) {
      return;
    }

    autoBuildTriggered.current = true;

    if (state.planningMode === "manual") {
      const nextPlanResult = createManualPlanResult(conditions);
      const nextRecommendation = nextPlanResult.recommendations[0];

      setPlanResult(nextPlanResult);
      setRecommendation(
        applyFlightSelectionToRecommendation(
          nextRecommendation,
          state.flightSelection,
        ),
      );
      return;
    }

    buildMutation.mutate(conditions);
  }, [conditions, recommendation, state]);

  // 로그인 후 shouldSave로 돌아왔을 때 자동 저장 (1회만)
  useEffect(() => {
    if (autoSaveTriggered.current) return;
    if (!state?.shouldSave || !user?.id || !conditions || !recommendation)
      return;
    if (state.isSavedView) return;
    if (!conditions.startDate || !isStartDateAllowed(conditions.startDate))
      return;

    autoSaveTriggered.current = true;

    saveMutation.mutate({
      conditions,
      recommendation,
      flightSelection: state.flightSelection,
      accommodationSelection: state.accommodationSelection,
    });
  }, [
    state?.shouldSave,
    user?.id,
    conditions,
    recommendation,
    state?.isSavedView,
  ]);

  if (!state) {
    return <Navigate to="/trip" replace />;
  }

  if (!state.recommendation && !state.pendingBuild) {
    return <Navigate to="/trip" replace />;
  }

  const recommendationTitle = recommendation?.title?.trim() || "추천 일정";
  const saveLabel = state.isSavedView
    ? "일정 수정"
    : (state.saveLabel ??
      (state.planningMode === "manual" ? "개인 일정 저장" : undefined));

  const handleStartDateChange = (startDate: string) => {
    const sanitized = sanitizeStartDate(startDate);
    const nextConditions: PlanRequest = {
      ...conditions,
      startDate: sanitized || undefined,
    };

    if (state?.pendingBuild) {
      autoBuildTriggered.current = false;
      buildMutation.reset();
      setPlanResult(null);
      setRecommendation(null);
    }

    setConditions(nextConditions);
  };

  const handleRetryBuild = () => {
    if (!conditions.startDate || !isStartDateAllowed(conditions.startDate))
      return;

    autoBuildTriggered.current = true;
    buildMutation.mutate(conditions);
  };

  const handleBack = () => {
    navigate("/trip");
  };

  const handleStartTitleEdit = () => {
    setTitleDraft(recommendationTitle);
    setIsEditingTitle(true);
  };

  const handleCancelTitleEdit = () => {
    setTitleDraft("");
    setIsEditingTitle(false);
  };

  const handleApplyTitle = () => {
    const nextTitle = titleDraft.trim() || "추천 일정";

    setRecommendation((prev) =>
      prev
        ? {
            ...prev,
            title: nextTitle,
          }
        : prev,
    );
    setIsEditingTitle(false);
  };

  const handleSave = () => {
    if (!recommendation) {
      window.alert("저장할 일정이 없습니다.");
      return;
    }
    if (!user?.id) {
      navigate("/login", {
        state: {
          redirectState: {
            conditions,
            planResult,
            recommendation,
            shouldSave: true,
            flightSelection: state.flightSelection,
            accommodationSelection: state.accommodationSelection,
          },
        },
      });
      return;
    }

    if (state.isSavedView && !state.savedTripId) {
      window.alert("수정할 일정 번호가 없습니다.");
      return;
    }

    saveMutation.mutate({
      conditions,
      recommendation,
      flightSelection: state.flightSelection,
      accommodationSelection: state.accommodationSelection,
    });
  };

  const handleDelete = () => {
    if (!state.savedTripId) {
      window.alert("삭제할 일정 번호가 없습니다.");
      return;
    }

    const confirmed = window.confirm("이 일정을 삭제하시겠습니까?");
    if (!confirmed) return;

    deleteMutation.mutate(state.savedTripId);
  };

  return (
    <div className="trip-page-wide">
      <div className="flex flex-wrap items-center gap-stack-sm px-1">
        {isEditingTitle ? (
          <>
            <input
              type="text"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleApplyTitle();
                }

                if (event.key === "Escape") {
                  handleCancelTitleEdit();
                }
              }}
              autoFocus
              className="min-w-[260px] rounded-xl border border-primary/50 bg-surface-container-lowest px-4 py-2 text-headline-sm font-bold text-on-surface shadow-glow outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              aria-label="일정 제목"
            />
            <button
              type="button"
              onClick={handleApplyTitle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition hover:bg-primary/90"
              aria-label="제목 저장"
            >
              <span className="material-symbols-outlined text-[20px]">
                check
              </span>
            </button>
            <button
              type="button"
              onClick={handleCancelTitleEdit}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/70 text-on-surface-variant transition hover:bg-surface-container"
              aria-label="제목 수정 취소"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </>
        ) : (
          <>
            <h1 className="text-headline-md font-bold text-on-surface">
              {recommendationTitle}
            </h1>
            <button
              type="button"
              onClick={handleStartTitleEdit}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-primary"
              aria-label="제목 수정"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
            </button>
          </>
        )}
      </div>

      <TripConditionSummaryBar
        conditions={conditions}
        startDate={conditions.startDate ?? ""}
        expanded={false}
        disabled={buildMutation.isPending}
        onStartDateChange={handleStartDateChange}
        onToggleConditions={() => navigate("/trip/new")}
      />
      {recommendation ? (
        <TripScheduleView
          conditions={conditions}
          recommendation={recommendation}
          onChangeRecommendation={setRecommendation}
          onBack={handleBack}
          onSave={handleSave}
          onDelete={
            state.isSavedView && state.savedTripId ? handleDelete : undefined
          }
          isSaving={saveMutation.isPending}
          isDeleting={deleteMutation.isPending}
          saveLabel={saveLabel}
        />
      ) : buildMutation.isPending ? (
        <section
          className="trip-surface p-stack-lg text-center"
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingSpinner message="AI가 여행 일정을 만들고 있어요." />
          <p className="-mt-12 text-label-md text-on-surface-variant">
            선택한 조건을 바탕으로 장소와 이동 동선을 구성하고 있습니다.
          </p>
        </section>
      ) : buildMutation.isError ? (
        <section className="trip-surface p-stack-lg text-center">
          <p className="text-body-md font-bold text-error">
            일정 생성에 실패했습니다.
          </p>
          <p className="mt-1 text-label-md text-on-surface-variant">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={handleRetryBuild}
            className="btn-primary mt-5"
          >
            다시 시도
          </button>
        </section>
      ) : (
        <section className="trip-surface p-stack-lg text-center">
          <p className="text-body-md font-bold text-on-surface">
            출발일을 선택해 주세요.
          </p>
          <p className="mt-1 text-label-md text-on-surface-variant">
            날짜를 선택하면 일정 생성이 시작됩니다.
          </p>
        </section>
      )}
      {(saveMutation.isError || deleteMutation.isError) && (
        <p className="text-error text-label-md text-center mt-stack-md">
          저장에 실패했습니다.
        </p>
      )}
    </div>
  );
}

const AUTO_FLIGHT_ITEM_PREFIX = "selected-flight-";
const AUTO_FLIGHT_LOCK_ITEM_PREFIX = "selected-flight-lock-";
const TIME_SLOT_ORDER = ["Morning", "Lunch", "Afternoon", "Dinner", "Night"];

function applyFlightSelectionToRecommendation(
  recommendation: TripRecommendation,
  flightSelection?: FlightSelection | null,
): TripRecommendation {
  if (!flightSelection || flightSelection.skipped) {
    return recommendation;
  }

  const daysWithoutAutoFlights = recommendation.days.map((day) => ({
    ...day,
    items: day.items.filter(
      (item) =>
        !item.itemKey.startsWith(AUTO_FLIGHT_ITEM_PREFIX) &&
        !item.itemKey.startsWith(AUTO_FLIGHT_LOCK_ITEM_PREFIX),
    ),
  }));

  if (daysWithoutAutoFlights.length === 0) {
    return {
      ...recommendation,
      days: daysWithoutAutoFlights,
    };
  }

  const nextDays = daysWithoutAutoFlights.map((day) => ({
    ...day,
    items: [...day.items],
  }));

  if (flightSelection.outboundFlight) {
    const outboundSlot = getFlightTimeSlot(
      flightSelection.outboundFlight.arrivalTime,
    );
    nextDays[0] = {
      ...nextDays[0],
      items: [
        ...createFlightLockedSlotItems(
          "outbound",
          getSlotsBefore(outboundSlot),
        ),
        createFlightScheduleItem(
          "outbound",
          flightSelection.outboundFlight,
          "출발",
          flightSelection.outboundFlight.arrivalTime,
        ),
        ...nextDays[0].items.filter(
          (item) =>
            getTimeSlotIndex(item.timeSlot) > getTimeSlotIndex(outboundSlot),
        ),
      ],
    };
  }

  if (flightSelection.returnFlight) {
    const lastDayIndex = nextDays.length - 1;
    const returnSlot = getFlightTimeSlot(
      flightSelection.returnFlight.departureTime,
    );

    nextDays[lastDayIndex] = {
      ...nextDays[lastDayIndex],
      items: [
        ...nextDays[lastDayIndex].items.filter(
          (item) =>
            item.itemKey.startsWith(AUTO_FLIGHT_ITEM_PREFIX) ||
            getTimeSlotIndex(item.timeSlot) < getTimeSlotIndex(returnSlot),
        ),
        createFlightScheduleItem(
          "return",
          flightSelection.returnFlight,
          "복귀",
          flightSelection.returnFlight.departureTime,
        ),
        ...createFlightLockedSlotItems("return", getSlotsAfter(returnSlot)),
      ],
    };
  }

  return {
    ...recommendation,
    days: nextDays,
  };
}

function createFlightScheduleItem(
  direction: "outbound" | "return",
  segment: FlightSegment,
  title: string,
  referenceTime: string,
): ScheduleItem {
  const flightName = [segment.airlineName, segment.flightNumber]
    .filter(Boolean)
    .join(" ");

  return {
    itemKey: `${AUTO_FLIGHT_ITEM_PREFIX}${direction}`,
    itemType: "Flight",
    timeSlot: getFlightTimeSlot(referenceTime),
    title,
    description: `${segment.departureAirportCode} ${formatFlightTime(
      segment.departureTime,
    )} → ${segment.arrivalAirportCode} ${formatFlightTime(
      segment.arrivalTime,
    )}${flightName ? ` · ${flightName}` : ""}`,
    durationMinutes: segment.durationMinutes,
    locked: true,
    replaceable: false,
  };
}

function createFlightLockedSlotItems(
  direction: "outbound" | "return",
  timeSlots: string[],
): ScheduleItem[] {
  return timeSlots.map((timeSlot) => ({
    itemKey: `${AUTO_FLIGHT_LOCK_ITEM_PREFIX}${direction}-${timeSlot}`,
    itemType: "LockedSlot",
    timeSlot,
    title: "",
    description: "",
    locked: true,
    replaceable: false,
  }));
}

function getFlightTimeSlot(time?: string) {
  const hour = Number(time?.slice(0, 2));

  if (Number.isNaN(hour)) return "Morning";
  if (hour < 12) return "Morning";
  if (hour < 14) return "Lunch";
  if (hour < 18) return "Afternoon";
  if (hour < 22) return "Dinner";
  return "Night";
}

function getTimeSlotIndex(timeSlot: string) {
  const index = TIME_SLOT_ORDER.indexOf(timeSlot);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function getSlotsBefore(timeSlot: string) {
  const index = getTimeSlotIndex(timeSlot);
  if (index <= 0 || index === Number.MAX_SAFE_INTEGER) return [];
  return TIME_SLOT_ORDER.slice(0, index);
}

function getSlotsAfter(timeSlot: string) {
  const index = getTimeSlotIndex(timeSlot);
  if (index < 0 || index >= TIME_SLOT_ORDER.length - 1) return [];
  return TIME_SLOT_ORDER.slice(index + 1);
}

function formatFlightTime(time?: string) {
  return time?.slice(0, 5) ?? "--:--";
}
