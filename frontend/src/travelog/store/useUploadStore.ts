import { create } from "zustand";

interface UploadState {
  uploading: boolean;
  totalFiles: number;
  uploadedFiles: number;
  currentTrip: number | null;
  error: string | null;
  start: (trip: number, totalFiles: number) => void;
  update: (uploadFiles: number) => void;
  finish: () => void;
  fail: (message: string) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploading: false,
  totalFiles: 0,
  uploadedFiles: 0,
  currentTrip: null,
  error: null,
  start: (trip, totalFiles) =>
    set({
      uploading: true,
      currentTrip: trip,
      totalFiles,
      uploadedFiles: 0,
      error: null,
    }),
  update: (uploadedFiles) => set({ uploadedFiles }),
  finish: () =>
    set((state) => ({ uploading: false, uploadedFiles: state.totalFiles })),
  fail: (message) => set({ uploading: false, error: message }),
  reset: () =>
    set({
      uploading: false,
      totalFiles: 0,
      uploadedFiles: 0,
      currentTrip: null,
      error: null,
    }),
}));
