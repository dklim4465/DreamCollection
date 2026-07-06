import apiClient from '@/common/api/client';
import type { ApiResponse, PageResponse, FeedItem } from '@/types';

export const communityApi = {
  getFeed: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<FeedItem>>>('/community/feed', { params: { page, size } }),
  getById: (id: number) =>
    apiClient.get<ApiResponse<FeedItem>>(`/community/${id}`),
  like: (id: number) =>
    apiClient.post(`/community/${id}/like`),
};
