import { create } from "zustand";

export type SidebarMode = "list" | "gallery" | "stats" | "media";

interface SidebarState {
  mode: SidebarMode;
  previousMode: Exclude<SidebarMode, "media">;
  gallerySpotId?: number;
  expandedSpotId?: number;
  setMode: (mode: SidebarMode) => void;
  setExpandedSpot: (sno: number) => void;
  setGallerySpotId: (sno: number) => void;
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
  setMode: (mode) =>
    set({
      mode,
    }),
  setGallerySpotId: (sno) =>
    set({
      gallerySpotId: sno,
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
