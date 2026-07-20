import apiClient from "@/common/api/client";
import {
  ShareLinkResponseDTO,
  TripLogOverviewDTO,
} from "@/travelog/types/tripLog";

export const createShareLink = async (
  tno: number,
): Promise<ShareLinkResponseDTO> => {
  const res = await apiClient.post(`/share/${tno}`);
  return res.data;
};

export const deactiveShareLink = async (tno: number): Promise<void> => {
  await apiClient.delete(`/share/${tno}`);
};

export const getSharedTripLog = async (
  token: string,
): Promise<TripLogOverviewDTO> => {
  const res = await apiClient.get(`/share/${token}`);
  return res.data;
};
