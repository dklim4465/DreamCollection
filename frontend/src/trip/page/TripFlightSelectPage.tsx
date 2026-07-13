import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TripFlightSelector from "@/trip/components/TripFlightSelector";
import {
  tripApi,
  type FlightOffer,
  type FlightSelection,
  type TripFlowState,
} from "@/trip/api/trip";

interface LocationState extends TripFlowState {}

const priorityLabel: Record<string, string> = {
  PRICE: "저렴한 가격 우선",
  TIME: "최단 여행 시간 우선",
  DIRECT: "직항 우선",
};

export default function TripFlightSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [startDate, setStartDate] = useState(state?.conditions.startDate ?? "");
  const [selectedFlight, setSelectedFlight] = useState<FlightSelection | null>(
    state?.flightSelection ?? null,
  );

  const skipFlight = state?.conditions.flightCondition?.skip;
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

  const priority = state?.conditions.flightCondition?.priority ?? "PRICE";

  const flightQuery = useQuery({
    queryKey: ["flightSearch", flowStateWithDate?.conditions],
    queryFn: () => tripApi.searchFlights(flowStateWithDate!.conditions),
    enabled: !!flowStateWithDate && !skipFlight && hasStartDate,
  });

  const flights = useMemo(() => {
    const offers = flightQuery.data ?? [];

    return [...offers]
      .sort((a, b) => {
        if (priority === "TIME") {
          return getTotalDuration(a) - getTotalDuration(b);
        }

        return getPrice(a) - getPrice(b);
      })
      .slice(0, 5);
  }, [flightQuery.data, priority]);

  useEffect(() => {
    if (!flowStateWithDate || !skipFlight || !hasStartDate) return;

    const flightSelection: FlightSelection = {
      skipped: true,
    };

    navigate("/trip/accommodation", {
      replace: true,
      state: {
        ...flowStateWithDate,
        flightSelection,
      },
    });
  }, [flowStateWithDate, hasStartDate, navigate, skipFlight]);

  if (!state) {
    return <Navigate to="/trip/new" replace />;
  }

  if (skipFlight && hasStartDate) {
    return null;
  }

  const handleDateChange = (value: string) => {
    setStartDate(value);
    setSelectedFlight(null);
  };

  const handleSelectFlight = (offer: FlightOffer) => {
    setSelectedFlight({
      skipped: false,
      ...offer,
    });
  };

  const handleNext = () => {
    if (!flowStateWithDate || !selectedFlight) return;

    navigate("/trip/accommodation", {
      state: {
        ...flowStateWithDate,
        flightSelection: selectedFlight,
      },
    });
  };

  return (
    <div className="space-y-stack-md">
      <section className="card-base border border-outline-variant/60 p-stack-lg">
        <div className="flex items-start gap-stack-sm">
          <span className="material-symbols-outlined text-primary">event</span>
          <div>
            <h1 className="text-headline-sm font-bold text-on-surface">
              여행 날짜 선택
            </h1>
            <p className="mt-1 text-label-md text-on-surface-variant">
              정확한 출발 날짜를 선택하면 항공 추천을 조회합니다.
            </p>
          </div>
        </div>

        <label className="mt-stack-lg block max-w-sm">
          <span className="mb-2 block text-label-md font-bold text-on-surface-variant">
            출발 날짜
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => handleDateChange(event.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-bold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </section>

      {!skipFlight && (
        <section className="card-base border border-outline-variant/60 p-stack-lg">
          <div className="flex items-start gap-stack-sm">
            <span className="material-symbols-outlined text-primary">
              flight_takeoff
            </span>
            <div>
              <h1 className="text-headline-sm font-bold text-on-surface">
                항공 선택
              </h1>
              <p className="mt-1 text-label-md text-on-surface-variant">
                {priorityLabel[priority]} 기준으로 항공 추천을 선택합니다.
              </p>
            </div>
          </div>

          {hasStartDate ? (
            <TripFlightSelector
              loading={flightQuery.isFetching}
              isError={flightQuery.isError}
              flights={flights}
              selectedFlight={selectedFlight}
              onSelect={handleSelectFlight}
            />
          ) : (
            <p className="mt-stack-lg rounded-lg border border-outline-variant/70 bg-surface-container-low p-stack-md text-label-md text-on-surface-variant">
              출발 날짜를 선택하면 항공 추천을 조회합니다.
            </p>
          )}
        </section>
      )}

      <div className="card-base flex items-center justify-between gap-stack-md border border-outline-variant/60 p-stack-md">
        <button
          type="button"
          onClick={() => navigate("/trip/new")}
          className="btn-ghost"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedFlight}
          className="btn-primary min-w-[180px] disabled:opacity-50"
        >
          다음 숙소
          <span className="material-symbols-outlined ml-2 align-[-5px] text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

function getPrice(flight: FlightOffer) {
  return flight.price ?? Number.MAX_SAFE_INTEGER;
}

function getTotalDuration(flight: FlightOffer) {
  return (
    (flight.outboundFlight?.durationMinutes ?? 0) +
    (flight.returnFlight?.durationMinutes ?? 0)
  );
}
