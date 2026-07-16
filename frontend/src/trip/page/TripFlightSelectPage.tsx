import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TripFlightSelector from "@/trip/components/fliAndAcc/TripFlightSelector";
import "@/trip/styles/trip.css";
import {
  tripApi,
  type FlightOffer,
  type FlightSelection,
  type FlightSegment,
  type TripFlowState,
} from "@/trip/api/trip";
import TripConditionSummaryBar from "@/trip/components/result/planning/TripConditionSummaryBar";

interface LocationState extends TripFlowState {}

export default function TripFlightSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [startDate, setStartDate] = useState(state?.conditions.startDate ?? "");
  const [selectedOutboundFlight, setSelectedOutboundFlight] =
    useState<FlightOffer | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] =
    useState<FlightOffer | null>(null);

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

  const outboundFlightQuery = useQuery({
    queryKey: ["outboundFlightSearch", flowStateWithDate?.conditions],
    queryFn: () => tripApi.searchFlights(flowStateWithDate!.conditions),
    enabled: !!flowStateWithDate && !skipFlight && hasStartDate,
  });

  const returnFlightQuery = useQuery({
    queryKey: [
      "returnFlightSearch",
      flowStateWithDate?.conditions,
      selectedOutboundFlight?.departureToken,
      selectedOutboundFlight?.arrivalAirportCode,
    ],
    queryFn: () =>
      tripApi.searchReturnFlights({
        region: flowStateWithDate!.conditions.region,
        destination: flowStateWithDate!.conditions.destination,
        startDate: flowStateWithDate!.conditions.startDate,
        when: flowStateWithDate!.conditions.when,
        flightCondition: flowStateWithDate!.conditions.flightCondition,
        departureToken: selectedOutboundFlight!.departureToken!,
        arrivalAirportCode: selectedOutboundFlight!.arrivalAirportCode!,
      }),
    enabled:
      !!flowStateWithDate &&
      !skipFlight &&
      hasStartDate &&
      !!selectedOutboundFlight?.departureToken &&
      !!selectedOutboundFlight?.arrivalAirportCode,
  });

  const outboundFlights = useMemo(() => {
    const offers = outboundFlightQuery.data ?? [];

    return [...offers]
      .sort((a, b) => compareFlights(a, b, priority))
      .slice(0, 5);
  }, [outboundFlightQuery.data, priority]);

  const returnFlights = useMemo(() => {
    const offers = returnFlightQuery.data ?? [];

    return [...offers]
      .sort((a, b) => compareFlights(a, b, priority))
      .slice(0, 5);
  }, [returnFlightQuery.data, priority]);

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

  const conditions = state.conditions;
  const outboundSegment = selectedOutboundFlight?.outboundFlight;
  const totalPrice =
    selectedReturnFlight?.price ?? selectedOutboundFlight?.price ?? undefined;
  const totalCurrency =
    selectedReturnFlight?.currency ?? selectedOutboundFlight?.currency;

  const handleDateChange = (value: string) => {
    setStartDate(value);
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
  };

  const handleSelectOutboundFlight = (offer: FlightOffer) => {
    setSelectedOutboundFlight(offer);
    setSelectedReturnFlight(null);
  };

  const handleSelectReturnFlight = (offer: FlightOffer) => {
    setSelectedReturnFlight(offer);
  };

  const handleNext = () => {
    if (
      !flowStateWithDate ||
      !selectedOutboundFlight ||
      !selectedReturnFlight
    ) {
      return;
    }

    const flightSelection: FlightSelection = {
      skipped: false,
      outboundFlight: selectedOutboundFlight.outboundFlight,
      returnFlight: selectedReturnFlight.returnFlight,
      price: selectedReturnFlight.price,
      currency: selectedReturnFlight.currency,
      provider: selectedReturnFlight.provider,
      externalUrl: selectedReturnFlight.externalUrl,
    };

    navigate("/trip/accommodation", {
      state: {
        ...flowStateWithDate,
        flightSelection,
      },
    });
  };

  return (
    <div className="trip-page xl:-mx-10 2xl:-mx-16">
      <TripConditionSummaryBar
        conditions={conditions}
        startDate={startDate}
        expanded={false}
        onStartDateChange={handleDateChange}
        onToggleConditions={() => navigate("/trip/new")}
      />
      <section className="trip-surface border-primary/30 bg-primary/5 p-stack-md">
        <div className="grid gap-stack-md lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px] lg:items-center">
          <SelectedFlightPreview
            title="선택한 가는 편"
            segment={outboundSegment}
            fallback="가는 편을 선택해 주세요"
          />

          <div className="grid grid-cols-2 gap-stack-sm border-y border-outline-variant/50 py-stack-sm lg:border-x lg:border-y-0 lg:px-stack-md">
            <StatusItem
              icon="flight_takeoff"
              label="가는 편"
              active={!!selectedOutboundFlight}
            />
            <StatusItem
              icon="flight_land"
              label="오는 편"
              active={!!selectedReturnFlight}
            />
          </div>

          <div className="text-left lg:text-right">
            <p className="text-label-md font-bold text-on-surface-variant">
              총액
            </p>
            <p className="mt-1 text-title-lg font-bold text-on-surface">
              {formatPrice(totalPrice, totalCurrency)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              성인 1명, 왕복 기준
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-stack-lg xl:grid-cols-2">
        <TripFlightSelector
          label="가는 편 추천"
          routeLabel={`${conditions.region} · ${conditions.destination ?? conditions.region}`}
          loading={outboundFlightQuery.isFetching}
          isError={outboundFlightQuery.isError}
          flights={hasStartDate ? outboundFlights : []}
          selectedFlight={selectedOutboundFlight}
          onSelect={handleSelectOutboundFlight}
          emptyMessage={
            hasStartDate
              ? "선택할 수 있는 가는편 항공 추천이 없습니다."
              : "출발 날짜를 선택하면 항공 추천을 조회합니다."
          }
          priceLabel="예상 최저가"
          priceSuffix="~"
        />

        <TripFlightSelector
          label="오는 편 추천"
          routeLabel={`${conditions.destination ?? conditions.region} · ${conditions.region}`}
          loading={returnFlightQuery.isFetching}
          isError={returnFlightQuery.isError}
          flights={returnFlights}
          selectedFlight={selectedReturnFlight}
          onSelect={handleSelectReturnFlight}
          emptyMessage="선택할 수 있는 오는편 항공 추천이 없습니다."
          priceLabel="왕복 총액"
          disabled={!selectedOutboundFlight}
          disabledMessage="가는편을 선택하면 오는편 항공 추천을 조회합니다."
        />
      </div>

      <div className="trip-action-bar">
        <div className="flex w-full flex-wrap items-center justify-between gap-stack-md">
          <button
            type="button"
            onClick={() => navigate("/trip/new")}
            className="btn-ghost min-w-[120px]"
          >
            <span className="material-symbols-outlined mr-2 align-[-5px] text-[18px]">
              chevron_left
            </span>
            이전
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedOutboundFlight || !selectedReturnFlight}
            className="btn-primary min-w-[220px] disabled:opacity-50"
          >
            선택 완료
            <span className="material-symbols-outlined ml-2 align-[-5px] text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <div className={active ? "text-primary" : "text-on-surface-variant"}>
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
      <p className="mt-1 text-label-md font-bold">{label}</p>
      <p className="text-label-sm">{active ? "선택 완료" : "미선택"}</p>
    </div>
  );
}

function SelectedFlightPreview({
  title,
  segment,
  fallback,
}: {
  title: string;
  segment?: FlightSegment;
  fallback: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-stack-md">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
        <span className="material-symbols-outlined">flight</span>
      </span>
      <div className="min-w-0">
        <p className="text-label-md font-bold text-primary">{title}</p>
        {segment ? (
          <div className="mt-1 flex flex-wrap items-center gap-stack-sm text-on-surface">
            <span className="text-title-lg font-bold">
              {formatTime(segment.departureTime)}
            </span>
            <span className="text-label-md font-bold">
              {segment.departureAirportCode}
            </span>
            <span className="text-label-md text-on-surface-variant">
              {formatDuration(segment.durationMinutes)}
            </span>
            <span className="text-title-lg font-bold">
              {formatTime(segment.arrivalTime)}
            </span>
            <span className="text-label-md font-bold">
              {segment.arrivalAirportCode}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-body-md font-bold text-on-surface">
            {fallback}
          </p>
        )}
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

function compareFlights(a: FlightOffer, b: FlightOffer, priority: string) {
  if (priority === "TIME") {
    return getTotalDuration(a) - getTotalDuration(b);
  }

  return getPrice(a) - getPrice(b);
}

function formatDuration(minutes?: number) {
  if (!minutes) return "-";

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (!hours) return `${remainMinutes}분`;
  if (!remainMinutes) return `${hours}시간`;
  return `${hours}시간 ${remainMinutes}분`;
}

function formatPrice(price?: number, currency = "KRW") {
  if (price == null) return "-";

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatTime(time?: string) {
  return time?.slice(0, 5) ?? "--:--";
}
