import { useTimelineStore } from "@/travelog/store/useTimelineStore";

const TimelinePlayButton = () => {
  const playing = useTimelineStore((state) => state.playing);
  const togglePlaying = useTimelineStore((state) => state.togglePlaying);

  return (
    <button className="timeline-play-button" onClick={togglePlaying}>
      {playing ? "⏸" : "▶"}
    </button>
  );
};

export default TimelinePlayButton;
