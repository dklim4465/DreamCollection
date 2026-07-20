import LoadingSpinner from "@/common/components/LoadingSpinner";
import type {
  AccommodationOption,
  AccommodationSelection,
} from "@/trip/api/trip";
interface TripAccommodationSelectorProps {
  isLoading: boolean;
  isError: boolean;
  accommodations: AccommodationOption[];
  selectedAccommodation: AccommodationSelection | null;
  onSelect: (accommodation: AccommodationOption) => void;
}

export default function TripAccommodationSelector({
  isLoading,
  isError,
  accommodations,
  selectedAccommodation,
  onSelect,
}: TripAccommodationSelectorProps) {
  return (
    <div className="mt-stack-lg grid gap-stack-md md:grid-cols-2 xl:grid-cols-3">
      {isLoading && (
        <div className="md:col-span-2 xl:col-span-3">
          <LoadingSpinner message="숙소 검색 중..." />
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-error/30 bg-error/5 p-stack-md text-label-md text-error md:col-span-2 xl:col-span-3">
          숙소 추천을 불러오지 못했습니다.
        </p>
      )}

      {!isLoading && !isError && accommodations.length === 0 && (
        <p className="trip-status-message md:col-span-2 xl:col-span-3">
          선택할 수 있는 숙소 추천이 없습니다.
        </p>
      )}

      {accommodations.map((accommodation) => (
        <AccommodationCard
          key={accommodation.accommodationId ?? accommodation.accommodationName}
          accommodation={accommodation}
          selected={isSameAccommodation(selectedAccommodation, accommodation)}
          onSelect={() => onSelect(accommodation)}
        />
      ))}
    </div>
  );
}

function AccommodationCard({
  accommodation,
  selected,
  onSelect,
}: {
  accommodation: AccommodationOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "overflow-hidden rounded-xl border bg-surface-container-lowest text-left shadow-glow transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-outline-variant/50 hover:border-primary/60",
      ].join(" ")}
    >
      {accommodation.imageUrl ? (
        <img
          src={accommodation.imageUrl}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[36px]">hotel</span>
        </div>
      )}

      <div className="p-stack-md">
        <div className="flex items-start justify-between gap-stack-sm">
          <div>
            <p className="text-label-md font-bold text-tertiary">
              {accommodation.accommodationType ?? "숙소"}
            </p>
            <h2 className="mt-1 line-clamp-2 text-body-md font-bold text-on-surface">
              {accommodation.accommodationName ?? "숙소 이름 미정"}
            </h2>
          </div>
          <p className="shrink-0 rounded-lg bg-surface-container-low px-2 py-1 text-label-sm font-bold text-on-surface">
            {formatRating(accommodation.rating)}
          </p>
        </div>

        <p className="mt-stack-sm line-clamp-2 text-label-md text-on-surface-variant">
          {accommodation.address ?? "주소 정보가 없습니다."}
        </p>
        <p className="mt-stack-sm text-body-md font-bold text-on-surface">
          {formatPrice(accommodation.price, accommodation.currency)}
        </p>
      </div>
    </button>
  );
}

function formatPrice(price?: number, currency = "KRW") {
  if (price == null) return "가격 미정";

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatRating(rating?: number) {
  if (rating == null) return "평점 -";
  return `평점 ${rating}`;
}

function isSameAccommodation(
  selected: AccommodationSelection | null,
  accommodation: AccommodationOption,
) {
  if (!selected || selected.skipped) return false;

  if (selected.accommodationId && accommodation.accommodationId) {
    return selected.accommodationId === accommodation.accommodationId;
  }

  return selected.accommodationName === accommodation.accommodationName;
}
