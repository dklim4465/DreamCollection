import { create } from "zustand";

interface TripLogInfo {
  tno: number;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface TripLogStore {
  tripLog: TripLogInfo | null;
  setTrip: (tripLog: TripLogInfo) => void;
  clearTrip: () => void;
}

export const useTripLogStore = create<TripLogStore>((set) => ({
  tripLog: null,
  setTrip: (tripLog) => set({ tripLog }),
  clearTrip: () => set({ tripLog: null }),
}));
