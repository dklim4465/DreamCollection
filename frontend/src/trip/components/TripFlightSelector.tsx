import LoadingSpinner from "@/common/component/LoadingSpinner";
import type {
  FlightOffer,
  FlightSelection,
  FlightSegment,
} from "@/trip/api/trip";

export interface TripFlightSelectorProps {
  loading: boolean;
  isError: boolean;
  flights: FlightOffer[];
  selectedFlight: FlightSelection | null;
  onSelect: (flight: FlightOffer) => void;
}

function TripFlightSelector({
  loading,
  isError,
  flights,
  selectedFlight,
  onSelect,
}: TripFlightSelectorProps) {
  return (
    <div className="mt-stack-lg space-y-stack-sm">
      {loading && <LoadingSpinner message="항공 검색 중..." />}

      {isError && (
        <p className="rounded-lg border border-error/30 bg-error/5 p-stack-md text-label-md text-error">
          항공 추천을 불러오지 못했습니다.
        </p>
      )}

      {!loading && !isError && flights.length === 0 && (
        <p className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-stack-md text-label-md text-on-surface-variant">
          선택할 수 있는 항공 추천이 없습니다.
        </p>
      )}

      {flights.map((flight, index) => (
        <FlightOfferCard
          key={`${flight.outboundFlight?.flightNumber ?? "outbound"}-${flight.returnFlight?.flightNumber ?? "return"}-${index}`}
          flight={flight}
          index={index}
          selected={isSameFlight(selectedFlight, flight)}
          onSelect={() => onSelect(flight)}
        />
      ))}
    </div>
  );
}

export default TripFlightSelector;

function FlightOfferCard({
  flight,
  index,
  selected,
  onSelect,
}: {
  flight: FlightOffer;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-lg border bg-surface-container-lowest p-stack-md text-left transition",
        selected
          ? "border-primary ring-2 ring-primary/15"
          : "border-outline-variant/70 hover:border-primary/60",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-stack-sm">
        <div>
          <p className="text-label-md font-bold text-primary">
            추천 항공 {index + 1}
          </p>
          <h2 className="mt-1 text-body-lg font-bold text-on-surface">
            {flight.provider ?? "항공 추천"}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-body-lg font-bold text-on-surface">
            {formatPrice(flight.price, flight.currency)}
          </p>
          <p className="text-label-md text-on-surface-variant">
            총 {formatDuration(getTotalDuration(flight))}
          </p>
        </div>
      </div>

      <div className="mt-stack-md grid gap-stack-sm lg:grid-cols-2">
        <FlightSegmentSummary label="가는 편" segment={flight.outboundFlight} />
        <FlightSegmentSummary label="오는 편" segment={flight.returnFlight} />
      </div>
    </button>
  );
}

function FlightSegmentSummary({
  label,
  segment,
}: {
  label: string;
  segment?: FlightSegment;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low p-stack-sm">
      <p className="text-label-md font-bold text-primary">{label}</p>
      <div className="mt-1 flex items-center gap-stack-sm text-body-md font-bold text-on-surface">
        <span>{segment?.departureAirportCode ?? "-"}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          arrow_forward
        </span>
        <span>{segment?.arrivalAirportCode ?? "-"}</span>
      </div>
      <p className="mt-1 text-label-md text-on-surface-variant">
        {formatDateTime(segment?.departureDate, segment?.departureTime)} -{" "}
        {formatDateTime(segment?.arrivalDate, segment?.arrivalTime)}
      </p>
      <p className="mt-1 text-label-md text-on-surface-variant">
        {segment?.airlineName ?? "항공사 미정"}{" "}
        {segment?.flightNumber ? `(${segment.flightNumber})` : ""}
      </p>
    </div>
  );
}

function getTotalDuration(flight: FlightOffer) {
  return (
    (flight.outboundFlight?.durationMinutes ?? 0) +
    (flight.returnFlight?.durationMinutes ?? 0)
  );
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
  if (price == null) return "가격 미정";

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDateTime(date?: string, time?: string) {
  return [date, time?.slice(0, 5)].filter(Boolean).join(" ") || "-";
}

function isSameFlight(selected: FlightSelection | null, flight: FlightOffer) {
  if (!selected || selected.skipped) return false;

  return (
    selected.outboundFlight?.flightNumber ===
      flight.outboundFlight?.flightNumber &&
    selected.returnFlight?.flightNumber === flight.returnFlight?.flightNumber &&
    selected.price === flight.price
  );
}
