import {
  MediaDetailDTO,
  MediaSummaryDTO,
  SpotDetailDTO,
} from "@/travelog/types/tripLog";
import { create } from "zustand";

interface MediaStore {
  media: MediaSummaryDTO[];
  selectedMedia: MediaDetailDTO | null;
  setMedia: (spots: SpotDetailDTO[]) => void;
  setSelectedMedia: (media: MediaDetailDTO | null) => void;
  clearMedia: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  selectedMedia: null,
  setMedia: (spots) => set({ media: spots.flatMap((spot) => spot.mediaList) }),
  setSelectedMedia: (media) => set({ selectedMedia: media }),
  clearMedia: () => set({ media: [], selectedMedia: null }),
}));
