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

    const start = new Date(spots[0].visitAt).getTime();
    const end = new Date(spots[spots.length - 1].visitAt).getTime();

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
      className="timeline-track"
      onMouseDown={handleMouseDown}
      style={{
        position: "relative",
        flex: 1,
        width: "100%",
        height: "40px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* 선 */}
      <div
        className="timeline-line"
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "6px",
          transform: "translateY(-50%)",
          borderRadius: "999px",
          background: "#d9d9d9",
        }}
      />

      {/* Spot */}
      {spots.map((spot) => {
        const position =
          (new Date(spot.visitAt).getTime() - startTime) / duration;

        return (
          <div
            key={spot.sno}
            className="timeline-spot"
            style={{
              position: "absolute",
              left: `${position * 100}%`,
              top: "50%",
              width: "12px",
              height: "12px",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "#666",
              zIndex: 102,
            }}
          />
        );
      })}

      {/* Cursor */}
      <div
        className="timeline-cursor"
        style={{
          position: "absolute",
          left: `${progress * 100}%`,
          top: "50%",
          width: "18px",
          height: "18px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "#1976d2",
          border: "3px solid white",
          boxShadow: "0 2px 8px rgba(0,0,0,.25)",
          zIndex: 103,
        }}
      />
    </div>
  );
};

export default TimelineTrack;
