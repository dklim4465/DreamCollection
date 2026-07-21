import { useNavigate } from "react-router-dom";
import type { SavedTrip } from "@/trip/api/trip";
import type { PlaceOption } from "@/trip/api/place";
import TripThumbnail from "@/trip/components/result/TripThumbnail";
import {
  buildTripDisplayTitle,
  buildTripTags,
  collectTripThumbnailCandidates,
  countSchedulePlaces,
  formatTripDateRange,
  getDday,
  getTripScheduleStatus,
} from "@/trip/utils/savedTripListUtils";

interface Props {
  savedTrips: SavedTrip[];
  placesByCity?: Record<string, PlaceOption[]>;
}

function StatusBadge({ trip }: { trip: SavedTrip }) {
  const status = getTripScheduleStatus(trip);
  const dday = getDday(trip.conditions.startDate);

  if (status === "past") {
    return (
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none bg-secondary-container text-on-secondary-container">
        지난
      </span>
    );
  }

  if (dday !== null && dday >= 0) {
    return (
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none bg-tertiary-container text-on-tertiary-container">
        {dday === 0 ? "D-Day" : `D-${dday}`}
      </span>
    );
  }

  return null;
}

export default function SavedTripList({
  savedTrips,
  placesByCity = {},
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-stack-sm md:grid-cols-2">
      {savedTrips.map((trip) => {
        const title = buildTripDisplayTitle(trip);
        const tags = buildTripTags(trip).slice(0, 3);
        const placeCount = countSchedulePlaces(trip);
        const city = trip.conditions.destination?.trim() ?? "";
        const candidates = collectTripThumbnailCandidates(
          trip,
          placesByCity[city] ?? [],
        );

        return (
          <button
            key={trip.savedTripId}
            type="button"
            onClick={() => navigate(`/trip/saved/${trip.savedTripId}`)}
            className="trip-surface flex w-full items-center gap-stack-sm p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-surface-container">
              <TripThumbnail
                candidates={candidates}
                iconClassName="text-[28px]"
              />
              <StatusBadge trip={trip} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h2 className="min-w-0 flex-1 truncate text-title-md font-bold">
                  {title}
                </h2>
                <span className="material-symbols-outlined shrink-0 text-[20px] text-primary">
                  chevron_right
                </span>
              </div>

              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-label-md text-on-surface-variant">
                <span className="truncate">{formatTripDateRange(trip)}</span>
                {trip.conditions.who && (
                  <>
                    <span className="text-outline-variant">·</span>
                    <span className="shrink-0">{trip.conditions.who}</span>
                  </>
                )}
                <span className="text-outline-variant">·</span>
                <span className="inline-flex shrink-0 items-center gap-0.5">
                  <span className="material-symbols-outlined text-[16px]">
                    location_on
                  </span>
                  {placeCount}곳
                </span>
              </div>

              {tags.length > 0 && (
                <div className="mt-2 flex min-w-0 items-center gap-1 overflow-hidden">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="chip-primary shrink-0 !px-2 !py-0.5 text-label-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
