import LoadingSpinner from "@/common/components/LoadingSpinner";
import type { FlightOffer } from "@/trip/api/trip";

export interface TripFlightSelectorProps {
  label: string;
  routeLabel: string;
  loading: boolean;
  isError: boolean;
  flights: FlightOffer[];
  selectedFlight: FlightOffer | null;
  onSelect: (flight: FlightOffer) => void;
  emptyMessage: string;
  priceLabel: string;
  priceSuffix?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

function TripFlightSelector({
  label,
  routeLabel,
  loading,
  isError,
  flights,
  selectedFlight,
  onSelect,
  emptyMessage,
  priceLabel,
  priceSuffix = "",
  disabled = false,
  disabledMessage,
}: TripFlightSelectorProps) {
  return (
    <section className="trip-surface p-stack-md">
      <div className="mb-stack-md flex items-end justify-between gap-stack-sm border-b border-outline-variant/50 pb-stack-sm">
        <div>
          <h2 className="text-body-lg font-bold text-on-surface">{label}</h2>
          <p className="mt-1 text-label-md text-on-surface-variant">
            {routeLabel}
          </p>
        </div>
        <span className="text-label-md font-bold text-on-surface-variant">
          총 {flights.length}개 추천
        </span>
      </div>

      {disabled ? (
        <p className="trip-status-message">{disabledMessage}</p>
      ) : (
        <div className="space-y-2">
          {loading && <LoadingSpinner message="항공 검색 중..." />}

          {isError && (
            <p className="rounded-xl border border-error/30 bg-error/5 p-stack-md text-label-md text-error">
              항공 추천을 불러오지 못했습니다.
            </p>
          )}

          {!loading && !isError && flights.length === 0 && (
            <p className="trip-status-message">{emptyMessage}</p>
          )}

          {flights.map((flight, index) => (
            <FlightOfferCard
              key={`${getSegment(flight)?.flightNumber ?? "flight"}-${index}`}
              flight={flight}
              index={index}
              selected={isSameFlight(selectedFlight, flight)}
              onSelect={() => onSelect(flight)}
              priceLabel={priceLabel}
              priceSuffix={priceSuffix}
            />
          ))}
        </div>
      )}

      <p className="mt-stack-sm flex items-center gap-1 text-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px]">info</span>
        요금은 성인 1인 기준이며, 실시간 변동될 수 있으며 예상 금액과 달라질 수
        있습니다.
      </p>
    </section>
  );
}

export default TripFlightSelector;

function FlightOfferCard({
  flight,
  index,
  selected,
  onSelect,
  priceLabel,
  priceSuffix,
}: {
  flight: FlightOffer;
  index: number;
  selected: boolean;
  onSelect: () => void;
  priceLabel: string;
  priceSuffix: string;
}) {
  const segment = getSegment(flight);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "grid w-full grid-cols-[24px_minmax(92px,0.7fr)_minmax(170px,1.35fr)_minmax(126px,0.85fr)_20px] items-center gap-2 rounded-xl border bg-surface-container-lowest px-3 py-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-outline-variant/50 hover:border-primary/60 hover:bg-surface-container-low",
      ].join(" ")}
    >
      <span
        className={
          selected
            ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary"
            : "h-5 w-5 rounded-full border border-outline-variant bg-surface-container-lowest"
        }
      >
        {selected && (
          <span className="material-symbols-outlined text-[16px]">check</span>
        )}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[20px]">flight</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-label-md font-bold text-on-surface">
            {segment?.airlineName ?? flight.provider ?? "항공 추천"}
          </span>
          <span className="block text-label-sm text-on-surface-variant">
            {segment?.flightNumber ?? `추천 ${index + 1}`}
          </span>
        </span>
      </span>

      <span className="grid min-w-0 grid-cols-[64px_minmax(74px,1fr)_64px] items-center gap-2">
        <FlightTimeBlock
          time={formatTime(segment?.departureTime)}
          code={segment?.departureAirportCode}
        />
        <span className="min-w-0 text-center">
          <span className="block text-label-sm font-bold text-on-surface-variant">
            {formatDuration(segment?.durationMinutes)}
          </span>
          <span className="my-1 block h-px bg-outline-variant/70" />
          <span className="block text-label-sm text-on-surface-variant">
            직항
          </span>
        </span>
        <FlightTimeBlock
          time={formatTime(segment?.arrivalTime)}
          code={segment?.arrivalAirportCode}
        />
      </span>

      <span className="text-right">
        <span className="block whitespace-nowrap text-body-md font-bold text-primary">
          {formatPrice(flight.price, flight.currency)}
          {flight.price == null ? "" : priceSuffix}
        </span>
        <span className="block text-label-sm text-on-surface-variant">
          {priceLabel}
        </span>
      </span>

      <span className="material-symbols-outlined text-[20px] text-primary">
        expand_more
      </span>
    </button>
  );
}

function FlightTimeBlock({ time, code }: { time: string; code?: string }) {
  return (
    <span className="text-center">
      <span className="block text-title-md font-bold text-on-surface">
        {time}
      </span>
      <span className="block text-label-sm font-bold text-on-surface-variant">
        {code ?? "-"}
      </span>
    </span>
  );
}

function getSegment(flight: FlightOffer) {
  return flight.outboundFlight ?? flight.returnFlight;
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

function formatTime(time?: string) {
  return time?.slice(0, 5) ?? "--:--";
}

function isSameFlight(selected: FlightOffer | null, flight: FlightOffer) {
  if (!selected) return false;

  const selectedSegment = getSegment(selected);
  const flightSegment = getSegment(flight);

  return (
    selectedSegment?.flightNumber === flightSegment?.flightNumber &&
    selectedSegment?.departureTime === flightSegment?.departureTime &&
    selectedSegment?.arrivalTime === flightSegment?.arrivalTime &&
    selected.price === flight.price
  );
}
