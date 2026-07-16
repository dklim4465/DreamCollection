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
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* 지도 */}
      <div className="absolute inset-0">
        <MapComponent />
      </div>

      {/* 사이드바 */}
      <MapSidebarComponent />

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
