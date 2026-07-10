import { useMap } from "@/travelog/map/useMap";
import { useEffect } from "react";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import { useSpotStore } from "@/travelog/store/useSpotStore";

export const useSpotLayer = () => {
  const { map } = useMap();

  const spots = useSpotStore((state) => state.spots);

  useEffect(() => {
    if (!map) return;

    const initializeLayer = () => {
      if (map.getSource("spots")) return;

      map.addSource("spots", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "spot-circle",
        type: "circle",
        source: "spots",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 8,
          "circle-color": "#3b82f6",
        },
      });

      map.addLayer({
        id: "spot-cluster",
        type: "circle",
        source: "spots",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 20,
          "circle-color": "#10b981",
        },
      });

      map.addLayer({
        id: "spot-count",
        type: "symbol",
        source: "spots",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 14,
        },
      });
    };

    if (map.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.once("style.load", initializeLayer);
    }

    return () => {
      if (!map.getStyle()) return;

      map.off("style.load", initializeLayer);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const updateSource = () => {
      const source = map.getSource("spots") as GeoJSONSource;

      if (!source) return;

      console.log(spots);

      console.log({
        type: "FeatureCollection",
        features: spots.map((spot) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: spot.centerLocation.coordinates,
          },
          properties: {
            sno: spot.sno,
            name: spot.name,
          },
        })),
      });

      source.setData({
        type: "FeatureCollection",
        features: spots.map((spot) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: spot.centerLocation.coordinates,
          },
          properties: {
            sno: spot.sno,
            name: spot.name,
          },
        })),
      });
    };

    updateSource();

    return () => {
      map.off("style.load", updateSource);
    };
  }, [map, spots]);
};
