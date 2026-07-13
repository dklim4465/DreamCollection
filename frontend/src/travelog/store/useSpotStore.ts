import { SpotDetailDTO } from "@/travelog/types/tripLog";
import { create } from "zustand";

interface SpotStore {
  spots: SpotDetailDTO[];
  selectedSpot: SpotDetailDTO | null;
  setSpots: (spots: SpotDetailDTO[]) => void;
  setSelectedSpot: (spot: SpotDetailDTO) => void;
  clearSpots: () => void;
}

export const useSpotStore = create<SpotStore>((set) => ({
  spots: [],
  selectedSpot: null,
  setSpots: (spots) => set({ spots }),
  setSelectedSpot: (spot) => set({ selectedSpot: spot }),
  clearSpots: () => set({ spots: [], selectedSpot: null }),
}));
