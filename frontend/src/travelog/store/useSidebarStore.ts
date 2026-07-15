import { create } from "zustand";

export type SidebarMode = "list" | "gallery";

interface SidebarState {
  mode: SidebarMode;
  gallerySpotId?: number;
  expandedSpotId?: number;
  setExpandedSpot: (spotId: number) => void;
  openGallery: (spotId: number) => void;
  closeGallery: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  mode: "list",
  gallerySpotId: undefined,
  expandedSpotId: undefined,
  setExpandedSpot: (spotId) => {
    const current = get().expandedSpotId;

    set({ expandedSpotId: current === spotId ? undefined : spotId });
  },
  openGallery: (spotId) =>
    set({
      mode: "gallery",
      gallerySpotId: spotId,
    }),
  closeGallery: () =>
    set({
      mode: "list",
      gallerySpotId: undefined,
    }),
}));
