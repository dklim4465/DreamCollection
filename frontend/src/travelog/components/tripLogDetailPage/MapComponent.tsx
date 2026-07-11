import { useEffect, useRef } from "react";
import { useSpotLayer } from "@/travelog/hooks/map/useSpotLayer";
import { useMapInit } from "@/travelog/hooks/map/useMapInit";
import { useMap } from "@/travelog/map/useMap";
import { useZoomLayerController } from "@/travelog/hooks/map/useZoomLayerController";
import { useClusterLayer } from "@/travelog/hooks/map/useClusterLayer";
import { useMediaLayer } from "@/travelog/hooks/map/useMediaLayer";

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const { map } = useMap();

  const { showCluster, showSpot, showMedia } = useZoomLayerController();

  useMapInit(mapContainer);
  useClusterLayer({ visible: showCluster });
  useSpotLayer({ visible: showSpot });
  useMediaLayer({ visible: showMedia });

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
