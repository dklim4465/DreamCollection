import apiClient from './client';
import type { ApiResponse, PageResponse, DestinationCard } from '@/types';

export const destinationsApi = {
  getMonthly: () =>
    apiClient.get<ApiResponse<DestinationCard[]>>('/destinations/monthly'),
  getById: (id: number) =>
    apiClient.get<ApiResponse<DestinationCard>>(`/destinations/${id}`),
  search: (keyword: string, page = 0) =>
    apiClient.get<ApiResponse<PageResponse<DestinationCard>>>('/destinations/search', {
      params: { keyword, page },
    }),
};
