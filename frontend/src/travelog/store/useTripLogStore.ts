import { create } from "zustand";

interface TripLogInfo {
  tno: number;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  thumbnailPath?: string | null;
}

interface TripLogStore {
  tripLog: TripLogInfo | null;
  setTrip: (tripLog: TripLogInfo) => void;
  changeThumbnail: (thumbnailPath: string) => void;
  clearTrip: () => void;
}

export const useTripLogStore = create<TripLogStore>((set) => ({
  tripLog: null,
  setTrip: (tripLog) => set({ tripLog }),
  changeThumbnail: (thumbnailPath) =>
    set((state) => ({
      tripLog: state.tripLog ? { ...state.tripLog, thumbnailPath } : null,
    })),
  clearTrip: () => set({ tripLog: null }),
}));
