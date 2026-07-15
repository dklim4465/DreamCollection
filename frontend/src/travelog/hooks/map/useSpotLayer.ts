import { useMap } from "@/travelog/map/useMap";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useMarkerResize } from "@/travelog/hooks/map/useMarkerResize";

type Props = {
  visible: boolean;
};

export const useSpotLayer = ({ visible }: Props) => {
  const { map } = useMap();

  const spots = useSpotStore((state) => state.spots);

  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    spots.forEach((spot) => {
      if (markersRef.current.has(spot.sno)) return;

      const element = document.createElement("div");
      element.className = "spot-marker";

      element.innerHTML = `
      <div class="spot-marker">
        <img src="http://localhost:8080/${spot.coverImagePath}" />
        <div class="spot-pin"></div>
      </div>
      `;

      const marker = new mapboxgl.Marker({
        element: element,
        anchor: "bottom",
      }).setLngLat(spot.centerLocation.coordinates);

      markersRef.current.set(spot.sno, marker);

      if (visible) {
        marker.addTo(map);
      }
    });

    markersRef.current.forEach((marker, sno) => {
      const exists = spots.some((spot) => spot.sno === sno);

      if (!exists) {
        marker.remove();
        markersRef.current.delete(sno);
      }
    });
  }, [map, spots, visible]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => {
      if (visible) {
        if (!marker.getElement().isConnected) {
          marker.addTo(map);
        }
      } else {
        marker.remove();
      }
    });
  }, [map, visible]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, []);

  useMarkerResize({ map, markersRef });
};
