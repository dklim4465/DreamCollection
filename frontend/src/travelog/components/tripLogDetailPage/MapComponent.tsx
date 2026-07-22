import { useEffect, useRef } from "react";
import { useSpotLayer } from "@/travelog/hooks/map/useSpotLayer";
import { useMapInit } from "@/travelog/hooks/map/useMapInit";
import { useMap } from "@/travelog/map/useMap";
import { useZoomLayerController } from "@/travelog/hooks/map/useZoomLayerController";
import { useClusterLayer } from "@/travelog/hooks/map/useClusterLayer";
import { useMediaLayer } from "@/travelog/hooks/map/useMediaLayer";
import { useLineLayer } from "@/travelog/hooks/map/useLineLayer";
import { useTimelineFollow } from "@/travelog/hooks/map/useTimelineFollow";
import { useInitialCamera } from "@/travelog/hooks/map/useInitialCamera";

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const { map } = useMap();

  const { showCluster, showSpot, showMedia, showLine } =
    useZoomLayerController();

  useMapInit(mapContainer);
  useClusterLayer({ visible: showCluster });
  useSpotLayer({ visible: showSpot });
  useLineLayer({ visible: showLine });
  useMediaLayer({ visible: showMedia });

  useInitialCamera();

  useTimelineFollow();

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

  return <div ref={mapContainer} className="h-full w-full" />;
};

export default MapComponent;
