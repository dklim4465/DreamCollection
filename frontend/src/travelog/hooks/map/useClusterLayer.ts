import { useMap } from "@/travelog/map/useMap";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { GeoJSONSource } from "mapbox-gl";
import { useEffect } from "react";

type Props = {
  visible: boolean;
};

export const useClusterLayer = ({ visible }: Props) => {
  const { map } = useMap();

  const spots = useSpotStore((state) => state.spots);

  useEffect(() => {
    if (!map) return;

    const source = map.getSource("spots") as GeoJSONSource | undefined;

    if (!source) return;

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
  }, [map, spots]);

  useEffect(() => {
    if (!map) return;

    const visibility = visible ? "visible" : "none";

    ["spot-circle", "spot-cluster", "spot-count"].forEach((layerId) => {
      if (!map.getLayer(layerId)) return;

      map.setLayoutProperty(layerId, "visibility", visibility);
    });
  }, [map, visible]);
};
