import { create } from "zustand";

export type SidebarMode = "list" | "gallery" | "media";

interface SidebarState {
  mode: SidebarMode;
  previousMode: Exclude<SidebarMode, "media">;
  gallerySpotId?: number;
  expandedSpotId?: number;
  setExpandedSpot: (sno: number) => void;
  openGallery: (sno: number) => void;
  closeGallery: () => void;
  openMedia: () => void;
  closeMedia: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  mode: "list",
  previousMode: "list",
  gallerySpotId: undefined,
  expandedSpotId: undefined,
  setExpandedSpot: (sno) => {
    const current = get().expandedSpotId;

    set({ expandedSpotId: current === sno ? undefined : sno });
  },
  openGallery: (sno) =>
    set({
      mode: "gallery",
      gallerySpotId: sno,
    }),
  closeGallery: () =>
    set({
      mode: "list",
      gallerySpotId: undefined,
    }),
  openMedia: () =>
    set((state) => ({
      previousMode: state.mode as Exclude<SidebarMode, "media">,
      mode: "media",
    })),
  closeMedia: () =>
    set((state) => ({
      mode: state.previousMode,
    })),
}));
