import { useMap } from "@/travelog/map/useMap";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export const useInitialCamera = () => {
  const { map } = useMap();
  const spots = useSpotStore((state) => state.spots);

  const initialized = useRef(false);

  useEffect(() => {
    if (!map) return;
    if (spots.length === 0) return;
    if (initialized.current) return;

    initialized.current = true;

    const bounds = new mapboxgl.LngLatBounds();

    spots.forEach((spot) => {
      bounds.extend([
        spot.centerLocation.coordinates[0],
        spot.centerLocation.coordinates[1],
      ]);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 100,
        right: 400,
        bottom: 150,
        left: 80,
      },
      maxZoom: 15,
      duration: 800,
    });
  }, [map, spots]);
};
