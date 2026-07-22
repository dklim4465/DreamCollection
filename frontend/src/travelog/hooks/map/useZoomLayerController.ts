import { useMap } from "@/travelog/map/useMap";
import { useEffect, useState } from "react";

export const useZoomLayerController = () => {
  const { map } = useMap();

  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    if (!map) return;

    const update = () => {
      setZoom(map.getZoom());
    };

    update();

    map.on("zoom", update);

    return () => {
      map.off("zoom", update);
    };
  }, [map]);

  return {
    showCluster: zoom < 10,
    showSpot: zoom >= 10 && zoom < 14,
    showMedia: zoom >= 14,
    showLine: zoom > 9,
  };
};
