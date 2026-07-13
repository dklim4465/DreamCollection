import { createContext } from "react";
import mapboxgl from "mapbox-gl";

export interface MapContextType {
  map: mapboxgl.Map | null;
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>;
}

export const MapContext = createContext<MapContextType | null>(null);
