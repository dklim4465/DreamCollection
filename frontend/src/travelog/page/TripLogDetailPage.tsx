import MapComponent from "@/travelog/components/tripLogDetailPage/MapComponent";
import MapSidebarComponent from "@/travelog/components/tripLogDetailPage/MapSidebarComponent";
import TimelineBar from "@/travelog/components/tripLogDetailPage/TimelineBar";
import {
  refreshSharedTripLog,
  refreshTripLogOverview,
} from "@/travelog/utils/refreshOverview";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const TripLogDetailPage = () => {
  const { tno, token } = useParams();

  const isReadOnly = !!token;

  useEffect(() => {
    const load = async () => {
      if (tno) {
        await refreshTripLogOverview(Number(tno));
      } else if (token) {
        await refreshSharedTripLog(token);
      }
    };

    load();
  }, [tno, token]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* 지도 */}
      <div className="absolute inset-0">
        <MapComponent />
      </div>

      {/* 사이드바 */}
      <MapSidebarComponent readOnly={isReadOnly} />

      {/* 타임라인 */}
      <div
        className="
          absolute
          bottom-6
          left-6
          right-[324px]
          z-30
          flex
          h-[72px]
          items-center
          rounded-2xl
          bg-surface-container-lowest/95
          px-5
          traveler-glow
          backdrop-blur-md
        "
      >
        <TimelineBar />
      </div>
    </div>
  );
};

export default TripLogDetailPage;
