import { useEffect, useRef } from "react";
import { useSpotLayer } from "@/travelog/hooks/map/useSpotLayer";
import { useMapInit } from "@/travelog/hooks/map/useMapInit";
import { useMap } from "@/travelog/map/useMap";

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const { map } = useMap();

  useMapInit(mapContainer);

  useSpotLayer();

  useEffect(() => {
    if (!map) return;

    const handleSytleLoad = () => {
      console.log("context map:", map.getStyle());
    };

    map.once("style.load", handleSytleLoad);

    return () => {
      map.off("style.load", handleSytleLoad);
    };
  }, [map]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default MapComponent;
