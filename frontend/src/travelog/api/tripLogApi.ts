import apiClient from "@/common/api/client";
import {
  TripLogOverviewDTO,
  TripLogRequestDTO,
  TripLogResponseDTO,
} from "@/travelog/types/tripLog";

export const registerTripLog = async (
  request: TripLogRequestDTO,
): Promise<number> => {
  const res = await apiClient.post("/triplog/", request);
  return res.data.result;
};

export const getTripLog = async (tno: number): Promise<TripLogResponseDTO> => {
  const res = await apiClient.get(`/triplog/${tno}`);
  return res.data;
};

export const updateTripLog = async (
  tno: number,
  request: TripLogRequestDTO,
) => {
  const res = await apiClient.put(`/triplog/${tno}`, request);
  return res.data;
};

export const deleteTripLog = async (tno: number) => {
  const res = await apiClient.delete(`/triplog/${tno}`);
  return res.data;
};

export const getListTripLog = async (): Promise<TripLogResponseDTO[]> => {
  const res = await apiClient.get(`/triplog/list`);
  return res.data;
};

export const getTripLogOverview = async (
  tno: number,
): Promise<TripLogOverviewDTO> => {
  const res = await apiClient.get(`/triplog/overview/${tno}`);
  return res.data;
};
