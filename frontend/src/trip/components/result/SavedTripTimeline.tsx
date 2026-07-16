import { useMemo, useState } from "react";
import type { SavedTrip } from "@/trip/api/trip";
import SavedTripTimelineItem from "./SavedTripTimelineItem";
import { buildSavedTripTimeline } from "./savedTripTimelineMapper";

interface Props {
  trip: SavedTrip;
}

export default function SavedTripTimeline({ trip }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const days = useMemo(() => buildSavedTripTimeline(trip), [trip]);

  const handleToggle = (itemId: string) => {
    setExpandedId((current) => (current === itemId ? null : itemId));
  };

  return (
    <section className="overflow-hidden rounded-md border border-outline-variant/60 bg-surface-container-lowest">
      <div className="border-b border-outline-variant/60 px-stack-md py-stack-md">
        <h2 className="text-headline-sm font-bold text-on-surface">
          전체 일정
        </h2>
      </div>

      <div>
        {days.map((day) => (
          <section key={day.dayNumber}>
            <div className="flex items-center gap-stack-sm border-b border-outline-variant/50 bg-surface-container-low px-stack-md py-stack-sm">
              <strong className="text-body-md font-bold text-primary">
                DAY {day.dayNumber}
              </strong>
              <span className="text-label-md font-semibold text-on-surface-variant">
                {day.title}
              </span>
            </div>

            {day.items.length === 0 ? (
              <p className="border-b border-outline-variant/50 px-stack-md py-stack-lg text-center text-label-md text-on-surface-variant">
                등록된 일정이 없습니다.
              </p>
            ) : (
              <div>
                {day.items.map((item) => {
                  const itemId = `${day.dayNumber}-${item.id}`;

                  return (
                    <SavedTripTimelineItem
                      key={itemId}
                      item={item}
                      expanded={expandedId === itemId}
                      onToggle={() => handleToggle(itemId)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
