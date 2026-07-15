import { ReactNode, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapContext } from "@/travelog/map/MapContext";

interface Props {
  children: ReactNode;
}

export const MapProvider = ({ children }: Props) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
