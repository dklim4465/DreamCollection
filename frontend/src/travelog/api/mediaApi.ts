import apiClient from "@/common/api/client";
import { MediaDetailDTO, UploadResultDTO } from "@/travelog/types/tripLog";

export const uploadMedia = async (
  tno: number,
  files: File[],
): Promise<UploadResultDTO> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await apiClient.post(`/media/triplog/${tno}`, formData, {
    headers: { "Content-Type": undefined },
    timeout: 120000,
  });

  return res.data;
};

export const getMedia = async (mno: number): Promise<MediaDetailDTO> => {
  const res = await apiClient.get(`/media/${mno}`);
  return res.data;
};

export const deleteMedia = async (mediaMnos: number[]) => {
  const res = await apiClient.delete(`/media`, { data: mediaMnos });
  return res.data;
};
