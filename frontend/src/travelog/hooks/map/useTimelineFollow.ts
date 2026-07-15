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

    const startTime = new Date(spots[0].visitAt).getTime();
    const endTime = new Date(spots[spots.length - 1].visitAt).getTime();

    const currentTime = startTime + progress * (endTime - startTime);

    let from = spots[0];
    let to = spots[1];

    for (let i = 0; i < spots.length - 1; i++) {
      const current = new Date(spots[i].visitAt).getTime();
      const next = new Date(spots[i + 1].visitAt).getTime();

      if (currentTime >= current && currentTime <= next) {
        from = spots[i];
        to = spots[i + 1];
        break;
      }
    }

    const fromTime = new Date(from.visitAt).getTime();
    const toTime = new Date(to.visitAt).getTime();

    const t =
      toTime === fromTime ? 0 : (currentTime - fromTime) / (toTime - fromTime);

    const fromCoord = from.centerLocation.coordinates;
    const toCoord = to.centerLocation.coordinates;

    const lng = fromCoord[0] + (toCoord[0] - fromCoord[0]) * t;
    const lat = fromCoord[1] + (toCoord[1] - fromCoord[1]) * t;

    map.jumpTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 14),
    });
  }, [map, spots, progress]);
};
