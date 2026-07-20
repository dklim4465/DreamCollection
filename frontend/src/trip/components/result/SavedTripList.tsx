import { useNavigate } from "react-router-dom";
import type { SavedTrip } from "@/trip/api/trip";

interface Props {
  savedTrips: SavedTrip[];
}

export default function SavedTripList({ savedTrips }: Props) {
  const navigate = useNavigate();

  const handleOpen = (savedTrip: SavedTrip) => {
    navigate(`/trip/saved/${savedTrip.savedTripId}`);
  };
  //결과 보려고 이동했을때 아래 버튼 두개 숨기기

  return (
    <div className="grid gap-stack-md">
      {savedTrips.map((savedTrip) => (
        <button
          key={savedTrip.savedTripId}
          type="button"
          onClick={() => handleOpen(savedTrip)}
          className="trip-surface w-full p-stack-lg text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex justify-between gap-stack-md">
            <div>
              <p className="text-label-md font-semibold text-tertiary">
                {savedTrip.conditions.region} · {savedTrip.conditions.when}
              </p>

              <h2 className="text-headline-sm font-bold mt-1">
                {savedTrip.recommendation.title}
              </h2>

              <p className="text-body-md text-on-surface-variant mt-2">
                {savedTrip.recommendation.summary}
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">chevron_right</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-stack-sm mt-stack-md">
            <span className="chip-primary">{savedTrip.conditions.who}</span>
            <span className="chip-primary">{savedTrip.conditions.theme}</span>
            <span className="chip-primary">{savedTrip.conditions.level}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
