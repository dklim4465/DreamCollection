import TimelinePlayButton from "@/travelog/components/tripLogDetailPage/TimelinePlay";
import TimelineTrack from "@/travelog/components/tripLogDetailPage/TimelineTrack";

const TimelineBar = () => {
  return (
    <div className="flex w-full items-center">
      <TimelinePlayButton />

      <div className="relative ml-4 flex-1">
        <TimelineTrack />
      </div>
    </div>
  );
};

export default TimelineBar;
