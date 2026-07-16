import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useTimelineStore } from "@/travelog/store/useTimelineStore";
import { useEffect, useMemo, useRef } from "react";

const TimelineTrack = () => {
  const spots = useSpotStore((state) => state.spots);

  const playing = useTimelineStore((state) => state.playing);
  const setPlaying = useTimelineStore((state) => state.setPlaying);
  const progress = useTimelineStore((state) => state.progress);
  const setProgress = useTimelineStore((state) => state.setProgress);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const { startTime, endTime, duration } = useMemo(() => {
    if (spots.length === 0) {
      return {
        startTime: 0,
        endTime: 0,
        duration: 1,
      };
    }

    const lastSpot = spots[spots.length - 1];

    const start = new Date(spots[0].visitAt).getTime();
    const end = new Date(lastSpot.leaveAt ?? lastSpot.visitAt).getTime();

    return {
      startTime: start,
      endTime: end,
      duration: Math.max(end - start, 1),
    };
  }, [spots]);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let last = performance.now();

    const playDuration = 60;

    const animate = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const state = useTimelineStore.getState();

      if (!state.playing) return;

      const next = Math.min(state.progress + dt / playDuration, 1);

      useTimelineStore.setState({
        progress: next,
        playing: next < 1,
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const updateProgress = (clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();

    const nextProgress = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );

    setProgress(nextProgress);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    setPlaying(false);
    updateProgress(e.clientX);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return;

      updateProgress(e.clientX);
    };

    const handleUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      className="
        relative
        h-10
        w-full
        flex-1
        cursor-pointer
        select-none
      "
    >
      {/* 선 */}
      <div
        className="
          absolute
          left-0
          right-0
          top-1/2
          h-1.5
          -translate-y-1/2
          rounded-none
          bg-outline-variant
        "
      />

      {/* Spot */}
      {spots.map((spot) => {
        const visit = new Date(spot.visitAt).getTime();
        const leave = new Date(spot.leaveAt ?? spot.visitAt).getTime();

        const left = ((visit - startTime) / duration) * 100;
        const width = ((leave - visit) / duration) * 100;

        const trackWidth = trackRef.current?.clientWidth ?? 0;
        const minWidthPercent = trackWidth > 0 ? (4 / trackWidth) * 100 : 0;

        const displayWidth = Math.max(width, minWidthPercent);
        const displayLeft = left - (displayWidth - width) / 2;

        return (
          <div
            key={spot.sno}
            className="
                absolute top-1/2 z-10 h-2.5
                -translate-y-1/2
                rounded-none
                bg-secondary/40
              "
            style={{
              left: `${displayLeft}%`,
              width: `${displayWidth}%`,
            }}
          />
        );
        // const position =
        //   (new Date(spot.visitAt).getTime() - startTime) / duration;

        // return (
        //   <div
        //     key={spot.sno}
        //     className="
        //       absolute
        //       top-1/2
        //       z-20
        //       h-3
        //       w-3
        //       -translate-x-1/2
        //       -translate-y-1/2
        //       rounded-full
        //       bg-secondary
        //     "
        //     style={{
        //       left: `${position * 100}%`,
        //     }}
        //   />
        // );
      })}

      {/* Cursor */}
      <div
        className="
          absolute
          top-1/2
          z-30
          h-[18px]
          w-[18px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border-[3px]
          border-white
          bg-primary
          shadow-md
        "
        style={{
          left: `${progress * 100}%`,
        }}
      />
    </div>
  );
};

export default TimelineTrack;
