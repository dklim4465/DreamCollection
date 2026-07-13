import { getTripLogOverview } from "@/travelog/api/tripLogApi";
import MapComponent from "@/travelog/components/tripLogDetailPage/MapComponent";
import { useMediaStore } from "@/travelog/store/useMediaStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useTripLogStore } from "@/travelog/store/useTripLogStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const TripLogDetailPage = () => {
  const { tno } = useParams();

  const setTrip = useTripLogStore((state) => state.setTrip);
  const setSpots = useSpotStore((state) => state.setSpots);
  const setMedia = useMediaStore((state) => state.setMedia);

  useEffect(() => {
    if (!tno) return;

    const load = async () => {
      const overview = await getTripLogOverview(Number(tno));

      setTrip({
        tno: overview.tno,
        title: overview.title,
        startDate: overview.startDate,
        endDate: overview.endDate,
      });

      setSpots(overview.spots);
      setMedia(overview.spots);
    };

    load();
  }, [tno]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <MapComponent />
      </div>

      <div style={{ width: "100px" }}>Sidebar</div>
    </div>
  );
};

export default TripLogDetailPage;
