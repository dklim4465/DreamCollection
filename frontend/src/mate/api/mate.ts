import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";
import type {
  MatePostListItem,
  MatePostDetail,
  MatePostCreateRequest,
  MatePostUpdateRequest,
  MateRequest,
  MateRequestDecisionRequest,
  MateReview,
  MateReviewCreateRequest,
  MateScheduleLink,
  MateScheduleLinkCreateRequest,
  SpringPage,
} from "@/mate/types/mate";

export const matePostApi = {
  getList: (status: string, page = 0, size = 9) =>
    apiClient.get<ApiResponse<SpringPage<MatePostListItem>>>("/mate/posts", {
      params: { status, page, size, sort: "createdAt,desc" },
    }),

  getDetail: (matePostId: number) =>
    apiClient.get<ApiResponse<MatePostDetail>>(`/mate/posts/${matePostId}`),

  create: (request: MatePostCreateRequest) =>
    apiClient.post<ApiResponse<MatePostDetail>>("/mate/posts", request),

  update: (matePostId: number, request: MatePostUpdateRequest) =>
    apiClient.put<ApiResponse<MatePostDetail>>(
      `/mate/posts/${matePostId}`,
      request,
    ),

  delete: (matePostId: number) =>
    apiClient.delete<ApiResponse<void>>(`/mate/posts/${matePostId}`),
};

export const mateRequestApi = {
  apply: (matePostId: number, message?: string) =>
    apiClient.post<ApiResponse<MateRequest>>(
      `/mate/posts/${matePostId}/requests`,
      { message },
    ),

  getList: (matePostId: number) =>
    apiClient.get<ApiResponse<MateRequest[]>>(
      `/mate/posts/${matePostId}/requests`,
    ),

  decide: (
    matePostId: number,
    requestId: number,
    request: MateRequestDecisionRequest,
  ) =>
    apiClient.patch<ApiResponse<MateRequest>>(
      `/mate/posts/${matePostId}/requests/${requestId}`,
      request,
    ),

  cancel: (matePostId: number, requestId: number) =>
    apiClient.delete<ApiResponse<void>>(
      `/mate/posts/${matePostId}/requests/${requestId}`,
    ),

  getMyRequests: () =>
    apiClient.get<ApiResponse<MateRequest[]>>("/mate/requests/me"),
};

export const mateReviewApi = {
  create: (request: MateReviewCreateRequest) =>
    apiClient.post<ApiResponse<MateReview>>("/mate/reviews", request),

  getForUser: (userId: number) =>
    apiClient.get<ApiResponse<MateReview[]>>(`/mate/reviews/users/${userId}`),
};

export const mateScheduleLinkApi = {
  create: (matePostId: number, request: MateScheduleLinkCreateRequest) =>
    apiClient.post<ApiResponse<MateScheduleLink>>(
      `/mate/posts/${matePostId}/schedule-links`,
      request,
    ),

  getList: (matePostId: number) =>
    apiClient.get<ApiResponse<MateScheduleLink[]>>(
      `/mate/posts/${matePostId}/schedule-links`,
    ),

  delete: (matePostId: number, linkId: number) =>
    apiClient.delete<ApiResponse<void>>(
      `/mate/posts/${matePostId}/schedule-links/${linkId}`,
    ),
};
