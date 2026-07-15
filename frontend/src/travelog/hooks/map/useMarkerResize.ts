import { useEffect } from "react";

interface Props {
  map: mapboxgl.Map | null;
  markersRef: React.MutableRefObject<Map<number, mapboxgl.Marker>>;
}

export const useMarkerResize = ({ map, markersRef }: Props) => {
  useEffect(() => {
    if (!map) return;

    const updateMarkerSize = () => {
      const zoom = map.getZoom();

      // 최소 40px, 최대 80px
      const size = Math.max(40, Math.min(80, 40 + (zoom - 5) * 5));

      markersRef.current.forEach((marker) => {
        const element = marker.getElement();

        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
      });
    };

    updateMarkerSize();

    map.on("zoom", updateMarkerSize);

    return () => {
      map.off("zoom", updateMarkerSize);
    };
  }, [map, markersRef]);
};
