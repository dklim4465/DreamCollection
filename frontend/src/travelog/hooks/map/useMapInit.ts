import { RefObject, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "@/travelog/map/useMap";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const useMapInit = (mapContainer: RefObject<HTMLDivElement | null>) => {
  const { map, setMap } = useMap();

  useEffect(() => {
    if (!mapContainer.current) return;

    if (map) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [126.978, 37.5665],
      zoom: 13,
    });

    setMap(mapInstance);

    mapInstance.on("style.load", () => {
      // Globe 모드 on/off
      mapInstance.setProjection("globe");

      // 브라우저 언어 적용
      const language = navigator.language.split("-")[0];
      mapInstance.setConfigProperty("basemap", "language", language);

      // 브라우저 다크모드 적용
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      mapInstance.setConfigProperty(
        "basemap",
        "lightPreset",
        isDark ? "night" : "day",
      );

      // 베이스 폰트 지정
      mapInstance.setConfigProperty("basemap", "font", "Noto Sans CJK JP");

      mapInstance.addSource("spots", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 10,
      });

      mapInstance.addSource("spot-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
          properties: {},
        },
      });

      mapInstance.addLayer({
        id: "spot-line",
        type: "line",
        source: "spot-line",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#00BFFF",
          "line-width": 4,
          "line-opacity": 1,
        },
      });

      mapInstance.addLayer({
        id: "spot-circle",
        type: "circle",
        source: "spots",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 8,
          "circle-color": "#3b82f6",
        },
      });

      mapInstance.addLayer({
        id: "spot-cluster",
        type: "circle",
        source: "spots",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 20,
          "circle-color": "#10b981",
        },
      });

      mapInstance.addLayer({
        id: "spot-count",
        type: "symbol",
        source: "spots",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 14,
        },
      });
    });

    return () => {
      mapInstance.remove();
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = (e: MediaQueryListEvent) => {
      map.setConfigProperty(
        "basemap",
        "lightPreset",
        e.matches ? "night" : "day",
      );
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [map]);
};
