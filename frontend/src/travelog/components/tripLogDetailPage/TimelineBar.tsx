import TimelinePlayButton from "@/travelog/components/tripLogDetailPage/TimelinePlay";
import TimelineTrack from "@/travelog/components/tripLogDetailPage/TimelineTrack";

const TimelineBar = () => {
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <TimelinePlayButton />

      <div style={{ flex: 1, position: "relative", marginLeft: "16px" }}>
        <TimelineTrack />
      </div>
    </div>
  );
};

export default TimelineBar;
