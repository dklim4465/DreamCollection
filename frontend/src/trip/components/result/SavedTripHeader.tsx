import type { SavedTrip } from "@/trip/api/trip";

interface Props {
  trip: SavedTrip;
  onEdit: () => void;
}

export default function SavedTripHeader({ trip, onEdit }: Props) {
  const { conditions, recommendation } = trip;
  const destination =
    conditions.destination ?? conditions.region ?? "여행지 미정";

  return (
    <header className="flex flex-wrap items-start justify-between gap-stack-md">
      <div>
        <h1 className="text-headline-md font-bold text-on-surface">
          {recommendation.title || "나의 여행 일정"}
        </h1>

        <div className="mt-stack-sm flex flex-wrap gap-x-stack-md gap-y-2 text-label-md text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px]">
              location_on
            </span>
            {destination}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px]">
              calendar_month
            </span>
            {conditions.startDate ?? "날짜 미정"} · {conditions.when}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px]">
              person
            </span>
            {conditions.who}
          </span>
        </div>
      </div>

      <div className="flex gap-stack-sm">
        <button
          type="button"
          onClick={onEdit}
          className="btn-ghost inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[19px]">edit</span>
          일정 수정
        </button>
      </div>
    </header>
  );
}
