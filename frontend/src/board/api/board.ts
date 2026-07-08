import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";
import type {
  BoardPostListItem,
  BoardPostDetail,
  BoardPostCreateRequest,
  BoardPostUpdateRequest,
  BoardComment,
  BoardCommentCreateRequest,
  BoardCommentUpdateRequest,
  BoardLikeResult,
  BoardImage,
  BoardImageCreateRequest,
  Report,
  ReportCreateRequest,
  SpringPage,
} from "@/board/types/board";

// ── 게시글 ──────────────────────────────
export const boardPostApi = {
  getList: (category: string, page = 0, size = 10) =>
    apiClient.get<ApiResponse<SpringPage<BoardPostListItem>>>("/board/posts", {
      params: { category, page, size, sort: "createdAt,desc" },
    }),

  getDetail: (postId: number) =>
    apiClient.get<ApiResponse<BoardPostDetail>>(`/board/posts/${postId}`),

  create: (request: BoardPostCreateRequest) =>
    apiClient.post<ApiResponse<BoardPostDetail>>("/board/posts", request),

  update: (postId: number, request: BoardPostUpdateRequest) =>
    apiClient.put<ApiResponse<BoardPostDetail>>(
      `/board/posts/${postId}`,
      request,
    ),

  delete: (postId: number) =>
    apiClient.delete<ApiResponse<void>>(`/board/posts/${postId}`),
};

// ── 댓글 ──────────────────────────────
export const boardCommentApi = {
  getList: (postId: number) =>
    apiClient.get<ApiResponse<BoardComment[]>>(
      `/board/posts/${postId}/comments`,
    ),

  create: (postId: number, request: BoardCommentCreateRequest) =>
    apiClient.post<ApiResponse<BoardComment>>(
      `/board/posts/${postId}/comments`,
      request,
    ),

  update: (
    postId: number,
    commentId: number,
    request: BoardCommentUpdateRequest,
  ) =>
    apiClient.put<ApiResponse<BoardComment>>(
      `/board/posts/${postId}/comments/${commentId}`,
      request,
    ),

  delete: (postId: number, commentId: number) =>
    apiClient.delete<ApiResponse<void>>(
      `/board/posts/${postId}/comments/${commentId}`,
    ),
};

// ── 좋아요 ──────────────────────────────
export const boardLikeApi = {
  toggle: (postId: number) =>
    apiClient.post<ApiResponse<BoardLikeResult>>(
      `/board/posts/${postId}/likes`,
    ),
};

// ── 이미지 ──────────────────────────────
export const boardImageApi = {
  getList: (postId: number) =>
    apiClient.get<ApiResponse<BoardImage[]>>(`/board/posts/${postId}/images`),

  add: (postId: number, request: BoardImageCreateRequest) =>
    apiClient.post<ApiResponse<BoardImage>>(
      `/board/posts/${postId}/images`,
      request,
    ),

  delete: (postId: number, imageId: number) =>
    apiClient.delete<ApiResponse<void>>(
      `/board/posts/${postId}/images/${imageId}`,
    ),
};

// ── 신고 ──────────────────────────────
export const reportApi = {
  create: (request: ReportCreateRequest) =>
    apiClient.post<ApiResponse<Report>>("/board/reports", request),

  getMy: () => apiClient.get<ApiResponse<Report[]>>("/board/reports/me"),
};
