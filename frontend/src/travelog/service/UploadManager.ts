import { useUploadStore } from "@/travelog/store/useUploadStore";
import { refreshTripLogOverview } from "@/travelog/utils/refreshTripLogOverview";
import { uploadMediaInChunks } from "@/travelog/utils/uploadMediaInChunks";

export const startUpload = async (tno: number, files: File[]) => {
  const store = useUploadStore.getState();

  store.start(tno, files.length);

  try {
    await uploadMediaInChunks(tno, files, (uploadedFiles) => {
      useUploadStore.getState().update(uploadedFiles);
    });

    await refreshTripLogOverview(tno);

    useUploadStore.getState().finish();
  } catch (e) {
    useUploadStore.getState().fail("업로드 실패");

    throw e;
  }
};
