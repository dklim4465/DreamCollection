import { useMap } from "@/travelog/map/useMap";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useTimelineStore } from "@/travelog/store/useTimelineStore";
import { useEffect } from "react";

export const useTimelineFollow = () => {
  const { map } = useMap();

  const spots = useSpotStore((state) => state.spots);

  const progress = useTimelineStore((state) => state.progress);
  const playing = useTimelineStore((state) => state.playing);

  useEffect(() => {
    if (!playing && progress === 0) return;
    if (!map || spots.length === 0) return;

    if (spots.length === 1) {
      map.jumpTo({
        center: spots[0].centerLocation.coordinates,
      });
      return;
    }

    const lastSpot = spots[spots.length - 1];

    const startTime = new Date(spots[0].visitAt).getTime();
    const endTime = new Date(lastSpot.leaveAt ?? lastSpot.visitAt).getTime();

    const currentTime = startTime + progress * (endTime - startTime);

    for (let i = 0; i < spots.length - 1; i++) {
      const current = spots[i];
      const next = spots[i + 1];

      const visit = new Date(current.visitAt).getTime();
      const leave = new Date(current.leaveAt ?? current.visitAt).getTime();
      const nextVisit = new Date(next.visitAt).getTime();

      if (currentTime >= visit && currentTime <= leave) {
        map.jumpTo({
          center: current.centerLocation.coordinates,
          zoom: Math.max(map.getZoom(), 14),
        });
        return;
      }

      if (currentTime > leave && currentTime <= nextVisit) {
        const t = (currentTime - leave) / (nextVisit - leave);

        const fromCoord = current.centerLocation.coordinates;
        const toCoord = next.centerLocation.coordinates;

        const lng = fromCoord[0] + (toCoord[0] - fromCoord[0]) * t;
        const lat = fromCoord[1] + (toCoord[1] - fromCoord[1]) * t;

        map.jumpTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 14),
        });
      }
    }

    const lastVisit = new Date(lastSpot.visitAt).getTime();
    const lastLeave = new Date(lastSpot.leaveAt ?? lastSpot.visitAt).getTime();

    if (currentTime >= lastVisit && currentTime <= lastLeave) {
      map.jumpTo({
        center: lastSpot.centerLocation.coordinates,
        zoom: Math.max(map.getZoom(), 14),
      });

      return;
    }
  }, [map, spots, progress]);
};
