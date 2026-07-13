import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "@/travelog/api/mediaApi";

interface UploadMediaRequest {
  tno: number;
  files: File[];
}

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: ({ tno, files }: UploadMediaRequest) => uploadMedia(tno, files),
  });
};
