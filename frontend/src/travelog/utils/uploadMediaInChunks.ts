import { uploadMedia } from "@/travelog/api/mediaApi";

const CHUNK_SIZE = 20;

export const uploadMediaInChunks = async (
  tno: number,
  files: File[],
  onProgress?: (progress: number) => void,
) => {
  const total = Math.ceil(files.length / CHUNK_SIZE);

  for (let i = 0; i < total; i++) {
    const chunk = files.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

    await uploadMedia(tno, chunk);

    onProgress?.(((i + 1) / total) * 100);
  }
};
