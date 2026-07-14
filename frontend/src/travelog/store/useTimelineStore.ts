import { create } from "zustand";

interface TimelineState {
  playing: boolean;
  progress: number;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  playing: false,
  progress: 0,
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () =>
    set((state) => {
      if (state.progress >= 1) {
        return {
          progress: 0,
          playing: true,
        };
      }
      return {
        playing: !state.playing,
      };
    }),
  setProgress: (progress) =>
    set({
      progress: Math.max(0, Math.min(1, progress)),
    }),
  reset: () =>
    set({
      playing: false,
      progress: 0,
    }),
}));
