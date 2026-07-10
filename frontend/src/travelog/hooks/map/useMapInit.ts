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
