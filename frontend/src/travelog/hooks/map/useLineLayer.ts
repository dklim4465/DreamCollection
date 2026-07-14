import { useMap } from "@/travelog/map/useMap";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useEffect } from "react";

interface Props {
  visible: boolean;
}

export const useLineLayer = ({ visible }: Props) => {
  const { map } = useMap();

  const spots = useSpotStore((state) => state.spots);

  useEffect(() => {
    if (!map) return;

    const source = map.getSource("spot-line") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const coordinates = [...spots]
      .sort(
        (a, b) => new Date(a.visitAt).getTime() - new Date(b.visitAt).getTime(),
      )
      .map((spot) => spot.centerLocation.coordinates);

    source.setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: {},
    });
  }, [map, spots]);
};
