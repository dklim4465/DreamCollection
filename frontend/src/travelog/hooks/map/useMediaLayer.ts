import { useMap } from "@/travelog/map/useMap";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useMediaStore } from "@/travelog/store/useMediaStore";
import { useMarkerResize } from "@/travelog/hooks/map/useMarkerResize";
import { getMediaThumbnailUrl } from "@/travelog/utils/media";

type Props = {
  visible: boolean;
};

export const useMediaLayer = ({ visible }: Props) => {
  const { map } = useMap();

  const media = useMediaStore((state) => state.media);

  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    media.forEach((item) => {
      if (markersRef.current.has(item.mno)) return;

      const element = document.createElement("div");
      element.className = "spot-marker";

      element.innerHTML = `
      <div class="spot-marker">
        <img src=${getMediaThumbnailUrl(item)} />
      </div>
      `;

      if (!item.location) return;
      const marker = new mapboxgl.Marker({
        element: element,
        anchor: "bottom",
      }).setLngLat(item.location.coordinates);

      markersRef.current.set(item.mno, marker);

      if (visible) {
        marker.addTo(map);
      }
    });

    markersRef.current.forEach((marker, mno) => {
      const exists = media.some((item) => item.mno === mno);

      if (!exists) {
        marker.remove();
        markersRef.current.delete(mno);
      }
    });
  }, [map, media, visible]);

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
