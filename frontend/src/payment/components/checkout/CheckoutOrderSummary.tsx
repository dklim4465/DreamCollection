import type { SavedTrip } from "@/trip/api/trip";
import {
  buildTripDisplayTitle,
  formatTripDateRange,
} from "@/trip/utils/savedTripListUtils";
import { estimateCheckoutTotal } from "@/payment/utils/travelerForm";

interface Props {
  trip: SavedTrip | undefined;
  adultCount: number;
  isLoading?: boolean;
}

export default function CheckoutOrderSummary({
  trip,
  adultCount,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <section className="card-base p-5">
        <p className="text-body-md text-on-surface-variant">
          일정 정보를 불러오는 중...
        </p>
      </section>
    );
  }

  if (!trip) {
    return (
      <section className="card-base p-5">
        <h2 className="text-title-md font-semibold">주문 상품</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          일정 정보를 불러오지 못했습니다.
        </p>
      </section>
    );
  }

  const title = buildTripDisplayTitle(trip);
  const dateRange = formatTripDateRange(trip);
  const flight = trip.flightSelection;
  const hotel = trip.accommodationSelection;
  const flightOk =
    flight && !flight.skipped && flight.price != null && flight.price > 0;
  const hotelOk =
    hotel && !hotel.skipped && hotel.price != null && hotel.price > 0;

  const estimatedTotal = estimateCheckoutTotal({
    flightPrice: flightOk ? flight.price : null,
    hotelPrice: hotelOk ? hotel.price : null,
    adultCount,
  });

  const flightTitle =
    flight?.outboundFlight != null
      ? `${flight.outboundFlight.departureAirportCode} → ${flight.outboundFlight.arrivalAirportCode}`
      : "항공";

  return (
    <section className="card-base p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-title-md font-semibold">주문 상품</h2>
        <p className="mt-2 text-headline-sm font-bold">{title}</p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {dateRange} · 성인 {adultCount}명
        </p>
      </div>

      {(flightOk || hotelOk) && (
        <ul className="flex flex-col gap-2 border-t border-outline-variant/40 pt-4">
          {flightOk && (
            <li className="flex justify-between gap-3 text-body-md">
              <span className="text-on-surface-variant">
                항공 · {flightTitle}
                {adultCount > 0 ? ` × ${adultCount}` : ""}
              </span>
              <span className="font-medium shrink-0">
                {(Math.round(flight.price!) * Math.max(0, adultCount)).toLocaleString(
                  "ko-KR",
                )}
                원
              </span>
            </li>
          )}
          {hotelOk && (
            <li className="flex justify-between gap-3 text-body-md">
              <span className="text-on-surface-variant truncate">
                숙소 · {hotel.accommodationName ?? "숙소"}
              </span>
              <span className="font-medium shrink-0">
                {Math.round(hotel.price!).toLocaleString("ko-KR")}원
              </span>
            </li>
          )}
        </ul>
      )}

      {estimatedTotal != null ? (
        <div className="flex justify-between border-t border-outline-variant/40 pt-4 text-body-md">
          <span className="font-semibold">예상 결제 금액</span>
          <span className="font-bold text-primary">
            {estimatedTotal.toLocaleString("ko-KR")}원
          </span>
        </div>
      ) : (
        <p className="text-label-sm text-on-surface-variant border-t border-outline-variant/40 pt-4">
          상세 금액은 결제 시 확정됩니다.
        </p>
      )}
    </section>
  );
}
