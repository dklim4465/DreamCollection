import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import TripScheduleView from "@/trip/components/TripScheduleView";

interface LocationState {
  conditions: PlanRequest;
  planResult: PlanResponse;
  recommendation: TripRecommendation;
  savedTripId?: number;
  isSavedView?: boolean;
  saveLabel?: string;
  shouldSave?: boolean;
  flightSelection?: FlightSelection | null;
  accommodationSelection?: AccommodationSelection | null;
}

export default function TripResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const state = location.state as LocationState | null;

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["savedTrips"] });
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

  // 로그인 후 shouldSave로 돌아왔을 때 자동 저장 (1회만)
  useEffect(() => {
    if (autoSaveTriggered.current) return;
    if (!state?.shouldSave || !user?.id || !state.conditions || !recommendation)
      return;
    if (state.isSavedView) return;

    autoSaveTriggered.current = true;

    saveMutation.mutate({
      conditions: state.conditions,
      recommendation,
      flightSelection: state.flightSelection,
      accommodationSelection: state.accommodationSelection,
    });
  }, [
    state?.shouldSave,
    user?.id,
    state?.conditions,
    recommendation,
    state?.isSavedView,
  ]);

  if (!state?.recommendation || !recommendation) {
    return <Navigate to="/trip" replace />;
  }

  const { conditions } = state;
  const recommendationTitle = recommendation.title?.trim() || "추천 일정";
  const saveLabel = state.isSavedView ? "일정 수정" : state.saveLabel;

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
    if (!user?.id) {
      navigate("/login", {
        state: {
          redirectState: {
            conditions,
            planResult: state.planResult,
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
    <div className="relative left-1/2 w-[calc(100vw-32px)] max-w-[1800px] -translate-x-1/2">
      <div className="mb-stack-md flex flex-wrap items-center gap-stack-sm">
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
              className="min-w-[260px] rounded-xl border border-primary/50 bg-surface-container-lowest px-4 py-2 text-headline-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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

      <TripScheduleView
        conditions={conditions}
        recommendation={recommendation}
        onChangeRecommendation={setRecommendation}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={state.isSavedView && state.savedTripId ? handleDelete : undefined}
        isSaving={saveMutation.isPending}
        isDeleting={deleteMutation.isPending}
        saveLabel={saveLabel}
      />

      {(saveMutation.isError || deleteMutation.isError) && (
        <p className="text-error text-label-md text-center mt-stack-md">
          저장에 실패했습니다.
        </p>
      )}
    </div>
  );
}

const AUTO_FLIGHT_ITEM_PREFIX = "selected-flight-";

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
      (item) => !item.itemKey.startsWith(AUTO_FLIGHT_ITEM_PREFIX),
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
    nextDays[0] = {
      ...nextDays[0],
      items: [
        createFlightScheduleItem(
          "outbound",
          flightSelection.outboundFlight,
          "가는 항공",
          flightSelection.outboundFlight.arrivalTime,
        ),
        ...nextDays[0].items,
      ],
    };
  }

  if (flightSelection.returnFlight) {
    const lastDayIndex = nextDays.length - 1;

    nextDays[lastDayIndex] = {
      ...nextDays[lastDayIndex],
      items: [
        ...nextDays[lastDayIndex].items,
        createFlightScheduleItem(
          "return",
          flightSelection.returnFlight,
          "오는 항공",
          flightSelection.returnFlight.departureTime,
        ),
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

function getFlightTimeSlot(time?: string) {
  const hour = Number(time?.slice(0, 2));

  if (Number.isNaN(hour)) return "Morning";
  if (hour < 12) return "Morning";
  if (hour < 14) return "Lunch";
  if (hour < 18) return "Afternoon";
  if (hour < 22) return "Dinner";
  return "Night";
}

function formatFlightTime(time?: string) {
  return time?.slice(0, 5) ?? "--:--";
}
