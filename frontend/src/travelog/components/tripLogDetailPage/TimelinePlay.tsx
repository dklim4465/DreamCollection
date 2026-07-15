import { useTimelineStore } from "@/travelog/store/useTimelineStore";

const TimelinePlayButton = () => {
  const playing = useTimelineStore((state) => state.playing);
  const togglePlaying = useTimelineStore((state) => state.togglePlaying);

  return (
    <button
      onClick={togglePlaying}
      className="
        flex
        h-6
        w-6
        items-center
        justify-center
        rounded-full
        bg-primary
        text-on-primary
        text-xl
        shadow-md
        transition
        hover:opacity-90
        active:scale-95
      "
    >
      <span className="material-symbols-outlined">
        {playing ? "pause" : "play_arrow"}
      </span>
    </button>
  );
};

export default TimelinePlayButton;
