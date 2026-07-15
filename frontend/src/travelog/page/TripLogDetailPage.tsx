import MapComponent from "@/travelog/components/tripLogDetailPage/MapComponent";
import MapSidebarComponent from "@/travelog/components/tripLogDetailPage/MapSidebarComponent";
import TimelineBar from "@/travelog/components/tripLogDetailPage/TimelineBar";
import { refreshTripLogOverview } from "@/travelog/utils/refreshTripLogOverview";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const TripLogDetailPage = () => {
  const { tno } = useParams();

  console.log(tno);

  useEffect(() => {
    if (!tno) return;

    const load = async () => {
      await refreshTripLogOverview(Number(tno));
    };

    load();
  }, [tno]);

  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      className="triplog-detail-page"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        className="triplog-content"
      >
        <div
          style={{ width: "100%", height: "100%" }}
          className="map-container"
        >
          <MapComponent />
        </div>

        <MapSidebarComponent />

        <div
          style={{
            position: "absolute",
            left: "24px",
            right: "324px",
            bottom: "24px",
            height: "72px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "0 20px",

            borderRadius: "18px",

            background: "rgba(255, 255, 255, .95)",
            backdropFilter: "blur(12px)",

            boxShadow: "0 8px 24px rgba(0,0,0,.15)",

            zIndex: 100,
          }}
        >
          <TimelineBar />
        </div>
      </div>
    </div>
  );
};

export default TripLogDetailPage;
